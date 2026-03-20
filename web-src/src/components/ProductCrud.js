import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Heading,
  Form,
  TextField,
  NumberField,
  ActionButton,
  Button,
  StatusLight,
  ProgressCircle,
  Text,
  View,
  Well,
  Divider,
  DialogTrigger,
  Dialog,
  Content,
  ButtonGroup
} from '@adobe/react-spectrum'
import Add from '@spectrum-icons/workflow/Add'
import Edit from '@spectrum-icons/workflow/Edit'
import Delete from '@spectrum-icons/workflow/Delete'
import Refresh from '@spectrum-icons/workflow/Refresh'
import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy'

import allActions from '../config.json'
import actionWebInvoke from '../utils'

const ACTION_KEY = 'nishaappbuilder/product-crud'

const ProductCrud = (props) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(0)
  const [creating, setCreating] = useState(false)

  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [updating, setUpdating] = useState(false)

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

  async function invokeAction (params) {
    const actionUrl = allActions[ACTION_KEY]
    if (!actionUrl) {
      throw new Error(`Action "${ACTION_KEY}" not found in config`)
    }
    return await actionWebInvoke(actionUrl, getHeaders(), params)
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await invokeAction({ operation: 'list' })
      console.log('Products loaded:', result)
      setProducts(result.products || [])
    } catch (e) {
      console.error('Failed to load products:', e)
      setError(`Failed to load products: ${e.message}`)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  async function handleCreate () {
    if (!newName.trim()) {
      setError('Product name is required')
      return
    }
    setCreating(true)
    setError(null)
    setMessage(null)
    try {
      const result = await invokeAction({
        operation: 'create',
        name: newName.trim(),
        price: newPrice
      })
      console.log('Product created:', result)
      setMessage(`Product "${result.product.name}" created successfully`)
      setNewName('')
      setNewPrice(0)
      await loadProducts()
    } catch (e) {
      console.error('Create failed:', e)
      setError(`Create failed: ${e.message}`)
    } finally {
      setCreating(false)
    }
  }

  function startEdit (product) {
    setEditId(product.id)
    setEditName(product.name)
    setEditPrice(product.price)
  }

  function cancelEdit () {
    setEditId(null)
    setEditName('')
    setEditPrice(0)
  }

  async function handleUpdate () {
    if (!editName.trim()) {
      setError('Product name is required')
      return
    }
    setUpdating(true)
    setError(null)
    setMessage(null)
    try {
      const result = await invokeAction({
        operation: 'update',
        id: editId,
        name: editName.trim(),
        price: editPrice
      })
      console.log('Product updated:', result)
      setMessage(`Product "${result.product.name}" updated successfully`)
      cancelEdit()
      await loadProducts()
    } catch (e) {
      console.error('Update failed:', e)
      setError(`Update failed: ${e.message}`)
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete (product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) return

    setError(null)
    setMessage(null)
    try {
      await invokeAction({ operation: 'delete', id: product.id })
      setMessage(`Product "${product.name}" deleted from database`)
      await loadProducts()
    } catch (e) {
      console.error('Delete failed:', e)
      setError(`Delete failed: ${e.message}`)
    }
  }

  return (
    <View width="size-8000" maxWidth="100%">
      <Heading level={1}>Product Database (CRUD)</Heading>
      <Text>Create, Read, Update, and Delete product records using App Builder Database Storage.</Text>

      <Divider size="M" marginTop="size-200" marginBottom="size-200" />

      <Heading level={3}>Create New Product</Heading>
      <Well>
        <Flex direction="row" gap="size-200" alignItems="end" wrap>
          <TextField
            label="Product Name"
            placeholder="e.g. Wireless Mouse"
            value={newName}
            onChange={setNewName}
            isRequired
            width="size-3000"
          />
          <NumberField
            label="Price ($)"
            value={newPrice}
            onChange={setNewPrice}
            minValue={0}
            formatOptions={{ style: 'currency', currency: 'USD' }}
            width="size-1600"
          />
          <ActionButton
            onPress={handleCreate}
            isDisabled={creating || !newName.trim()}
          >
            <Add size="S" />
            <Text>Create Product</Text>
          </ActionButton>
          {creating && <ProgressCircle aria-label="Creating..." isIndeterminate size="S" />}
        </Flex>
      </Well>

      <Divider size="M" marginTop="size-200" marginBottom="size-200" />

      <Flex alignItems="center" justifyContent="space-between">
        <Heading level={3}>Product Records ({products.length})</Heading>
        <ActionButton onPress={loadProducts} isDisabled={loading}>
          <Refresh size="S" />
          <Text>Refresh</Text>
        </ActionButton>
      </Flex>

      {message && (
        <View marginBottom="size-200">
          <StatusLight variant="positive">{message}</StatusLight>
        </View>
      )}

      {error && (
        <View marginBottom="size-200">
          <StatusLight variant="negative">{error}</StatusLight>
        </View>
      )}

      {loading && (
        <Flex justifyContent="center" marginTop="size-300">
          <ProgressCircle aria-label="Loading..." isIndeterminate />
        </Flex>
      )}

      {!loading && products.length === 0 && (
        <Well>
          <Text>No products in database. Create your first product above.</Text>
        </Well>
      )}

      {!loading && products.length > 0 && (
        <View
          borderWidth="thin"
          borderColor="gray-300"
          borderRadius="medium"
          overflow="hidden"
        >
          <View
            padding="size-150"
            backgroundColor="gray-200"
          >
            <Flex>
              <Text UNSAFE_style={{ fontWeight: 'bold', width: '30%' }}>Name</Text>
              <Text UNSAFE_style={{ fontWeight: 'bold', width: '15%' }}>Price</Text>
              <Text UNSAFE_style={{ fontWeight: 'bold', width: '30%' }}>Created At</Text>
              <Text UNSAFE_style={{ fontWeight: 'bold', width: '25%' }}>Actions</Text>
            </Flex>
          </View>

          {products.map((product) => (
            <View
              key={product.id}
              padding="size-150"
              borderTopWidth="thin"
              borderTopColor="gray-200"
            >
              {editId === product.id ? (
                <Flex alignItems="end" gap="size-100" wrap>
                  <TextField
                    label="Name"
                    value={editName}
                    onChange={setEditName}
                    width="size-2400"
                  />
                  <NumberField
                    label="Price"
                    value={editPrice}
                    onChange={setEditPrice}
                    minValue={0}
                    formatOptions={{ style: 'currency', currency: 'USD' }}
                    width="size-1600"
                  />
                  <ActionButton onPress={handleUpdate} isDisabled={updating}>
                    <SaveFloppy size="S" />
                    <Text>Save</Text>
                  </ActionButton>
                  <ActionButton onPress={cancelEdit}>
                    <Text>Cancel</Text>
                  </ActionButton>
                  {updating && <ProgressCircle aria-label="Updating..." isIndeterminate size="S" />}
                </Flex>
              ) : (
                <Flex alignItems="center">
                  <Text UNSAFE_style={{ width: '30%' }}>{product.name}</Text>
                  <Text UNSAFE_style={{ width: '15%' }}>${product.price.toFixed(2)}</Text>
                  <Text UNSAFE_style={{ width: '30%', fontSize: '12px', color: '#6e6e6e' }}>
                    {new Date(product.created_at).toLocaleString()}
                  </Text>
                  <Flex UNSAFE_style={{ width: '25%' }} gap="size-100">
                    <ActionButton onPress={() => startEdit(product)}>
                      <Edit size="S" />
                      <Text>Edit</Text>
                    </ActionButton>
                    <Button
                      variant="negative"
                      onPress={() => handleDelete(product)}
                    >
                      <Delete size="S" />
                      <Text>Delete</Text>
                    </Button>
                  </Flex>
                </Flex>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

ProductCrud.propTypes = {
  runtime: PropTypes.any,
  ims: PropTypes.any
}

export default ProductCrud
