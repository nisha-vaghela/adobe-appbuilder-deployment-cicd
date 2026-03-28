# nishaappbuilder

Single master guide for setup, features, observability, and deployment/CI-CD.

## 1) Project Features

This app includes:

- SKU lookup actions (`get-product`, `get-product-by-sku`)
- Product CRUD (`product-crud`) with State storage
- File manager (`file-manager`) with Files SDK
- API Mesh flow (`mesh-products`, `mesh-inventory`, `api-mesh`)
- Debug logs action (`debug-logs`)
- Observability action (`observability`) with New Relic forwarding
- React UI pages under `web-src/src/components/`

## 2) Important Files

- `app.config.yaml`: Action registration and env mapping
- `.env`: Runtime credentials and environment values
- `mesh.json`: API Mesh schema/source mapping
- `actions/`: Backend business logic
- `web-src/`: Frontend UI
- `.github/workflows/`: CI/CD workflows

## 3) Local Setup

From project root:

```bash
cd /home/nisha.vaghela@brainvire.com/projects/appbuilder/nishaappbuilder
npm install
```

Run locally:

```bash
aio app dev
```

Useful commands:

```bash
aio app logs
aio app test
aio app deploy
aio app undeploy
```

## 4) Observability and Debugging (New Relic)

### `debug-logs` action

- Logs start/input/success/error
- Supports failure simulation via `simulateError=true`
- Forwards structured logs to New Relic if `NEW_RELIC_LICENSE_KEY` exists

### `observability` action

- Logs execution start/end and input
- Tracks `execution_time_ms`
- Emits metrics via structured logs:
  - `request_count`
  - `success_count` / `failure_count`
  - `execution_time_ms`

### Dynamic lifecycle logging

`product-crud` now emits lifecycle events after `create/update/delete` to:

- `OBSERVABILITY_WEB_ACTION_URL`

So product save/update/delete generates dynamic observability logs.

## 5) API and UI Flow

- UI calls action endpoints from `web-src/src/config.json`
- Actions read env values from `app.config.yaml` -> `.env`
- API Mesh merges product + inventory responses by SKU

## 6) Multi-Environment Deployment (Dev/Stage)

Create two Adobe Developer Console workspaces:

- `Dev`
- `Stage`

Manual deployment:

1. Load workspace-specific values in `.env`
2. Run:

```bash
aio app deploy
```

Capture terminal output/screenshots for assignment proof.

## 7) GitHub CI/CD

Repo:

- `https://github.com/nisha-vaghela/adobe-appbuilder-deployment-cicd`

Main workflow:

- `.github/workflows/appbuilder-deploy.yml`

Behavior:

- Auto deploy on push to `stage` branch -> deploys to GitHub `stage` environment
- Manual run (`workflow_dispatch`) -> deploy to selected `dev` or `stage`

Pipeline steps:

1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Lint
5. Install Adobe I/O CLI
6. Deploy via `aio app deploy`

## 8) Required GitHub Environment Secrets

Create GitHub environments:

- `dev`
- `stage`

Add these secrets in each environment (workspace-specific values):

- `AIO_RUNTIME_AUTH`
- `AIO_RUNTIME_NAMESPACE`
- `AIO_RUNTIME_APIHOST`
- `AIO_IMS_CLIENT_ID`
- `AIO_IMS_CLIENT_SECRETS`
- `AIO_IMS_TECHNICAL_ACCOUNT_EMAIL`
- `AIO_IMS_TECHNICAL_ACCOUNT_ID`
- `AIO_IMS_SCOPES`
- `AIO_IMS_ORG_ID`
- `SERVICE_API_KEY`
- `IMS_OAUTH_S2S_CLIENT_ID`
- `IMS_OAUTH_S2S_CLIENT_SECRET`
- `IMS_OAUTH_S2S_ORG_ID`
- `IMS_OAUTH_S2S_SCOPES`
- `BASE_URL`
- `COMMERCE_CONSUMER_KEY`
- `COMMERCE_CONSUMER_SECRET`
- `COMMERCE_ACCESS_TOKEN`
- `COMMERCE_ACCESS_TOKEN_SECRET`
- `MESH_ID`
- `MESH_ENDPOINT`
- `M247_BASE_URL`
- `M247_COMMERCE_CONSUMER_KEY`
- `M247_COMMERCE_CONSUMER_SECRET`
- `M247_COMMERCE_ACCESS_TOKEN`
- `M247_COMMERCE_ACCESS_TOKEN_SECRET`
- `NEW_RELIC_LICENSE_KEY`
- `OBSERVABILITY_WEB_ACTION_URL`

## 9) Assignment Validation Checklist

- [ ] Dev manual deploy successful
- [ ] Stage manual deploy successful
- [ ] Code available in GitHub repository
- [ ] CI/CD run successful in GitHub Actions
- [ ] Stage auto deploy verified after merge/push to `stage`
- [ ] Logs/screenshots collected for submission
