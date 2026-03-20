const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

const MOCK_PRODUCTS = {
  'SKU-001': { sku: 'SKU-001', name: 'Adobe Creative Cloud License', price: 54.99 },
  'SKU-002': { sku: 'SKU-002', name: 'Adobe Photoshop Plugin', price: 29.99 },
  'SKU-003': { sku: 'SKU-003', name: 'Adobe Illustrator Brushes Pack', price: 19.99 },
  'SKU-004': { sku: 'SKU-004', name: 'Adobe XD UI Kit', price: 39.99 },
  'SKU-005': { sku: 'SKU-005', name: 'Adobe Premiere Pro Template', price: 49.99 }
}

async function main (params) {
  const logger = Core.Logger('get-product', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-product action invoked')
    logger.debug(stringParameters(params))

    const requiredParams = ['sku']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, [])
    if (errorMessage) {
      logger.warn(`Validation failed: ${errorMessage}`)
      return errorResponse(400, errorMessage, logger)
    }

    const sku = String(params.sku).trim()

    if (sku.length < 2 || sku.length > 50) {
      logger.warn(`Invalid SKU length: ${sku.length}`)
      return errorResponse(400, 'SKU must be between 2 and 50 characters', logger)
    }

    logger.info(`Looking up product with SKU: ${sku}`)

    const product = MOCK_PRODUCTS[sku]

    if (!product) {
      logger.info(`Product not found for SKU: ${sku}`)
      return errorResponse(404, `Product not found for SKU: ${sku}`, logger)
    }

    logger.info(`Product found: ${product.name} (${product.sku}) - $${product.price}`)

    return {
      statusCode: 200,
      body: product
    }
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`)
    return errorResponse(500, 'Internal server error', logger)
  }
}

exports.main = main
