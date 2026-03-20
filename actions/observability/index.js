const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

function logEvent (logger, level, message, data = {}) {
  const event = {
    level,
    message,
    data,
    timestamp: new Date().toISOString()
  }
  const msg = JSON.stringify(event)
  if (level === 'error') {
    logger.error(msg)
  } else {
    logger.info(msg)
  }
  return event
}

async function pushLogsToNewRelic (licenseKey, events, logger) {
  if (!licenseKey) {
    logger.warn('NEW_RELIC_LICENSE_KEY is missing, skipping New Relic push')
    return { sent: false, reason: 'missing_license_key' }
  }
  const response = await fetch('https://log-api.newrelic.com/log/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': licenseKey
    },
    body: JSON.stringify(events)
  })
  const body = await response.text()
  if (!response.ok) {
    throw new Error(`New Relic push failed (${response.status}): ${body}`)
  }
  return { sent: true, status: response.status }
}

async function main (params) {
  const logger = Core.Logger('observability', { level: params.LOG_LEVEL || 'info' })
  const startTs = Date.now()
  const requestId = params.__ow_activation_id || `obs-${Date.now()}`
  const events = []

  try {
    events.push(logEvent(logger, 'info', 'Execution started', { requestId }))
    events.push(logEvent(logger, 'info', 'Input data', {
      requestId,
      input: {
        taskName: params.taskName,
        simulateError: !!params.simulateError
      }
    }))

    logger.debug(stringParameters(params))

    if (!params.taskName || String(params.taskName).trim() === '') {
      throw new Error('Missing required input: taskName')
    }
    if (params.simulateError === true || params.simulateError === 'true') {
      throw new Error('Simulated execution failure')
    }

    const executionTimeMs = Date.now() - startTs
    events.push(logEvent(logger, 'info', 'Execution completed', {
      requestId,
      status: 'success',
      executionTimeMs
    }))

    // Custom metrics as structured logs (captured by observability pipelines)
    events.push(logEvent(logger, 'info', 'Metric: request_count', {
      requestId,
      metric: 'request_count',
      value: 1
    }))
    events.push(logEvent(logger, 'info', 'Metric: success_count', {
      requestId,
      metric: 'success_count',
      value: 1
    }))
    events.push(logEvent(logger, 'info', 'Metric: execution_time_ms', {
      requestId,
      metric: 'execution_time_ms',
      value: executionTimeMs
    }))

    const newRelic = await pushLogsToNewRelic(params.NEW_RELIC_LICENSE_KEY, events, logger)

    return {
      statusCode: 200,
      body: {
        message: 'Observability success',
        requestId,
        executionTimeMs,
        newRelic
      }
    }
  } catch (e) {
    const executionTimeMs = Date.now() - startTs
    events.push(logEvent(logger, 'error', 'Execution failed', {
      requestId,
      status: 'failure',
      executionTimeMs,
      error: e.message
    }))
    events.push(logEvent(logger, 'info', 'Metric: request_count', {
      requestId,
      metric: 'request_count',
      value: 1
    }))
    events.push(logEvent(logger, 'info', 'Metric: failure_count', {
      requestId,
      metric: 'failure_count',
      value: 1
    }))
    events.push(logEvent(logger, 'info', 'Metric: execution_time_ms', {
      requestId,
      metric: 'execution_time_ms',
      value: executionTimeMs
    }))

    try {
      await pushLogsToNewRelic(params.NEW_RELIC_LICENSE_KEY, events, logger)
    } catch (nrError) {
      logger.error(`New Relic error forwarding failed: ${nrError.message}`)
    }

    return errorResponse(400, `observability failed: ${e.message}`, logger)
  }
}

exports.main = main
