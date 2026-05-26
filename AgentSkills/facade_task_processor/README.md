# FacadeFlow OpenClaw AgentSkill

Enables OpenClaw (Canyon) to process tasks from the FacadeFlow project management system. Canyon can transcribe voice notes, analyze photos, generate estimates, send daily briefs, and sync with GitHub.

## Capabilities

- **transcribe_voice_note**: Accepts an audio URL, returns transcript via Whisper.
- **analyze_photo**: Analyzes facade/construction photos (with vision model if available).
- **generate_estimate**: Creates PDF estimate from line items and uploads to storage.
- **daily_brief**: Fetches project summary and sends Telegram message.
- **github_sync**: Bi-directional sync between FacadeFlow tasks and GitHub issues.

## Prerequisites

- OpenClaw gateway running (2026.3+)
- FacadeFlow backend API reachable from this host
- Optional: Telegram bot configured to send daily briefs
- Optional: GitHub token for issue sync

## Configuration

Set these environment variables **in OpenClaw** (via systemd service environment, `.env` file, or OpenClaw config):

| Variable | Required | Purpose |
|----------|----------|---------|
| `FACADEFLOW_API_URL` | Yes | Base URL of FacadeFlow API, e.g. `https://your-backend.com/api` |
| `FACADEFLOW_API_KEY` | Yes | Bearer token for authenticating API calls |
| `FACADEFLOW_WEBHOOK_SECRET` | No | HMAC secret for verifying webhook signatures (recommended) |
| `TELEGRAM_CHAT_ID` | No (for daily brief) | Chat ID to send morning brief to |
| `GITHUB_TOKEN` | No (for GitHub sync) | GitHub personal access token with repo access |

### Setting env vars in OpenClaw

You can set them in `~/.openclaw/openclaw.json` under `env` or use a `.env` file in the workspace directory. Example `openclaw.json` addition:

```json
{
  "env": {
    "FACADEFLOW_API_URL": "https://api.facadeflow.com",
    "FACADEFLOW_API_KEY": "your-secret-key",
    "FACADEFLOW_WEBHOOK_SECRET": "shared-secret",
    "TELEGRAM_CHAT_ID": "6965983037"
  }
}
```

After editing config, restart the gateway:

```bash
openclaw gateway restart
```

## Installation

Copy the `facade_task_processor` folder to OpenClaw's skills directory:

```bash
cp -r FacadeFlow_Canyon/AgentSkills/facade_task_processor ~/.openclaw/skills/
```

Then register the skill in `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "facade_task_processor": {
        "enabled": true,
        "env": {}  // You can also put env vars here specifically for this skill
      }
    }
  }
}
```

Restart the gateway.

## Webhook Setup (FacadeFlow → OpenClaw)

To receive tasks from FacadeFlow, expose OpenClaw's webhook endpoint. The skill expects OpenClaw to be reachable at a public URL (or via Tailscale). Configure FacadeFlow to send webhooks to:

```
POST https://your-openclaw-host/webhooks/facade_task_processor
```

Headers to include:
- `Content-Type: application/json`
- `X-FacadeFlow-Signature: <HMAC-SHA256 of payload>` if `FACADEFLOW_WEBHOOK_SECRET` is set.

Payload format:

```json
{
  "taskId": "unique-task-id",
  "type": "transcribe_voice_note",
  "payload": { ... },
  "status": "pending",
  "createdAt": "2025-03-18T10:00:00Z"
}
```

The skill will update task status by POSTing back to FacadeFlow's configured webhook endpoint (usually `/api/webhooks/openclaw`). Make sure that endpoint exists and verifies signatures.

## Polling Fallback

If webhooks aren't feasible, FacadeFlow can expose an endpoint that OpenClaw polls periodically. Configure OpenClaw to poll FacadeFlow's task export endpoint (not implemented here; would require an additional wrapper).

## Daily Brief Cron

The daily brief is already set up via `openclaw cron` in this workspace. The cron job invokes an agent turn that will call this skill's `daily_brief` handler. Ensure `TELEGRAM_CHAT_ID` is set so the brief is delivered.

## Implementation Notes

- The skill uses `fetch` for HTTP requests, which is available in OpenClaw's Node runtime.
- File uploads use base64-encoded JSON to avoid multipart/FormData compatibility issues.
- PDF generation is a placeholder; integrate Puppeteer or a backend service for real PDFs.
- Voice transcription uses a mock; wire to actual Whisper API or OpenClaw's built-in skill when accessible.
- All API calls include retry logic (3 attempts, exponential backoff).

## Testing

You can invoke the skill manually by sending a test task via OpenClaw's messaging or by crafting a curl request to the webhook endpoint (if exposed). Watch logs:

```bash
tail -f /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log
```

## Security

- Keep `FACADEFLOW_API_KEY` and `FACADEFLOW_WEBHOOK_SECRET` confidential.
- Use HTTPS for all webhook communications.
- Verify HMAC signatures on incoming webhooks (handled automatically if secret configured).
- Set appropriate CORS and firewall rules on the OpenClaw host.

## Troubleshooting

- **Skill not loading**: Check OpenClaw logs for syntax errors. Ensure TypeScript compiles.
- **Webhook 404**: Skill must be enabled in `openclaw.json` and gateway restarted.
- **Auth failures**: Verify `FACADEFLOW_API_KEY` is correct and not expired.
- **No Telegram brief**: Set `TELEGRAM_CHAT_ID` and ensure OpenClaw can send messages to that chat.

## Future Enhancements

- Real PDF generation with Puppeteer.
- Vision analysis integration (GPT-4o, Claude Sonnet).
- Voice transcription via local Whisper CLI (already available in OpenClaw).
- Offline queue for tasks when FacadeFlow is unreachable.
- Detailed error reporting back to FacadeFlow.
