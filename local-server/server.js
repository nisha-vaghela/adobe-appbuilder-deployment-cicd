const https = require('https')
const fs = require('fs')
const url = require('url')
const path = require('path')

const PORT = 9090
const CERT_DIR = path.join(__dirname, 'certs')

const options = {
  key: fs.readFileSync(path.join(CERT_DIR, 'key.pem')),
  cert: fs.readFileSync(path.join(CERT_DIR, 'cert.pem'))
}

const EXTENSION_CDN_URL = 'https://748062-nishaappbuilder-stage.adobeio-static.net/index.html'

const jsonResponse = [
  {
    name: 'nishaappbuilder',
    title: 'Nisha App Builder',
    description: 'Custom Admin Menu Extension for Adobe Commerce',
    icon: 'no',
    publisher: 'NishaAppBuilder',
    endpoints: {
      'commerce/backend-ui/1': {
        view: [{ href: EXTENSION_CDN_URL }]
      }
    },
    xrInfo: {
      supportEmail: 'nisha.vaghela@brainvire.com',
      appId: 'nishaappbuilder'
    },
    status: 'PUBLISHED'
  }
]

console.log('Mock App Registry Server starting...')
console.log(`Extension CDN URL: ${EXTENSION_CDN_URL}`)

https.createServer(options, function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  })

  const pathname = url.parse(req.url, true).pathname
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`)

  res.end(JSON.stringify(jsonResponse))
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Mock App Registry listening at https://0.0.0.0:${PORT}`)
  console.log('Use https://localhost:9090 to test from host')
  console.log('Use https://host.docker.internal:9090 from DDEV container')
})
