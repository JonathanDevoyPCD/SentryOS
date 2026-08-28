# SentryOS local API contract

The dashboard depends on a stable provider-neutral interface. The current mock implementation and future router adapters should return the same shapes.

## Proposed endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/snapshot` | Sanitised router, radio, WAN and client state |
| `POST` | `/api/v1/diagnostics` | Run an allowlisted read-only diagnostic |
| `POST` | `/api/v1/ai/analyze` | Analyse a prompt and current sanitised snapshot |
| `POST` | `/api/v1/actions/:id/execute` | Execute an approved, policy-validated action |
| `GET` | `/api/v1/reports` | List generated network reports |
| `POST` | `/api/v1/reports` | Generate a report from current observations |

## AI analysis response

```json
{
  "summary": "The 2.4 GHz radio is likely sharing a busy channel.",
  "findings": [
    { "label": "Channel utilisation", "value": "78%", "tone": "warning" }
  ],
  "actions": [
    {
      "id": "run_channel_scan",
      "parameters": {},
      "reason": "Measure nearby channel use",
      "rollback": "No change was made"
    }
  ]
}
```

The service must validate action identifiers and parameters independently of the AI response. The browser may display the returned policy classification, but it is not the security boundary.

## Security expectations

- Local authenticated session with idle expiry and CSRF protection
- Same-origin browser requests; no AI provider credential sent to the browser
- Sensitive WAN and client fields sanitised before AI analysis
- Explicit confirmation token for configuration-changing requests
- Rate limits, timeouts, audit logs and idempotency keys for mutations
- Firmware, bootloader and flash-partition operations excluded until the hardware gate is complete
