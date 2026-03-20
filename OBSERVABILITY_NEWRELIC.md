# Observability Assignment (Local + Subscription + Implementation)

This guide matches the assignment flow for observability using Adobe App Builder and New Relic.

## 1) Implemented Action

- Action: `observability`
- File: `actions/observability/index.js`

What it does:

- Logs execution start
- Logs input data
- Tracks execution time (`execution_time_ms`)
- Emits custom metrics as structured log events:
  - `request_count`
  - `success_count` / `failure_count`
  - `execution_time_ms`
- Simulates failures:
  - missing `taskName`
  - `simulateError=true`

Structured log format:

```json
{
  "level": "info",
  "message": "Execution started",
  "data": {
    "requestId": "..."
  },
  "timestamp": "..."
}
```

## 2) Local Setup

1. Install deps (if needed):

```bash
npm install
```

2. Run app locally:

```bash
aio app dev
```

3. Verify logs stream:

```bash
aio app logs
```

## 3) Action Config

- `app.config.yaml` contains:
  - `actions/observability/index.js`
  - input: `NEW_RELIC_LICENSE_KEY: $NEW_RELIC_LICENSE_KEY`
- `.env` contains:
  - `NEW_RELIC_LICENSE_KEY=<your-key>`

## 4) Deploy and Generate Observability Events

Deploy:

```bash
aio app deploy
```

Success test payload:

```json
{
  "taskName": "health-check",
  "simulateError": false
}
```

Failure test payload:

```json
{
  "taskName": "health-check",
  "simulateError": true
}
```

Missing input failure:

```json
{}
```

## 5) Observability Subscription (New Relic)

Configure in Adobe Developer Console (Workspace -> Stage):

1. Open Runtime / Logs Forwarding / Observability section
2. Add or verify subscription for action execution logs
3. Ensure destination is New Relic
4. Save subscription

## 6) What to Validate (Deliverables)

- Successful execution logs:
  - `Execution started`
  - `Input data`
  - `Execution completed`
- Error logs:
  - `Execution failed`
- Metrics visible:
  - `request_count`
  - `success_count` / `failure_count`
  - `execution_time_ms`
- Request flow traceable via `requestId`

## 7) Proof to Submit

- Screenshot / output of:
  - Action success response
  - Action failure response
  - CLI logs (`aio app logs`)
  - New Relic logs query showing the same `requestId` flow
