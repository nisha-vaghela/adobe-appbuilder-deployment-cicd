const { Core } = require('@adobe/aio-sdk')
const fetch = require('node-fetch')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

async function main (params) {
  const logger = Core.Logger('mesh-products', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('mesh-products action invoked')
    logger.debug(stringParameters(params))

    const errorMessage = checkMissingRequestInputs(params, ['sku'], [])
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const sku = String(params.sku).trim()
    if (!sku) {
      return errorResponse(400, 'SKU cannot be empty', logger)
    }

    const baseUrl = String(params.BASE_URL || '').replace(/\/+$/, '')
    const productUrl = `${baseUrl}/V1/products/${encodeURIComponent(sku)}`
    const response = await fetch(productUrl, { method: 'GET' })

    if (!response.ok) {
      const errorBody = await response.text()
      if (response.status === 404) {
        return errorResponse(404, `Product not found for SKU: ${params.sku}`, logger)
      }
      return errorResponse(response.status, `Magento product API failed: ${errorBody}`, logger)
    }

    const product = await response.json()

    return {
      statusCode: 200,
      body: {
        sku: product.sku,
        name: product.name,
        price: product.price,
        type: product.type_id
      }
    }
  } catch (error) {
    logger.error(`mesh-products error: ${error.message}`)
    return errorResponse(500, `Failed to fetch product: ${error.message}`, logger)
  }
}

exports.main = main
