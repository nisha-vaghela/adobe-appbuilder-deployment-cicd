const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')
const { getClient } = require('../oauth1a')

async function main(params) {
  const logger = Core.Logger('get-customers', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('get-customers action invoked')

    const selectedIds = params.ids ? String(params.ids).split(',').map(s => s.trim()).filter(Boolean) : []
    logger.info(`Requested customer IDs: ${selectedIds.length > 0 ? selectedIds.join(', ') : 'all'}`)

    const client = getClient({
      params,
      url: params.BASE_URL
    }, logger)

    const customerGridColumns = {}

    if (selectedIds.length > 0) {
      const orderCounts = await getOrderCountsByCustomerIds(client, selectedIds, logger)

      for (const id of selectedIds) {
        const totalOrders = orderCounts[id] || 0
        customerGridColumns[id] = {
          loyalty_status: getLoyaltyStatus(totalOrders),
          total_orders: totalOrders
        }
      }
    } else {
      const customers = await getAllCustomers(client, logger)
      const customerIds = customers.map(c => String(c.id))

      if (customerIds.length > 0) {
        const orderCounts = await getOrderCountsByCustomerIds(client, customerIds, logger)
        for (const id of customerIds) {
          const totalOrders = orderCounts[id] || 0
          customerGridColumns[id] = {
            loyalty_status: getLoyaltyStatus(totalOrders),
            total_orders: totalOrders
          }
        }
      }
    }

    customerGridColumns['*'] = {
      loyalty_status: 'Standard',
      total_orders: 0
    }

    logger.info(`Returning data for ${Object.keys(customerGridColumns).length - 1} customers`)

    return {
      statusCode: 200,
      body: { customerGridColumns }
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)
    return errorResponse(500, `Failed to fetch customer data: ${error.message}`, logger)
  }
}

async function getAllCustomers(client, logger) {
  try {
    const response = await client.get('customers/search?searchCriteria[pageSize]=200&searchCriteria[currentPage]=1')
    logger.info(`Fetched ${response.items?.length || 0} customers`)
    return response.items || []
  } catch (error) {
    logger.error(`Error fetching customers: ${error.message}`)
    return []
  }
}

async function getOrderCountsByCustomerIds(client, customerIds, logger) {
  const orderCounts = {}
  customerIds.forEach(id => { orderCounts[id] = 0 })

  try {
    const batchSize = 50
    for (let i = 0; i < customerIds.length; i += batchSize) {
      const batch = customerIds.slice(i, i + batchSize)
      const idsParam = batch.join(',')

      const query = `orders?` +
        `searchCriteria[filterGroups][0][filters][0][field]=customer_id&` +
        `searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(idsParam)}&` +
        `searchCriteria[filterGroups][0][filters][0][conditionType]=in&` +
        `searchCriteria[pageSize]=1&` +
        `fields=items[customer_id],total_count`

      const response = await client.get(query)

      if (response.items) {
        for (const order of response.items) {
          const cid = String(order.customer_id)
          if (orderCounts[cid] !== undefined) {
            orderCounts[cid]++
          }
        }
      }

      if (response.total_count > 1) {
        const fullQuery = `orders?` +
          `searchCriteria[filterGroups][0][filters][0][field]=customer_id&` +
          `searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(idsParam)}&` +
          `searchCriteria[filterGroups][0][filters][0][conditionType]=in&` +
          `searchCriteria[pageSize]=${response.total_count}&` +
          `fields=items[customer_id]`

        const fullResponse = await client.get(fullQuery)
        batch.forEach(id => { orderCounts[id] = 0 })

        if (fullResponse.items) {
          for (const order of fullResponse.items) {
            const cid = String(order.customer_id)
            if (orderCounts[cid] !== undefined) {
              orderCounts[cid]++
            }
          }
        }
      }

      logger.info(`Processed order counts for batch ${i / batchSize + 1}`)
    }
  } catch (error) {
    logger.error(`Error fetching orders: ${error.message}`)
  }

  return orderCounts
}

function getLoyaltyStatus(orderCount) {
  if (orderCount >= 30) return 'Platinum'
  if (orderCount >= 15) return 'Gold'
  if (orderCount >= 5) return 'Silver'
  return 'Standard'
}

exports.main = main
