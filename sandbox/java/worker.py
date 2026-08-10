"""
worker.py — Kafka consumer/producer worker for the Java sandbox pool.

Consumes jobs from `visualize-jobs` (filtered by language == "java"),
compiles + executes the submitted code inside a resource-limited subprocess
pipeline (javac -> java), and publishes the resulting steps[] trace to
`visualize-results`.
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import traceback

from kafka import KafkaConsumer, KafkaProducer

from instrument import instrument

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092").split(",")
JOBS_TOPIC = os.environ.get("KAFKA_JOBS_TOPIC", "visualize-jobs")
RESULTS_TOPIC = os.environ.get("KAFKA_RESULTS_TOPIC", "visualize-results")
GROUP_ID = os.environ.get("KAFKA_GROUP_ID", "sandbox-java")
LANGUAGE_FILTER = os.environ.get("LANGUAGE_FILTER", "java")
MAX_EXEC_SECONDS = float(os.environ.get("MAX_EXEC_SECONDS", "20"))
MAX_COMPILE_SECONDS = float(os.environ.get("MAX_COMPILE_SECONDS", "10"))

PUBLIC_CLASS_RE = re.compile(r"public\s+class\s+(\w+)")


def execute_code(code: str) -> dict:
    start = time.time()

    m = PUBLIC_CLASS_RE.search(code)
    class_name = m.group(1) if m else "Solution"

    instrumented = instrument(code)

    tmp_dir = tempfile.mkdtemp(prefix="algo-java-job-")
    try:
        src_path = os.path.join(tmp_dir, f"{class_name}.java")
        with open(src_path, "w") as f:
            f.write(instrumented)

        try:
            compile_proc = subprocess.run(
                ["javac", src_path],
                capture_output=True,
                text=True,
                timeout=MAX_COMPILE_SECONDS,
                cwd=tmp_dir,
            )
        except subprocess.TimeoutExpired:
            return {"steps": [], "error": f"Compilation timed out after {MAX_COMPILE_SECONDS}s",
                     "duration_ms": (time.time() - start) * 1000}

        if compile_proc.returncode != 0:
            tail = compile_proc.stderr.strip().splitlines()
            msg = tail[-1] if tail else "compilation failed"
            return {"steps": [], "error": f"Compile error: {msg}", "duration_ms": (time.time() - start) * 1000}

        try:
            run_proc = subprocess.run(
                ["java", "-Xmx128m", "-cp", tmp_dir, class_name],
                capture_output=True,
                text=True,
                timeout=MAX_EXEC_SECONDS,
                cwd=tmp_dir,
            )
        except subprocess.TimeoutExpired:
            return {"steps": [], "error": f"Execution timed out after {MAX_EXEC_SECONDS}s",
                     "duration_ms": (time.time() - start) * 1000}

        duration_ms = (time.time() - start) * 1000

        if run_proc.returncode != 0:
            tail = run_proc.stderr.strip().splitlines()
            msg = tail[-1] if tail else "runtime error"
            return {"steps": [], "error": f"Sandbox error: {msg}", "duration_ms": duration_ms}

        marker = "__STEPS_JSON__"
        stdout = run_proc.stdout
        idx = stdout.rfind(marker)
        if idx == -1:
            return {"steps": [{"type": "done", "info": "execution completed — no array-based state changes detected"}],
                     "error": "", "duration_ms": duration_ms}

        json_part = stdout[idx + len(marker):].strip().splitlines()[0]
        try:
            steps = json.loads(json_part)
        except json.JSONDecodeError:
            return {"steps": [], "error": "Failed to parse tracer output", "duration_ms": duration_ms}

        return {"steps": steps, "error": "", "duration_ms": duration_ms}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    print(f"[sandbox-java] starting worker, group={GROUP_ID}, filter={LANGUAGE_FILTER}", flush=True)

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

    print("[sandbox-java] ready, consuming jobs...", flush=True)

    for message in consumer:
        job = message.value
        if job.get("language") != LANGUAGE_FILTER:
            continue

        job_id = job.get("id")
        code = job.get("code", "")
        print(f"[sandbox-java] processing job {job_id}", flush=True)

        try:
            result = execute_code(code)
        except Exception as e:  # noqa: BLE001
            traceback.print_exc()
            result = {"steps": [], "error": f"internal sandbox error: {e}", "duration_ms": 0}

        payload = {
            "job_id": job_id,
            "hash": job.get("hash", ""),
            "steps": result["steps"],
            "error": result["error"],
            "language": LANGUAGE_FILTER,
            "duration_ms": result["duration_ms"],
        }
        producer.send(RESULTS_TOPIC, value=payload)
        producer.flush()
        print(f"[sandbox-java] published result for {job_id} ({len(result['steps'])} steps)", flush=True)


if __name__ == "__main__":
    main()
