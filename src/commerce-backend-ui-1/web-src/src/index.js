import 'core-js/stable'
import 'regenerator-runtime/runtime'

import ReactDOM from 'react-dom'

import Runtime, { init } from '@adobe/exc-app'

import App from './components/App'
import './index.css'

window.React = require('react')

try {
  require('./exc-runtime')
  init(bootstrapInExcShell)
} catch (e) {
  console.log('application not running in Adobe Experience Cloud Shell')
  bootstrapRaw()
}

function renderApp(runtime, ims) {
  ReactDOM.render(
    <App runtime={runtime} ims={ims} />,
    document.getElementById('root')
  )
}

function bootstrapRaw() {
  const mockRuntime = { on: () => {} }
  renderApp(mockRuntime, {})
}

function bootstrapInExcShell() {
  const runtime = Runtime()

  runtime.on('ready', ({ imsOrg, imsToken, imsProfile, locale }) => {
    runtime.done()
    console.log('Ready! received imsProfile:', imsProfile)
    const ims = {
      profile: imsProfile,
      org: imsOrg,
      token: imsToken
    }
    renderApp(runtime, ims)
  })

  runtime.solution = {
    icon: 'AdobeExperienceCloud',
    title: 'NishaAppBuilder',
    shortTitle: 'NAB'
  }
  runtime.title = 'NishaAppBuilder'
}
