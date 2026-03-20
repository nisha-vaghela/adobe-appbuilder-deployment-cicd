const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

function buildQuery (sku) {
  return `{
    productBySku(sku: "${sku}") {
      sku
      name
      price
      type
    }
    inventoryBySku(sku: "${sku}") {
      sku
      qty
      is_in_stock
    }
  }`
}

async function main (params) {
  const logger = Core.Logger('api-mesh', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('api-mesh action invoked')
    logger.debug(stringParameters(params))

    const missing = checkMissingRequestInputs(params, ['MESH_ENDPOINT', 'sku'], [])
    if (missing) {
      return errorResponse(400, missing, logger)
    }

    const sku = String(params.sku).trim()
    if (!sku) {
      return errorResponse(400, 'SKU cannot be empty', logger)
    }

    const query = params.query || buildQuery(sku)

    const response = await fetch(params.MESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    const result = await response.json()

    if (!response.ok) {
      return errorResponse(response.status, `Mesh query failed: ${JSON.stringify(result.errors || result)}`, logger)
    }

    if (result.errors) {
      return errorResponse(400, `GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`, logger)
    }

    return {
      statusCode: 200,
      body: {
        sku,
        data: result.data
      }
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)
    return errorResponse(500, `API Mesh query failed: ${error.message}`, logger)
  }
}

exports.main = main
