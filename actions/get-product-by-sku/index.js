const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')
const { getClient } = require('../oauth1a')

function formatProduct (product) {
  const stockItem = product.extension_attributes?.stock_item
  return {
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: stockItem ? stockItem.qty : 'N/A',
    type: product.type_id
  }
}

async function main (params) {
  const logger = Core.Logger('get-product-by-sku', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-product-by-sku action invoked')
    logger.debug(stringParameters(params))

    const requiredParams = ['sku']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, [])
    if (errorMessage) {
      logger.warn(`Validation failed: ${errorMessage}`)
      return errorResponse(400, errorMessage, logger)
    }

    const skuInput = String(params.sku).trim()
    if (!skuInput) {
      return errorResponse(400, 'SKU cannot be empty', logger)
    }

    const client = getClient({
      params,
      url: params.BASE_URL,
    }, logger)

    const skus = skuInput.split(',').map(s => s.trim()).filter(Boolean)

    if (skus.length === 0) {
      return errorResponse(400, 'No valid SKUs provided', logger)
    }

    if (skus.length === 1) {
      logger.info(`Single SKU lookup: ${skus[0]}`)
      const encodedSku = encodeURIComponent(skus[0])
      const product = await client.get(`products/${encodedSku}`)
      logger.info(`Product found: ${product.name} (${product.sku})`)

      return {
        statusCode: 200,
        body: formatProduct(product)
      }
    }

    logger.info(`Multiple SKU lookup: ${skus.join(', ')}`)
    const searchQuery = `products?` +
      `searchCriteria[filterGroups][0][filters][0][field]=sku&` +
      `searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(skus.join(','))}&` +
      `searchCriteria[filterGroups][0][filters][0][conditionType]=in`

    const response = await client.get(searchQuery)
    const products = (response.items || []).map(formatProduct)

    const foundSkus = products.map(p => p.sku)
    const notFound = skus.filter(s => !foundSkus.includes(s))

    logger.info(`Found ${products.length} of ${skus.length} products`)

    return {
      statusCode: 200,
      body: {
        total: products.length,
        products,
        ...(notFound.length > 0 && { not_found: notFound })
      }
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)

    if (error.message && error.message.includes('404')) {
      return errorResponse(404, `Product not found for SKU: ${params.sku}`, logger)
    }

    return errorResponse(500, `Failed to fetch product: ${error.message}`, logger)
  }
}

exports.main = main
