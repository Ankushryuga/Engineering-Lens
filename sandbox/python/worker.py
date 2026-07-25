"""
worker.py — Kafka consumer/producer worker for the Python sandbox pool.

Consumes jobs from `visualize-jobs` (filtered by language == "python"),
executes the submitted code inside a resource-limited subprocess running
tracer.py, and publishes the resulting steps[] trace to `visualize-results`.

Resource limits are enforced two ways:
  - Wall-clock timeout via subprocess.run(timeout=...)
  - Memory cap via `resource.setrlimit(RLIMIT_AS, ...)` in the child process
    (set up in the subprocess's preexec_fn, POSIX only)

This process is the *only* thing running inside the sandbox-python
container, which itself has no network access (see docker-compose.yml) and
runs as a non-root user with a read-only filesystem except /tmp.
"""

import json
import os
import subprocess
import sys
import tempfile
import time
import traceback

from kafka import KafkaConsumer, KafkaProducer

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092").split(",")
JOBS_TOPIC = os.environ.get("KAFKA_JOBS_TOPIC", "visualize-jobs")
RESULTS_TOPIC = os.environ.get("KAFKA_RESULTS_TOPIC", "visualize-results")
GROUP_ID = os.environ.get("KAFKA_GROUP_ID", "sandbox-python")
LANGUAGE_FILTER = os.environ.get("LANGUAGE_FILTER", "python")
MAX_EXEC_SECONDS = float(os.environ.get("MAX_EXEC_SECONDS", "10"))
MAX_MEMORY_MB = int(os.environ.get("MAX_MEMORY_MB", "128"))

TRACER_PATH = os.path.join(os.path.dirname(__file__), "tracer.py")


def _limit_resources():
    """Applied in the child process before exec — caps memory (POSIX only)."""
    try:
        import resource

        mem_bytes = MAX_MEMORY_MB * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))
        # Prevent forking / excessive file descriptors as defense-in-depth
        resource.setrlimit(resource.RLIMIT_NPROC, (32, 32))
        resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
    except Exception:
        pass  # best-effort; not available on all platforms


def execute_code(code: str) -> dict:
    """Runs the user's code through tracer.py in an isolated subprocess."""
    start = time.time()
    try:
        proc = subprocess.run(
            [sys.executable, TRACER_PATH],
            input=code,
            capture_output=True,
            text=True,
            timeout=MAX_EXEC_SECONDS,
            preexec_fn=_limit_resources if os.name == "posix" else None,
        )
    except subprocess.TimeoutExpired:
        return {
            "steps": [],
            "error": f"Execution timed out after {MAX_EXEC_SECONDS}s",
            "duration_ms": (time.time() - start) * 1000,
        }

    duration_ms = (time.time() - start) * 1000

    if proc.returncode != 0:
        stderr_tail = proc.stderr.strip().splitlines()[-1] if proc.stderr.strip() else "unknown error"
        return {"steps": [], "error": f"Sandbox error: {stderr_tail}", "duration_ms": duration_ms}

    try:
        payload = json.loads(proc.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        return {"steps": [], "error": "Failed to parse tracer output", "duration_ms": duration_ms}

    if not payload.get("ok"):
        return {"steps": [], "error": payload.get("error", "unknown error"), "duration_ms": duration_ms}

    return {"steps": payload["steps"], "error": "", "duration_ms": duration_ms}


def main():
    print(f"[sandbox-python] starting worker, group={GROUP_ID}, filter={LANGUAGE_FILTER}", flush=True)

    consumer = KafkaConsumer(
        JOBS_TOPIC,
        bootstrap_servers=KAFKA_BROKERS,
        group_id=GROUP_ID,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True,
    )
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    print("[sandbox-python] ready, consuming jobs...", flush=True)

    for message in consumer:
        job = message.value
        if job.get("language") != LANGUAGE_FILTER:
            continue  # not for this pool

        job_id = job.get("id")
        code = job.get("code", "")
        print(f"[sandbox-python] processing job {job_id}", flush=True)

        try:
            result = execute_code(code)
        except Exception as e:  # noqa: BLE001
            traceback.print_exc()
            result = {"steps": [], "error": f"internal sandbox error: {e}", "duration_ms": 0}

        payload = {
            "job_id": job_id,
            "steps": result["steps"],
            "error": result["error"],
            "language": LANGUAGE_FILTER,
            "duration_ms": result["duration_ms"],
        }
        producer.send(RESULTS_TOPIC, value=payload)
        producer.flush()
        print(f"[sandbox-python] published result for {job_id} ({len(result['steps'])} steps)", flush=True)


if __name__ == "__main__":
    main()
