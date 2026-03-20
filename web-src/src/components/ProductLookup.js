import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Heading,
  Form,
  TextField,
  ActionButton,
  StatusLight,
  ProgressCircle,
  Text,
  View,
  Well
} from '@adobe/react-spectrum'
import Search from '@spectrum-icons/workflow/Search'

import allActions from '../config.json'
import actionWebInvoke from '../utils'

const ACTION_KEY = 'nishaappbuilder/get-product'

const ProductLookup = (props) => {
  const [sku, setSku] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)

  async function handleLookup () {
    const trimmedSku = sku.trim()
    if (!trimmedSku) {
      setError('Please enter a SKU')
      return
    }

    setLoading(true)
    setProduct(null)
    setError(null)

    const headers = {}
    if (props.ims.token) {
      headers.authorization = `Bearer ${props.ims.token}`
    }
    if (props.ims.org) {
      headers['x-gw-ims-org-id'] = props.ims.org
    }

    try {
      const actionUrl = allActions[ACTION_KEY]
      if (!actionUrl) {
        throw new Error(`Action "${ACTION_KEY}" not found in config`)
      }

      const response = await actionWebInvoke(actionUrl, headers, { sku: trimmedSku })
      console.log('Product lookup response:', response)
      setProduct(response)
    } catch (e) {
      console.error('Product lookup error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLookup()
    }
  }

  return (
    <View width="size-6000">
      <Heading level={1}>Product Lookup</Heading>
      <Text>Enter a SKU to look up product details. Try: SKU-001, SKU-002, SKU-003, SKU-004, SKU-005</Text>

      <Form marginTop="size-200">
        <TextField
          label="Product SKU"
          placeholder="e.g. SKU-001"
          value={sku}
          onChange={setSku}
          onKeyDown={handleKeyDown}
          isRequired
          width="size-4600"
        />

        <Flex alignItems="center" gap="size-100" marginTop="size-100">
          <ActionButton
            variant="primary"
            onPress={handleLookup}
            isDisabled={loading || !sku.trim()}
          >
            <Search aria-label="Search" />
            <Text>Look Up Product</Text>
          </ActionButton>

          {loading && (
            <ProgressCircle aria-label="Loading..." isIndeterminate size="S" />
          )}
        </Flex>
      </Form>

      {error && (
        <View marginTop="size-200">
          <StatusLight variant="negative">Error</StatusLight>
          <Well marginTop="size-100">
            <Text>{error}</Text>
          </Well>
        </View>
      )}

      {product && (
        <View marginTop="size-200">
          <StatusLight variant="positive">Product Found</StatusLight>
          <Well marginTop="size-100">
            <Flex direction="column" gap="size-100">
              <Text><strong>SKU:</strong> {product.sku}</Text>
              <Text><strong>Name:</strong> {product.name}</Text>
              <Text><strong>Price:</strong> ${product.price}</Text>
            </Flex>
          </Well>
        </View>
      )}
    </View>
  )
}

ProductLookup.propTypes = {
  runtime: PropTypes.any,
  ims: PropTypes.any
}

export default ProductLookup
