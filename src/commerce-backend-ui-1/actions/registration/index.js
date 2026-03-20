async function main(params) {
  const extensionId = 'NishaAppBuilder'
  const meshId = params.MESH_ID || 'YOUR_MESH_ID'

  return {
    statusCode: 200,
    body: {
      registration: {
        menuItems: [
          {
            id: `${extensionId}::apps`,
            title: 'Apps',
            isSection: true,
            sortOrder: 100
          },
          {
            id: `${extensionId}::first`,
            title: 'Nisha App Builder',
            parent: `${extensionId}::apps`,
            sortOrder: 1
          }
        ],
        page: {
          title: 'Nisha App Builder - Admin Panel'
        },
        customer: {
          gridColumns: {
            data: {
              meshId: meshId
            },
            properties: [
              {
                label: 'Loyalty Status',
                columnId: 'loyalty_status',
                type: 'string',
                align: 'left'
              },
              {
                label: 'Total Orders',
                columnId: 'total_orders',
                type: 'integer',
                align: 'right'
              }
            ]
          }
        }
      }
    }
  }
}

exports.main = main
