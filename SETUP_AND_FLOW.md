# App Builder Setup and Flow (Simple Guide)

This file explains what was done, which files are used, and how to run the project.

## 1) What We Built

- Multiple App Builder actions (product lookup, CRUD, file manager, API mesh flow)
- React UI pages for each feature
- Dynamic API Mesh flow for Product + Inventory
- OAuth/anonymous-based Magento API calls through actions

## 2) Main Files and Why They Exist

### Core Config

- `app.config.yaml`  
  Registers all actions and maps env variables (`BASE_URL`, `M247_*`, `MESH_ENDPOINT`, etc.).

- `.env`  
  Stores runtime variables and credentials (API keys, tokens, base URLs, mesh endpoint).

- `mesh.json`  
  API Mesh configuration. Defines GraphQL sources (`productBySku`, `inventoryBySku`) through web actions.

### Backend Actions (`actions/`)

- `actions/get-product-by-sku/index.js`  
  Product lookup action (single or comma-separated SKU support).

- `actions/product-crud/index.js`  
  CRUD operations using App Builder State storage.

- `actions/file-manager/index.js`  
  File upload/list/delete/share using App Builder Files SDK.

- `actions/api-mesh/index.js`  
  Calls GraphQL mesh endpoint and returns combined response.

- `actions/mesh-products/index.js`  
  Calls Magento Product API by SKU (currently direct fetch style).

- `actions/mesh-inventory/index.js`  
  Calls Magento Inventory API by SKU.

- `actions/oauth1a.js`  
  Shared OAuth1 helper used where signed Magento requests are needed.

### Frontend UI (`web-src/src/components/`)

- `App.js`  
  Main routes and layout (left sidebar + pages).

- `SideBar.js`  
  Left navigation menu.

- `ActionsForm.js`  
  Generic action invoke page.

- `ProductLookup.js`  
  SKU input -> product details page.

- `ProductCrud.js`  
  Create/List/Update/Delete product records page.

- `FileManager.js`  
  Upload/list/share/delete file UI.

- `ApiMesh.js`  
  API Mesh UI (SKU based call for product + inventory combined data).

### Extension (kept in project)

- `src/commerce-backend-ui-1/...`  
  Commerce Admin extension files. Kept for extension use-cases (not required for main app menu flow).

## 3) Standard Run Steps

## Local Development

1. Start project:
   - `aio app dev`
2. Open:
   - `https://localhost:9080/#/`

## Deployed Flow

1. Update `.env` with current working URLs (especially `BASE_URL`, `M247_BASE_URL`, `MESH_ENDPOINT`).
2. Deploy app:
   - `aio app deploy`
3. Update mesh:
   - `aio api-mesh:update mesh.json`
4. Open deployed app:
   - `https://748062-nishaappbuilder-stage.adobeio-static.net/index.html#/`

## 4) If Something Fails

- If API Mesh fails: check `MESH_ENDPOINT`, mesh update status, and action URLs.
- If Magento product/inventory fails: verify `BASE_URL`/`M247_BASE_URL` and SKU exists.
- If ngrok URL changed: update `.env`, then redeploy + mesh update again.
- If UI looks old/cached: hard refresh (`Ctrl+Shift+R`) or open incognito.

## 5) One-Line Summary

`app.config.yaml` + `.env` control runtime wiring, `actions/` handle backend logic, and `web-src/src/components/` is the user-facing UI.
