FROM eclipse-temurin:21-jdk-alpine

RUN apk add --no-cache python3 py3-pip
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY worker.py instrument.py ./

RUN mkdir -p /tmp/java-jobs && chown -R sandbox:sandbox /app /tmp/java-jobs
USER sandbox

CMD ["python3", "worker.py"]
