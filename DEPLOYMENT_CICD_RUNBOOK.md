# Deployment & Environments + GitHub CI/CD

This runbook is for the assignment:
- Dev and Stage environment deployment
- GitHub repository integration
- Automatic CI/CD deployment with GitHub Actions

## 1) Adobe Developer Console Workspaces

Create two workspaces in the same Adobe Developer Console project:
- `Dev`
- `Stage`

Download the workspace `.env` for each workspace and keep values separately.

## 2) Manual Deployment (Local)

From project root:

```bash
cd /home/nisha.vaghela@brainvire.com/projects/appbuilder/nishaappbuilder
```

### Deploy to Dev

1. Load Dev workspace env values in local `.env`
2. Run:

```bash
aio app deploy
```

### Deploy to Stage

1. Replace `.env` with Stage workspace env values
2. Run:

```bash
aio app deploy
```

Capture screenshots/logs from terminal for assignment proof.

## 3) GitHub Repository

Repository created:
- `https://github.com/nisha-vaghela/adobe-appbuilder-deployment-cicd`

## 4) CI/CD Workflow Added

Workflow file:
- `.github/workflows/appbuilder-deploy.yml`

Behavior:
- On `push` to `main` -> deploys to `dev` environment
- On `workflow_dispatch` -> lets you choose `dev` or `stage`

Pipeline steps:
1. Checkout code
2. Setup Node.js 22
3. Install dependencies (`npm ci`)
4. Lint (`npm run lint`)
5. Install Adobe I/O CLI
6. Deploy (`aio app deploy`)

## 5) GitHub Environments & Secrets (Important)

Create two GitHub Environments in repo settings:
- `dev`
- `stage`

In each environment, add the same secret keys but workspace-specific values.

### Required secret names

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

## 6) Trigger and Verify CI/CD

### Auto deploy to Dev

1. Make code change
2. Commit and push to `main`
3. Verify workflow run in GitHub Actions tab
4. Confirm app deploy output in logs

### Deploy to Stage

1. Open Actions -> `App Builder Deploy`
2. Click `Run workflow`
3. Select `target_environment = stage`
4. Verify successful run logs

## 7) Deliverables Checklist

- [ ] Manual deploy logs/screenshot for Dev
- [ ] Manual deploy logs/screenshot for Stage
- [ ] GitHub repo with full source code
- [ ] GitHub Actions run screenshot (Dev auto deploy)
- [ ] GitHub Actions run screenshot (Stage manual dispatch)
- [ ] Proof of environment-based deployment (different workspace/secrets)
