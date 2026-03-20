import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Flex,
  Heading,
  ActionButton,
  Button,
  StatusLight,
  ProgressCircle,
  Text,
  View,
  Well,
  Divider,
  Badge
} from '@adobe/react-spectrum'
import UploadToCloud from '@spectrum-icons/workflow/UploadToCloud'
import Delete from '@spectrum-icons/workflow/Delete'
import Share from '@spectrum-icons/workflow/Share'
import Refresh from '@spectrum-icons/workflow/Refresh'

import allActions from '../config.json'
import actionWebInvoke from '../utils'

const ACTION_KEY = 'nishaappbuilder/file-manager'

const TYPE_COLORS = {
  PNG: 'green',
  JPG: 'green',
  JPEG: 'green',
  GIF: 'green',
  WEBP: 'green',
  SVG: 'green',
  PDF: 'red',
  DOC: 'blue',
  DOCX: 'blue',
  TXT: 'gray',
  CSV: 'purple',
  JSON: 'yellow',
  XML: 'yellow'
}

function getTypeBadgeColor (type) {
  return TYPE_COLORS[type] || 'gray'
}

const FileManager = (props) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
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

  async function invokeAction (params) {
    const actionUrl = allActions[ACTION_KEY]
    if (!actionUrl) {
      throw new Error(`Action "${ACTION_KEY}" not found in config`)
    }
    return await actionWebInvoke(actionUrl, getHeaders(), params)
  }

  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await invokeAction({ operation: 'list' })
      console.log('File list:', result)
      setFiles(result.files || [])
    } catch (e) {
      console.error('Failed to load files:', e)
      setError(`Failed to load files: ${e.message || 'Unknown error'}`)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  async function handleUpload (e) {
    const file = e.target.files[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setError(null)
    setMessage(null)

    try {
      const base64 = await fileToBase64(file)
      const result = await invokeAction({
        operation: 'upload',
        fileName: file.name,
        fileContent: base64
      })
      console.log('Upload result:', result)
      setMessage(`File "${file.name}" uploaded successfully`)
      await loadFiles()
    } catch (e) {
      console.error('Upload failed:', e)
      setError(`Upload failed: ${e.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function fileToBase64 (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleDelete (filePath, fileName) {
    if (!window.confirm(`Delete "${fileName}"?`)) return

    setError(null)
    setMessage(null)

    try {
      await invokeAction({ operation: 'delete', filePath })
      setMessage(`File "${fileName}" deleted`)
      await loadFiles()
    } catch (e) {
      console.error('Delete failed:', e)
      setError(`Delete failed: ${e.message}`)
    }
  }

  async function handleShare (filePath, fileName) {
    setError(null)
    setMessage(null)

    try {
      const result = await invokeAction({ operation: 'share', filePath })
      console.log('Share URL:', result.url)
      await navigator.clipboard.writeText(result.url)
      setMessage(`Share link for "${fileName}" copied to clipboard! (Expires in ${result.expiresIn})`)
    } catch (e) {
      console.error('Share failed:', e)
      setError(`Share failed: ${e.message}`)
    }
  }

  return (
    <View width="size-8000" maxWidth="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap="size-100">
          <Heading level={1}>File Manager</Heading>
          <Badge variant="info">{files.length} files</Badge>
        </Flex>
      </Flex>
      <Text>Upload files to cloud storage and generate public share links.</Text>

      <Divider size="M" marginTop="size-200" marginBottom="size-200" />

      <Heading level={3}>Upload a File</Heading>
      <Well>
        <Flex alignItems="center" gap="size-200">
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#0265DC',
              color: 'white',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            <UploadToCloud size="S" />
            Choose File
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {uploading && <ProgressCircle aria-label="Uploading..." isIndeterminate size="S" />}
          <Text UNSAFE_style={{ color: '#6e6e6e', fontSize: '12px' }}>
            Select any file to upload. It will be stored in Adobe cloud storage.
          </Text>
        </Flex>
      </Well>

      <Divider size="M" marginTop="size-200" marginBottom="size-200" />

      <Flex alignItems="center" justifyContent="space-between">
        <Heading level={3}>Stored Files</Heading>
        <ActionButton onPress={loadFiles} isDisabled={loading}>
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
        <Flex justifyContent="center" marginTop="size-400">
          <ProgressCircle aria-label="Loading files..." isIndeterminate />
        </Flex>
      )}

      {!loading && files.length === 0 && (
        <Well marginTop="size-100">
          <Text>No files uploaded yet. Upload your first file above.</Text>
        </Well>
      )}

      {!loading && files.length > 0 && (
        <View marginTop="size-100">
          {files.map((file) => (
            <View
              key={file.path}
              padding="size-150"
              borderBottomWidth="thin"
              borderBottomColor="gray-300"
            >
              <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap="size-150">
                  <Badge variant={getTypeBadgeColor(file.type)}>{file.type}</Badge>
                  <Text>{file.name}</Text>
                </Flex>
                <Flex gap="size-100">
                  <ActionButton
                    onPress={() => handleShare(file.path, file.name)}
                  >
                    <Share size="S" />
                    <Text>Share</Text>
                  </ActionButton>
                  <Button
                    variant="negative"
                    onPress={() => handleDelete(file.path, file.name)}
                  >
                    <Delete size="S" />
                    <Text>Delete</Text>
                  </Button>
                </Flex>
              </Flex>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

FileManager.propTypes = {
  runtime: PropTypes.any,
  ims: PropTypes.any
}

export default FileManager
