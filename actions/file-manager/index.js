const { Core, Files } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

async function main (params) {
  const logger = Core.Logger('file-manager', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('file-manager action invoked')
    logger.debug(stringParameters(params))

    const operation = (params.operation || '').toLowerCase()
    if (!operation) {
      return errorResponse(400, 'Missing required parameter: operation (list, upload, delete, share)', logger)
    }

    const owAuth = process.env.__OW_API_KEY || params.__ow_api_key
    const owNamespace = process.env.__OW_NAMESPACE || params.__ow_namespace
    logger.debug(`OW namespace: ${owNamespace}, auth present: ${!!owAuth}`)

    let files
    try {
      files = await Files.init({ ow: { namespace: owNamespace, auth: owAuth } })
    } catch (initErr) {
      logger.warn(`Files.init with OW creds failed: ${initErr.message}, trying default init`)
      files = await Files.init()
    }

    switch (operation) {
      case 'list': {
        const fileList = await files.list('/')
        logger.debug(`Raw file list type: ${typeof fileList[0]}, sample: ${JSON.stringify(fileList[0])}`)
        const items = fileList.map(entry => {
          const fullPath = typeof entry === 'string' ? entry : entry.name || entry.path || String(entry)
          const name = fullPath.split('/').pop()
          const ext = name.includes('.') ? name.split('.').pop().toUpperCase() : 'FILE'
          return { path: fullPath, name, type: ext }
        })
        logger.info(`Listed ${items.length} files`)
        return {
          statusCode: 200,
          body: { files: items, total: items.length }
        }
      }

      case 'upload': {
        if (!params.fileName || !params.fileContent) {
          return errorResponse(400, 'Missing required parameters: fileName, fileContent', logger)
        }
        const fileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        const buffer = Buffer.from(params.fileContent, 'base64')
        await files.write(fileName, buffer)
        logger.info(`Uploaded file: ${fileName} (${buffer.length} bytes)`)
        return {
          statusCode: 200,
          body: { message: `File "${fileName}" uploaded successfully`, fileName, size: buffer.length }
        }
      }

      case 'delete': {
        if (!params.filePath) {
          return errorResponse(400, 'Missing required parameter: filePath', logger)
        }
        await files.delete(params.filePath)
        logger.info(`Deleted file: ${params.filePath}`)
        return {
          statusCode: 200,
          body: { message: `File "${params.filePath}" deleted successfully` }
        }
      }

      case 'share': {
        if (!params.filePath) {
          return errorResponse(400, 'Missing required parameter: filePath', logger)
        }
        const presignUrl = await files.generatePresignURL(params.filePath, { expiryInSeconds: 3600 })
        logger.info(`Generated share link for: ${params.filePath}`)
        return {
          statusCode: 200,
          body: { url: presignUrl, expiresIn: '1 hour' }
        }
      }

      default:
        return errorResponse(400, `Unknown operation: "${operation}". Use: list, upload, delete, share`, logger)
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)
    return errorResponse(500, `File operation failed: ${error.message}`, logger)
  }
}

exports.main = main
