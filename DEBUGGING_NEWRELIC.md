# Debugging and Logs Assignment (New Relic Only)

This guide covers the required flow:

`action called -> logs generated -> logs viewed -> error triggered -> error logs captured`

Splunk is intentionally skipped.

## Implemented Action

- Action name: `debug-logs`
- File: `actions/debug-logs/index.js`

What it logs:

1. Info log at start
2. Input data log
3. Success flow logs
4. Error flow logs (if input missing or simulate flag enabled)

Structured format used:

```json
{
  "level": "info",
  "message": "Processing request",
  "data": {},
  "timestamp": "..."
}
```

## Inputs

- `taskName` (required for success flow)
- `simulateError` (optional, set `true` to force error)
- `NEW_RELIC_LICENSE_KEY` (from `.env`)

## Config files updated

- `app.config.yaml` -> registered `debug-logs` action
- `.env` -> `NEW_RELIC_LICENSE_KEY`
- `web-src/src/config.json` -> added `debug-logs` endpoint

## Deploy

```bash
aio app deploy
```

## Generate Success Logs

Use `Your App Actions` UI or curl:

```bash
curl -X POST "https://748062-nishaappbuilder-stage.adobeio-static.net/api/v1/web/nishaappbuilder/debug-logs" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"order-sync","simulateError":false}'
```

Expected:
- HTTP 200
- response contains `requestId`
- info logs in CLI + New Relic

## Generate Error Logs

### Case A: Missing input

```bash
curl -X POST "https://748062-nishaappbuilder-stage.adobeio-static.net/api/v1/web/nishaappbuilder/debug-logs" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Case B: Simulated error

```bash
curl -X POST "https://748062-nishaappbuilder-stage.adobeio-static.net/api/v1/web/nishaappbuilder/debug-logs" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"order-sync","simulateError":true}'
```

Expected:
- HTTP 400
- error logs generated in CLI + New Relic

## View Logs in CLI

```bash
aio app logs
```

Filter by action name/keyword:
- `debug-logs`
- `Processing request`
- `Execution failed`

## View Logs in New Relic

1. Open New Relic Logs
2. Search for:
   - `debug-logs`
   - `requestId`
   - `Execution completed successfully`
   - `Execution failed`

This confirms:
- successful execution logs
- error logs
- complete request flow
