const fetch = require('node-fetch')
const { Core, State } = require('@adobe/aio-sdk')
const { v4: uuidv4 } = require('uuid')
const { errorResponse, stringParameters } = require('../utils')

const PRODUCTS_KEY = 'products_collection'

async function getProducts (state, logger) {
  const res = await state.get(PRODUCTS_KEY)
  if (!res || !res.value) return []
  try {
    const products = JSON.parse(res.value)
    logger.debug(`Loaded ${products.length} products from state`)
    return products
  } catch (e) {
    logger.warn(`Failed to parse products, resetting: ${e.message}`)
    return []
  }
}

async function saveProducts (state, products, logger) {
  await state.put(PRODUCTS_KEY, JSON.stringify(products), { ttl: 31536000 })
  logger.debug(`Saved ${products.length} products to state`)
}

async function emitProductLifecycleEvent (params, logger, eventType, product) {
  const url = String(params.OBSERVABILITY_WEB_ACTION_URL || '').trim()
  if (!url) {
    logger.warn('OBSERVABILITY_WEB_ACTION_URL not configured, skipping lifecycle event')
    return { sent: false, reason: 'missing_observability_url' }
  }

  const payload = {
    taskName: `product-${eventType}`,
    simulateError: false,
    source: 'product-crud',
    eventType,
    entity: 'product',
    product
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    if (!response.ok) {
      logger.warn(`Lifecycle event call failed (${response.status}): ${text}`)
      return { sent: false, status: response.status, body: text }
    }

    logger.info(`Lifecycle event emitted for ${eventType} (product id: ${product.id})`)
    return { sent: true, status: response.status }
  } catch (e) {
    logger.warn(`Lifecycle event call error: ${e.message}`)
    return { sent: false, reason: e.message }
  }
}

async function main (params) {
  const logger = Core.Logger('product-crud', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('product-crud action invoked')
    logger.debug(stringParameters(params))

    const operation = (params.operation || '').toLowerCase()
    if (!operation) {
      return errorResponse(400, 'Missing parameter: operation (create, list, update, delete)', logger)
    }

    const state = await State.init()

    switch (operation) {
      case 'create': {
        if (!params.name || params.price === undefined) {
          return errorResponse(400, 'Missing parameters: name and price are required', logger)
        }
        const price = parseFloat(params.price)
        if (isNaN(price) || price < 0) {
          return errorResponse(400, 'Price must be a valid positive number', logger)
        }

        const products = await getProducts(state, logger)
        const newProduct = {
          id: uuidv4(),
          name: String(params.name).trim(),
          price: price,
          created_at: new Date().toISOString()
        }
        products.push(newProduct)
        await saveProducts(state, products, logger)
        const lifecycleEvent = await emitProductLifecycleEvent(params, logger, 'created', newProduct)

        logger.info(`Product created: ${newProduct.name} (id: ${newProduct.id})`)
        return {
          statusCode: 200,
          body: { message: 'Product created in database', product: newProduct, lifecycleEvent }
        }
      }

      case 'list': {
        const products = await getProducts(state, logger)
        logger.info(`Product records retrieved: ${products.length} products`)
        return {
          statusCode: 200,
          body: { message: 'Product records retrieved', products, total: products.length }
        }
      }

      case 'update': {
        if (!params.id) {
          return errorResponse(400, 'Missing parameter: id is required', logger)
        }
        if (!params.name && params.price === undefined) {
          return errorResponse(400, 'Provide at least one field to update: name or price', logger)
        }

        const products = await getProducts(state, logger)
        const index = products.findIndex(p => p.id === params.id)
        if (index === -1) {
          return errorResponse(404, `Product not found with id: ${params.id}`, logger)
        }

        if (params.name) {
          products[index].name = String(params.name).trim()
        }
        if (params.price !== undefined) {
          const price = parseFloat(params.price)
          if (isNaN(price) || price < 0) {
            return errorResponse(400, 'Price must be a valid positive number', logger)
          }
          products[index].price = price
        }
        await saveProducts(state, products, logger)
        const lifecycleEvent = await emitProductLifecycleEvent(params, logger, 'updated', products[index])

        logger.info(`Product record updated: ${products[index].name} (id: ${params.id})`)
        return {
          statusCode: 200,
          body: { message: 'Product record updated', product: products[index], lifecycleEvent }
        }
      }

      case 'delete': {
        if (!params.id) {
          return errorResponse(400, 'Missing parameter: id is required', logger)
        }

        const products = await getProducts(state, logger)
        const index = products.findIndex(p => p.id === params.id)
        if (index === -1) {
          return errorResponse(404, `Product not found with id: ${params.id}`, logger)
        }

        const deleted = products.splice(index, 1)[0]
        await saveProducts(state, products, logger)
        const lifecycleEvent = await emitProductLifecycleEvent(params, logger, 'deleted', deleted)

        logger.info(`Product record deleted from database: ${deleted.name} (id: ${params.id})`)
        return {
          statusCode: 200,
          body: { message: 'Product record deleted from database', product: deleted, lifecycleEvent }
        }
      }

      default:
        return errorResponse(400, `Unknown operation: "${operation}". Use: create, list, update, delete`, logger)
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)
    return errorResponse(500, `Database operation failed: ${error.message}`, logger)
  }
}

exports.main = main
