FROM python:3.11-slim

# Create a non-root user for defense-in-depth
RUN useradd --create-home --shell /usr/sbin/nologin sandbox

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY worker.py tracer.py ./

# Only /tmp is writable at runtime (read-only root filesystem is set via
# docker-compose/K8s securityContext in production; this Dockerfile just
# prepares the minimal, non-root runtime image)
RUN chown -R sandbox:sandbox /app
USER sandbox

ENV PYTHONUNBUFFERED=1

CMD ["python", "worker.py"]
