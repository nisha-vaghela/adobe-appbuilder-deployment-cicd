const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

function structuredLog (logger, level, message, data = {}) {
  const payload = {
    level,
    message,
    data,
    timestamp: new Date().toISOString()
  }
  const serialized = JSON.stringify(payload)
  if (level === 'error') {
    logger.error(serialized)
  } else if (level === 'warn') {
    logger.warn(serialized)
  } else {
    logger.info(serialized)
  }
  return payload
}

async function sendToNewRelic (licenseKey, logItems, logger) {
  if (!licenseKey) {
    logger.warn('NEW_RELIC_LICENSE_KEY not configured, skipping New Relic forwarding')
    return { sent: false, reason: 'missing_license_key' }
  }

  const response = await fetch('https://log-api.newrelic.com/log/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': licenseKey
    },
    body: JSON.stringify(logItems)
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`New Relic log API failed (${response.status}): ${body}`)
  }
  return { sent: true, status: response.status, body }
}

async function main (params) {
  const logger = Core.Logger('debug-logs', { level: params.LOG_LEVEL || 'info' })
  const requestId = params.__ow_activation_id || `req-${Date.now()}`
  const logsForForwarding = []

  try {
    // 1) start of execution
    logsForForwarding.push(structuredLog(logger, 'info', 'Start execution', { requestId }))

    // 2) input data log
    logsForForwarding.push(structuredLog(logger, 'info', 'Input data received', {
      requestId,
      input: {
        taskName: params.taskName,
        simulateError: !!params.simulateError
      }
    }))

    logger.debug(stringParameters(params))

    // 3) simulate errors for debugging flow
    if (!params.taskName || String(params.taskName).trim() === '') {
      logger.error('Missing required input: taskName')
      throw new Error('Missing required input: taskName')
    }
    if (params.simulateError === true || params.simulateError === 'true') {
      throw new Error('Simulated error triggered by simulateError input')
    }

    // 4) success log
    logsForForwarding.push(structuredLog(logger, 'info', 'Processing request', {
      requestId,
      taskName: params.taskName
    }))
    logsForForwarding.push(structuredLog(logger, 'info', 'Execution completed successfully', {
      requestId
    }))

    const newRelicResult = await sendToNewRelic(params.NEW_RELIC_LICENSE_KEY, logsForForwarding, logger)

    return {
      statusCode: 200,
      body: {
        message: 'Debug log action executed successfully',
        requestId,
        newRelic: newRelicResult
      }
    }
  } catch (error) {
    logsForForwarding.push(structuredLog(logger, 'error', 'Execution failed', {
      requestId,
      error: error.message
    }))

    try {
      await sendToNewRelic(params.NEW_RELIC_LICENSE_KEY, logsForForwarding, logger)
    } catch (nrError) {
      logger.error(`Failed forwarding error logs to New Relic: ${nrError.message}`)
    }

    return errorResponse(400, `debug-logs failed: ${error.message}`, logger)
  }
}

exports.main = main
