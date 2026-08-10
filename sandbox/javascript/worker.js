'use strict'
/**
 * worker.js — Kafka consumer/producer worker for the JavaScript sandbox pool.
 *
 * Consumes jobs from `visualize-jobs` (filtered by language === "javascript"),
 * executes the submitted code inside a resource-limited child process
 * running tracer.js, and publishes the resulting steps[] trace to
 * `visualize-results`.
 */

const { Kafka } = require('kafkajs')
const { spawn } = require('child_process')
const path = require('path')

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
const JOBS_TOPIC = process.env.KAFKA_JOBS_TOPIC || 'visualize-jobs'
const RESULTS_TOPIC = process.env.KAFKA_RESULTS_TOPIC || 'visualize-results'
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'sandbox-javascript'
const LANGUAGE_FILTER = process.env.LANGUAGE_FILTER || 'javascript'
const MAX_EXEC_SECONDS = parseFloat(process.env.MAX_EXEC_SECONDS || '10')
const MAX_MEMORY_MB = parseInt(process.env.MAX_MEMORY_MB || '128', 10)

const TRACER_PATH = path.join(__dirname, 'tracer.js')

function executeCode(code) {
  return new Promise((resolve) => {
    const start = Date.now()
    const child = spawn(
      process.execPath,
      [`--max-old-space-size=${MAX_MEMORY_MB}`, TRACER_PATH],
      { stdio: ['pipe', 'pipe', 'pipe'] }
    )

    let stdout = ''
    let stderr = ''
    let finished = false

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true
        child.kill('SIGKILL')
        resolve({
          steps: [],
          error: `Execution timed out after ${MAX_EXEC_SECONDS}s`,
          duration_ms: Date.now() - start,
        })
      }
    }, MAX_EXEC_SECONDS * 1000)

    child.stdout.on('data', (d) => { stdout += d })
    child.stderr.on('data', (d) => { stderr += d })

    child.on('close', (codeExit) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      const duration_ms = Date.now() - start

      if (codeExit !== 0) {
        const tail = stderr.trim().split('\n').pop() || 'unknown error'
        resolve({ steps: [], error: `Sandbox error: ${tail}`, duration_ms })
        return
      }

      try {
        const payload = JSON.parse(stdout.trim().split('\n').pop())
        if (!payload.ok) {
          resolve({ steps: [], error: payload.error || 'unknown error', duration_ms })
        } else {
          resolve({ steps: payload.steps, error: '', duration_ms })
        }
      } catch (e) {
        resolve({ steps: [], error: 'Failed to parse tracer output', duration_ms })
      }
    })

    child.stdin.write(code)
    child.stdin.end()
  })
}

async function main() {
  console.log(`[sandbox-javascript] starting worker, group=${GROUP_ID}, filter=${LANGUAGE_FILTER}`)

  const kafka = new Kafka({ clientId: 'sandbox-javascript', brokers: KAFKA_BROKERS })
  const consumer = kafka.consumer({ groupId: GROUP_ID })
  const producer = kafka.producer()

  await producer.connect()
  await consumer.connect()
  await consumer.subscribe({ topic: JOBS_TOPIC, fromBeginning: false })

  console.log('[sandbox-javascript] ready, consuming jobs...')

  await consumer.run({
    eachMessage: async ({ message }) => {
      let job
      try {
        job = JSON.parse(message.value.toString())
      } catch {
        return
      }
      if (job.language !== LANGUAGE_FILTER) return

      console.log(`[sandbox-javascript] processing job ${job.id}`)
      const result = await executeCode(job.code || '')

      await producer.send({
        topic: RESULTS_TOPIC,
        messages: [{
          key: job.id,
          value: JSON.stringify({
            job_id: job.id,
            hash: job.hash || '',
            steps: result.steps,
            error: result.error,
            language: LANGUAGE_FILTER,
            duration_ms: result.duration_ms,
          }),
        }],
      })
      console.log(`[sandbox-javascript] published result for ${job.id} (${result.steps.length} steps)`)
    },
  })
}

main().catch((e) => {
  console.error('[sandbox-javascript] fatal error', e)
  process.exit(1)
})
