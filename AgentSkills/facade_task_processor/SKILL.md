# AgentSkill: facade_task_processor

## Purpose
Process tasks from the FacadeFlow project management system. This skill enables Canyon to:
- Receive tasks from FacadeFlow via webhook or polling
- Execute appropriate actions (transcribe voice notes, analyze photos, generate documents)
- Update FacadeFlow with results

## Configuration

Required environment variables:
- `FACADEFLOW_API_URL`: Base URL of the FacadeFlow backend API
- `FACADEFLOW_WEBHOOK_SECRET`: Secret for verifying webhook signatures (optional but recommended)
- `FACADEFLOW_API_KEY`: API key for authentication (alternative to JWT tokens)

Optional:
- `FACADEFLOW_POLL_INTERVAL_MS`: How often to poll for new tasks (default: 60000ms = 1 minute)
- `FACADEFLOW_TASK_STATUS_ENDPOINT`: Webhook endpoint to POST status updates (defaults to `/api/webhooks/facadeflow` in current session)

## Task Types Supported

### 1. `transcribe_voice_note`
**Description:** Transcribe an audio recording to text

**Payload:**
```json
{
  "taskId": "task_123",
  "voiceNoteId": "vn_456",
  "audioUrl": "https://your-storage.com/audio/abc.mp3",
  "projectId": "proj_789"
}
```

**Action:**
- Download audio file (or process URL directly)
- Use OpenClaw's openai-whisper skill
- Send transcript back to FacadeFlow

**Result sent to FacadeFlow:**
```json
{
  "taskId": "task_123",
  "status": "completed",
  "transcript": "Transcript text here...",
  "completedAt": "2025-03-18T..."
}
```

**On error:**
```json
{
  "taskId": "task_123",
  "status": "failed",
  "error": "Error message",
  "completedAt": "2025-03-18T..."
}
```

---

### 2. `analyze_photo`
**Description:** Analyze a construction/facade photo for issues, measurements, or documentation

**Payload:**
```json
{
  "taskId": "task_123",
  "photoId": "photo_456",
  "imageUrl": "https://your-storage.com/photos/abc.jpg",
  "projectId": "proj_789",
  "analysisType": "damage_assessment" // or "measurement", "material_identification", "general"
}
```

**Action:**
- If using vision model (GPT-4o, Claude 3.5 Sonnet, etc.): analyze image
- Otherwise: Provide placeholder with suggestions
- Extract observations, measurements, issues

**Result:**
```json
{
  "taskId": "task_123",
  "status": "completed",
  "analysis": {
    "observations": ["Cracked sealant around window", "Fading paint on southern facade"],
    "measurements": ["Window opening: 60x48 inches"],
    "recommendations": ["Reseal window perimeter", "Consider repainting"]
  },
  "completedAt": "2025-03-18T..."
}
```

---

### 3. `generate_estimate`
**Description:** Create a professional estimate/quote document

**Payload:**
```json
{
  "taskId": "task_123",
  "projectId": "proj_789",
  "projectName": "Main Street Window Replacement",
  "clientName": "John Doe",
  "items": [
    {
      "description": "Replace 10 double-hung windows",
      "quantity": 10,
      "unitPrice": 450,
      "unit": "each"
    }
  ],
  "taxRate": 0.07,
  "adjustments": [],
  "template": "standard" // or "detailed", "simple"
}
```

**Action:**
- Use Handlebars or similar to render HTML template
- Convert to PDF (via Puppeteer on backend or expo-print if local)
- Upload to cloud storage
- Return PDF URL

**Result:**
```json
{
  "taskId": "task_123",
  "status": "completed",
  "estimateId": "est_999",
  "pdfUrl": "https://your-storage.com/estimates/est_999.pdf",
  "completedAt": "2025-03-18T..."
}
```

---

### 4. `daily_brief`
**Description:** Generate morning summary of projects, tasks, estimates

**Payload:**
```json
{
  "date": "2025-03-18",
  "recipient": "telegram:6965983037" // or email, etc.
}
```

**Action:**
- Query FacadeFlow for:
  - Active projects count
  - Overdue tasks
  - Today's appointments
  - Estimates sent this week
  - Revenue pipeline
- Format as readable message
- Send via configured channel (Telegram by default for this setup)

**Result:**
- Message sent to recipient
- Log sent in response

---

### 5. `sync_github_issues`
**Description:** Sync GitHub issues with FacadeFlow tasks

**Payload:**
```json
{
  "direction": "github_to_facadeflow" | "facadeflow_to_github",
  "repository": "owner/repo",
  "labels": ["facadeflow", "bug", "feature"] // filter labels
}
```

**Action:**
- Fetch GitHub issues with specified labels
- Create/update FacadeFlow tasks
- Or vice versa: export FacadeFlow tasks as GitHub issues

---

## Endpoints

### Webhook Receiver (FacadeFlow → OpenClaw)
POST `/webhooks/facadeflow`

Expected headers:
- `X-FacadeFlow-Signature`: HMAC signature of payload (if secret configured)

Payload:
```json
{
  "event": "task_created" | "task_updated",
  "task": {
    "id": "task_123",
    "type": "transcribe_voice_note" | "analyze_photo" | "generate_estimate" | "daily_brief" | "github_sync",
    "payload": { ...task-specific data },
    "status": "pending" | "in_progress" | "completed" | "failed",
    "createdAt": "2025-03-18T..."
  }
}
```

Response: `{ "received": true, "taskId": "task_123" }`

---

### Status Poller (Fallback)
If webhooks are not configured, OpenClaw can poll `/api/export/tasks?status=pending&assignedTo=canyon` periodically.

---

## Setup in FacadeFlow

1. Create a webhook endpoint configuration in FacadeFlow backend pointing to OpenClaw:
   ```
   POST https://your-openclaw-instance/webhooks/facadeflow
   ```

2. Set secret shared key in both systems.

3. When creating a task in FacadeFlow, set `assignee = "canyon"` or add label `facadeflow-canyon`.

4. Task status updates are sent back via POST to FacadeFlow's webhook endpoint:
   ```
   POST /api/webhooks/openclaw
   {
     "taskId": "...",
     "status": "completed|failed",
     "result": { ... },
     "completedAt": "..."
   }
   ```

---

## Cron Jobs

- **Polling** (if not using webhooks): Every minute
- **Daily brief**: At 7:00 AM local time
- **GitHub sync**: Every 30 minutes (if configured)

---

## Error Handling

- Network errors → retry with exponential backoff (max 3 attempts)
- Invalid payload → log and mark task failed with error message
- Missing permissions → escalate to manual review

---

## Logging & Monitoring

All task executions are logged to:
- Session memory (for debugging)
- Optional: Log to file `logs/facade_tasks.log`
- Optional: Send to Sentry for errors

---

## Future Enhancements

- Support for `create_project_from_scan` (OCR from documents)
- `optimize_route` for field technicians
- `price_check` against supplier APIs
- `voice_command` processing from Telegram voice messages
- `generate_site_report` combining all project data into PDF
