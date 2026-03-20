import {
  ActionButton,
  Flex,
  Heading,
  ProgressCircle,
  View,
  Text,
  Well,
  Divider
} from '@adobe/react-spectrum'
import { attach } from '@adobe/uix-guest'
import { useEffect, useState } from 'react'
import { extensionId } from './Constants'
import ApiMeshPage from './ApiMeshPage'

export const MainPage = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [imsToken, setImsToken] = useState(null)
  const [imsOrg, setImsOrg] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        if (!props.ims?.token) {
          const guestConnection = await Promise.race([
            attach({ id: extensionId }),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Guest context timeout')), 5000)
            })
          ])
          const token = guestConnection?.sharedContext?.get('imsToken')
          const org = guestConnection?.sharedContext?.get('imsOrgId')
          setImsToken(token || null)
          setImsOrg(org || null)
          if (!token) {
            setStatusMessage('Running outside Commerce shell. Open from Adobe Commerce Admin for IMS context.')
          }
        } else {
          setImsToken(props.ims.token)
          setImsOrg(props.ims.org)
        }
      } catch (e) {
        setStatusMessage('Could not attach Commerce shell context. API calls may fail without IMS headers.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [])

  return (
    <View padding="size-400">
      {isLoading ? (
        <Flex alignItems="center" justifyContent="center" height="100vh">
          <ProgressCircle size="L" aria-label="Loading..." isIndeterminate />
        </Flex>
      ) : (
        <Flex direction="column" gap="size-300">
          <Heading level={1}>Nisha App Builder - Admin Panel</Heading>
          <Divider size="M" />
          <Flex gap="size-100" wrap>
            <ActionButton
              onPress={() => setActiveView('overview')}
              isQuiet={activeView !== 'overview'}
            >
              <Text>Overview</Text>
            </ActionButton>
            <ActionButton
              onPress={() => setActiveView('api-mesh')}
              isQuiet={activeView !== 'api-mesh'}
            >
              <Text>API Mesh</Text>
            </ActionButton>
          </Flex>

          <Well>
            <Text>
              Official entrypoint: Open this extension from Adobe Commerce Admin (single-place flow).
            </Text>
            <Text>IMS Org: {imsOrg || 'Not available'}</Text>
            <Text>IMS Token: {imsToken ? 'Connected' : 'Not connected'}</Text>
            {statusMessage && <Text>{statusMessage}</Text>}
          </Well>

          {activeView === 'overview' && (
            <Well>
              <Text>
                Welcome to the Nisha App Builder extension for Adobe Commerce Admin.
                This page is loaded inside the Magento Admin panel via the Admin UI SDK.
              </Text>
              <Text>
                Use the API Mesh tab to run product + inventory combined queries from one place.
              </Text>
            </Well>
          )}

          {activeView === 'api-mesh' && (
            <ApiMeshPage imsToken={imsToken} imsOrg={imsOrg} />
          )}
        </Flex>
      )}
    </View>
  )
}
