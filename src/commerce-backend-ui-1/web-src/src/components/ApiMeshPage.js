import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Flex,
  Text,
  TextField,
  ActionButton,
  ProgressCircle,
  StatusLight,
  Well,
  Heading,
  Divider
} from '@adobe/react-spectrum'
import Function from '@spectrum-icons/workflow/Function'
import Refresh from '@spectrum-icons/workflow/Refresh'
import config from '../config.json'

function getActionUrl (actionName) {
  return config[actionName] || config[`nishaappbuilder/${actionName}`]
}

async function callAction (actionUrl, params, imsToken, imsOrg) {
  const headers = { 'Content-Type': 'application/json' }
  if (imsToken) {
    headers.authorization = `Bearer ${imsToken}`
  }
  if (imsOrg) {
    headers['x-gw-ims-org-id'] = imsOrg
  }

  const response = await fetch(actionUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })

  const raw = await response.text()
  let parsed = raw
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    // non-json body
  }

  if (!response.ok) {
    throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed))
  }
  return parsed
}

export default function ApiMeshPage ({ imsToken, imsOrg }) {
  const [sku, setSku] = useState('24-MB04')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [activeCall, setActiveCall] = useState('api-mesh')

  const apiMeshUrl = getActionUrl('api-mesh')
  const meshProductsUrl = getActionUrl('mesh-products')
  const meshInventoryUrl = getActionUrl('mesh-inventory')

  async function runApiMesh () {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setActiveCall('api-mesh')
    try {
      if (!apiMeshUrl) throw new Error('api-mesh action URL missing in config')
      const data = await callAction(apiMeshUrl, { sku: sku.trim() }, imsToken, imsOrg)
      setResult({ source: 'api-mesh', data })
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function runDirectActions () {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setActiveCall('direct-actions')
    try {
      if (!meshProductsUrl || !meshInventoryUrl) {
        throw new Error('mesh-products or mesh-inventory action URL missing in config')
      }
      const [product, inventory] = await Promise.all([
        callAction(meshProductsUrl, { sku: sku.trim() }, imsToken, imsOrg),
        callAction(meshInventoryUrl, { sku: sku.trim() }, imsToken, imsOrg)
      ])
      setResult({ source: 'direct-actions', data: { product, inventory } })
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <Heading level={3}>API Mesh - Product + Inventory</Heading>
      <Text>Use one SKU to fetch live product and inventory data.</Text>
      <Divider size='S' marginTop='size-150' marginBottom='size-150' />

      <Flex gap='size-200' alignItems='end' wrap>
        <TextField
          label='SKU'
          value={sku}
          onChange={setSku}
          placeholder='e.g. 24-MB04'
          width='size-2400'
        />
        <ActionButton onPress={runApiMesh} isDisabled={isLoading || !sku.trim()}>
          <Function size='S' />
          <Text>Run via API Mesh</Text>
        </ActionButton>
        <ActionButton onPress={runDirectActions} isDisabled={isLoading || !sku.trim()}>
          <Refresh size='S' />
          <Text>Run direct actions</Text>
        </ActionButton>
        {isLoading && <ProgressCircle aria-label='Loading' isIndeterminate size='S' />}
      </Flex>

      {error && (
        <View marginTop='size-200'>
          <StatusLight variant='negative'>Error</StatusLight>
          <Well marginTop='size-100'>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
          </Well>
        </View>
      )}

      {result && (
        <View marginTop='size-200'>
          <StatusLight variant='positive'>Success ({activeCall})</StatusLight>
          <Well marginTop='size-100'>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </Well>
        </View>
      )}
    </View>
  )
}

ApiMeshPage.propTypes = {
  imsToken: PropTypes.string,
  imsOrg: PropTypes.string
}

