FROM gcc:13-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /usr/sbin/nologin sandbox

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY worker.py instrument.py ./

RUN chown -R sandbox:sandbox /app
USER sandbox

CMD ["python3", "worker.py"]
