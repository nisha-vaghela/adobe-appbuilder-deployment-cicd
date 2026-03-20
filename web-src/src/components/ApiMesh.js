import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Heading,
  ActionButton,
  StatusLight,
  ProgressCircle,
  Text,
  View,
  Well,
  Divider,
  TextField
} from '@adobe/react-spectrum'
import Function from '@spectrum-icons/workflow/Function'

import allActions from '../config.json'
import actionWebInvoke from '../utils'

const ACTION_KEY = 'nishaappbuilder/api-mesh'

const ApiMesh = (props) => {
  const [sku, setSku] = useState('24-MB01')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function getHeaders () {
    const headers = {}
    if (props.ims.token) {
      headers.authorization = `Bearer ${props.ims.token}`
    }
    if (props.ims.org) {
      headers['x-gw-ims-org-id'] = props.ims.org
    }
    return headers
  }

  async function fetchCombinedData () {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const actionUrl = allActions[ACTION_KEY]
      if (!actionUrl) {
        throw new Error(`Action "${ACTION_KEY}" not found in config`)
      }
      const response = await actionWebInvoke(actionUrl, getHeaders(), { sku: sku.trim() })
      setResult(response)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const product = result?.data?.productBySku
  const inventory = result?.data?.inventoryBySku

  return (
    <View width="size-8000" maxWidth="100%">
      <Heading level={1}>API Mesh - Dynamic Product + Inventory</Heading>
      <Text>
        Fetch live product and inventory data in one GraphQL request using Adobe API Mesh.
      </Text>

      <Divider size="M" marginTop="size-200" marginBottom="size-200" />

      <Well>
        <Flex gap="size-200" alignItems="end" wrap>
          <TextField
            label="SKU"
            value={sku}
            onChange={setSku}
            width="size-2400"
            placeholder="e.g. 24-MB01"
          />
          <ActionButton
            onPress={fetchCombinedData}
            isDisabled={loading || !sku.trim()}
          >
            <Function size="S" />
            <Text>Fetch Product + Inventory</Text>
          </ActionButton>
          {loading && <ProgressCircle aria-label="Loading..." isIndeterminate size="S" />}
        </Flex>
      </Well>

      {error && (
        <View marginTop="size-200">
          <StatusLight variant="negative">Error</StatusLight>
          <Well marginTop="size-100"><Text>{error}</Text></Well>
        </View>
      )}

      {result && (
        <View marginTop="size-200">
          <StatusLight variant="positive">Live data fetched for SKU: {result.sku}</StatusLight>

          <View marginTop="size-200">
            <Heading level={4}>Product</Heading>
            <Well>
              <Text>SKU: {product?.sku || '-'}</Text>
              <Text>Name: {product?.name || '-'}</Text>
              <Text>Price: {product?.price ?? '-'}</Text>
              <Text>Type: {product?.type || '-'}</Text>
            </Well>
          </View>

          <View marginTop="size-200">
            <Heading level={4}>Inventory</Heading>
            <Well>
              <Text>SKU: {inventory?.sku || '-'}</Text>
              <Text>Qty: {inventory?.qty ?? '-'}</Text>
              <Text>In Stock: {String(inventory?.is_in_stock)}</Text>
            </Well>
          </View>

          <Divider size="S" marginTop="size-300" marginBottom="size-200" />
          <Heading level={4}>Raw JSON</Heading>
          <Well UNSAFE_style={{ maxHeight: '300px', overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </Well>
        </View>
      )}
    </View>
  )
}

ApiMesh.propTypes = {
  runtime: PropTypes.any,
  ims: PropTypes.any
}

export default ApiMesh
