#!/usr/bin/env python3
"""Static regression for the Docker Desktop /tmp noexec Go failure."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
worker = (ROOT / "sandbox/golang/worker.go").read_text()
compose = (ROOT / "docker-compose.yml").read_text()
dockerfile = (ROOT / "sandbox/golang/Dockerfile").read_text()

checks = [
    ('/tmp:rw,noexec' in compose, 'generic /tmp must remain noexec'),
    ('/go-exec:rw,exec' in compose, 'Go executable workspace must explicitly be exec'),
    ('uid=10001,gid=10001' in compose, 'executable tmpfs must belong to the sandbox user'),
    ('addgroup -S -g 10001 sandbox' in dockerfile and 'adduser -S -D -H -u 10001' in dockerfile,
     'sandbox UID/GID must be deterministic'),
    ('os.MkdirTemp("/go-exec", "algoweave-go-bin-*")' in worker, 'compiled binaries must be placed on /go-exec'),
    ('exec.CommandContext(ctx, "go", "build", "-trimpath", "-o", binaryPath, mainPath)' in worker,
     'worker must build explicitly instead of go run'),
    ('exec.CommandContext(ctx, binaryPath)' in worker, 'worker must execute the dedicated binary'),
    ('exec.CommandContext(ctx, "go", "run"' not in worker, 'worker must not use go run'),
    ('verifyExecutableWorkspace()' in worker and 'executable workspace check passed' in worker,
     'worker must fail fast if the exec mount is unusable'),
]

failed = [message for ok, message in checks if not ok]
if failed:
    print('Go executable-workspace verification FAILED')
    for message in failed:
        print('  -', message)
    sys.exit(1)

print('PASS /tmp is writable but non-executable')
print('PASS /go-exec is the only writable executable workspace for student Go binaries')
print('PASS tmpfs ownership matches sandbox uid/gid 10001')
print('PASS worker uses go build -> /go-exec/program -> execute')
print('PASS worker performs an executable-mount startup probe')
