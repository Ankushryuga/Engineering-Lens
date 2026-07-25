FROM node:20-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY worker.js tracer.js ./

RUN chown -R sandbox:sandbox /app
USER sandbox

CMD ["node", "worker.js"]
