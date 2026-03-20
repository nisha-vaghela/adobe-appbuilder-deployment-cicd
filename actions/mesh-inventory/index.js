const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')
const { getClient } = require('../oauth1a')

async function main (params) {
  const logger = Core.Logger('mesh-inventory', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('mesh-inventory action invoked')
    logger.debug(stringParameters(params))

    const errorMessage = checkMissingRequestInputs(params, ['sku'], [])
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const sku = String(params.sku).trim()
    if (!sku) {
      return errorResponse(400, 'SKU cannot be empty', logger)
    }

    const client = getClient({ params, url: params.BASE_URL }, logger)
    const inventory = await client.get(`stockStatuses/${encodeURIComponent(sku)}`)

    return {
      statusCode: 200,
      body: {
        sku,
        qty: inventory.qty,
        is_in_stock: inventory.stock_status === 1 || inventory.stock_status === true
      }
    }
  } catch (error) {
    logger.error(`mesh-inventory error: ${error.message}`)
    if (error.message && error.message.includes('404')) {
      return errorResponse(404, `Inventory not found for SKU: ${params.sku}`, logger)
    }
    return errorResponse(500, `Failed to fetch inventory: ${error.message}`, logger)
  }
}

exports.main = main
