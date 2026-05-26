import { message } from 'openclaw-messaging';
import { web_fetch } from 'openclaw-tools-available';

// =====================
// Configuration & Validation
// =====================

const API_URL = process.env.FACADEFLOW_API_URL;
const WEBHOOK_SECRET = process.env.FACADEFLOW_WEBHOOK_SECRET;
const API_KEY = process.env.FACADEFLOW_API_KEY;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function validateConfig(): void {
  const missing: string[] = [];
  if (!API_URL) missing.push('FACADEFLOW_API_URL');
  if (!API_KEY) missing.push('FACADEFLOW_API_KEY');
  // Optional: WEBHOOK_SECRET, TELEGRAM_CHAT_ID, GITHUB_TOKEN

  if (missing.length > 0) {
    throw new Error(`FacadeFlow skill: Missing required environment variables: ${missing.join(', ')}. Set them in OpenClaw config or .env.`);
  }
}

// Validate on module load
validateConfig();

// =====================
// Types & Interfaces
// =====================

export interface FacadeFlowTask {
  id: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  createdAt: string;
  projectId?: string;
}

export type TaskType =
  | 'transcribe_voice_note'
  | 'analyze_photo'
  | 'generate_estimate'
  | 'daily_brief'
  | 'github_sync';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
  completedAt: string;
}

// Task payloads
export interface TranscribePayload {
  voiceNoteId: string;
  audioUrl?: string;
  projectId: string;
}

export interface AnalyzePhotoPayload {
  photoId: string;
  imageUrl?: string;
  projectId: string;
  analysisType: 'damage_assessment' | 'measurement' | 'material_identification' | 'general';
}

export interface GenerateEstimatePayload {
  projectId: string;
  projectName: string;
  clientName: string;
  items: EstimateItem[];
  taxRate?: number;
  adjustments?: Adjustment[];
  template?: 'standard' | 'detailed' | 'simple';
}

export interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface Adjustment {
  description: string;
  amount: number;
  type: 'add' | 'discount';
}

export interface DailyBriefPayload {
  date?: string; // YYYY-MM-DD, defaults to today
}

export interface GitHubSyncPayload {
  direction: 'github_to_facadeflow' | 'facadeflow_to_github';
  repository: string; // owner/repo
  labels?: string[];
}

// Result shapes
export interface TranscribeResult {
  transcript: string;
  voiceNoteId: string;
}

export interface AnalyzeResult {
  photoId: string;
  analysis: {
    observations: string[];
    measurements: { description: string; value: number; unit: string }[];
    recommendations: string[];
    analysisType: string;
  };
}

export interface EstimateResult {
  estimateId: string;
  pdfUrl: string;
  total: number;
}

export interface DailyBriefResult {
  date: string;
  sentAt: string;
  recipient: string | undefined;
}

export interface GitHubSyncResult {
  direction: string;
  created: number;
  total: number;
}

interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
  completedAt: string;
}

// =====================
// Main Entry Point
// =====================

/**
 * Main entry point for processing a FacadeFlow task.
 * Called by OpenClaw when a task arrives via webhook or session message.
 */
export async function processFacadeFlowTask(
  taskId: string,
  taskType: TaskType,
  payload: any
): Promise<TaskResult> {
  const startTime = Date.now();
  console.log(`[FacadeFlow] Processing task ${taskId} of type ${taskType}`);

  try {
    const result = await executeTaskWithRetry(taskId, taskType, payload, 3);

    const duration = Date.now() - startTime;
    console.log(`[FacadeFlow] Task ${taskId} completed in ${duration}ms`);

    return {
      taskId,
      status: 'completed',
      result,
      completedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`[FacadeFlow] Task ${taskId} failed:`, error);

    return {
      taskId,
      status: 'failed',
      error: error.message,
      completedAt: new Date().toISOString(),
    };
  }
}

async function executeTaskWithRetry(
  taskId: string,
  taskType: TaskType,
  payload: any,
  maxAttempts: number
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[FacadeFlow] Task ${taskId} attempt ${attempt}/${maxAttempts}`);
      switch (taskType) {
        case 'transcribe_voice_note':
          return await handleTranscribeVoiceNote(taskId, payload);
        case 'analyze_photo':
          return await handleAnalyzePhoto(taskId, payload);
        case 'generate_estimate':
          return await handleGenerateEstimate(taskId, payload);
        case 'daily_brief':
          return await handleDailyBrief(taskId, payload);
        case 'github_sync':
          return await handleGithubSync(taskId, payload);
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`[FacadeFlow] Task ${taskId} attempt ${attempt} failed:`, error.message);

      if (attempt === maxAttempts) break;

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Task failed after retries');
}

// =====================
// Task Handlers
// =====================

/**
 * Handle voice note transcription using OpenClaw's Whisper skill.
 * The audio can be accessed via URL or may need to be fetched from FacadeFlow.
 */
async function handleTranscribeVoiceNote(taskId: string, payload: TranscribePayload): Promise<TranscribeResult> {
  const { voiceNoteId, audioUrl, projectId } = payload;

  console.log(`[FacadeFlow] Transcribing voice note ${voiceNoteId}`);

  // Determine audio source
  let audioSource: string;
  if (audioUrl) {
    audioSource = audioUrl;
  } else {
    // Optionally fetch from FacadeFlow API if needed
    // const audioBlob = await fetchAudioFromFacadeFlow(voiceNoteId);
    // For now require audioUrl
    throw new Error('audioUrl is required for transcription');
  }

  // TODO: Invoke OpenClaw's whisper skill properly.
  // In OpenClaw, we can use the built-in audio transcription pipeline by
  // either calling a tool or by simulating a voice message event.
  // For this scaffold, we'll assume a helper `transcribeAudio` exists
  // or we'll use web_fetch to call an external API if configured.
  const transcript = await transcribeAudio(audioSource);

  // Optionally create a note in FacadeFlow linking the transcript
  if (projectId) {
    await createProjectNote(projectId, {
      type: 'voice_transcript',
      content: transcript,
      voiceNoteId,
      generated: true,
      taskId,
    });
  }

  return { transcript, voiceNoteId };
}

/**
 * Analyze a photo using vision capabilities (if available) or provide structured guidance.
 */
async function handleAnalyzePhoto(taskId: string, payload: AnalyzePhotoPayload): Promise<AnalyzeResult> {
  const { photoId, imageUrl, projectId, analysisType } = payload;

  console.log(`[FacadeFlow] Analyzing photo ${photoId} (${analysisType})`);

  if (!imageUrl) {
    throw new Error('imageUrl is required for photo analysis');
  }

  // If a vision model is available via OpenClaw, we could use it.
  // e.g., using a skill that accepts image input or via web_fetch to an API.
  // For now, a structured placeholder.
  const analysis = await analyzeImage(imageUrl, analysisType);

  // Save analysis to FacadeFlow (update photo record)
  await updatePhotoAnalysis(photoId, analysis);

  return { photoId, analysis };
}

/**
 * Generate an estimate PDF from line items and return the storage URL.
 */
async function handleGenerateEstimate(taskId: string, payload: GenerateEstimatePayload): Promise<EstimateResult> {
  const {
    projectId,
    projectName,
    clientName,
    items,
    taxRate = 0,
    adjustments = [],
    template = 'standard',
  } = payload;

  console.log(`[FacadeFlow] Generating estimate for project ${projectId}`);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate;
  const adjustmentTotal = adjustments.reduce((sum, adj) => (adj.type === 'add' ? sum + adj.amount : sum - adj.amount), 0);
  const total = subtotal + taxAmount + adjustmentTotal;

  // Render HTML template
  const html = renderEstimateHtml({
    projectName,
    clientName,
    items,
    subtotal,
    taxRate,
    taxAmount,
    adjustments,
    total,
    estimateNumber: `EST-${new Date().getFullYear()}-${String(taskId).slice(-6)}`,
    generatedAt: new Date().toISOString(),
    template,
  });

  // Convert HTML to PDF (in production, use Puppeteer, Playwright, or a backend service)
  const pdfBuffer = await htmlToPdf(html);

  // Upload PDF to cloud storage (Supabase Storage, S3, etc.)
  const storagePath = `estimates/${taskId}.pdf`;
  const pdfUrl = await uploadToStorage(storagePath, pdfBuffer, 'application/pdf');

  // Create estimate record in FacadeFlow
  const estimate = await createEstimateInProject(projectId, {
    number: `EST-${new Date().getFullYear()}-${String(taskId).slice(-6)}`,
    items,
    subtotal,
    taxRate,
    taxAmount,
    adjustments,
    total,
    pdfUrl,
    status: 'draft',
  });

  return { estimateId: estimate.id, pdfUrl, total };
}

/**
 * Generate and send a daily brief with project summaries.
 */
async function handleDailyBrief(taskId: string, payload: DailyBriefPayload): Promise<DailyBriefResult> {
  const { date } = payload;
  const briefDate = date || new Date().toISOString().split('T')[0]!;

  console.log(`[FacadeFlow] Generating daily brief for ${briefDate}`);

  // Fetch summary data from FacadeFlow API
  const summary = await fetchDailySummary(briefDate);

  // Format message for Telegram (Markdown)
  const messageText = formatDailyBrief(summary);

  // Send via Telegram if chat ID configured
  const recipient = TELEGRAM_CHAT_ID;
  if (recipient) {
    await sendTelegramMessage(recipient, messageText);
  } else {
    console.warn('[FacadeFlow] TELEGRAM_CHAT_ID not set, daily brief not sent');
  }

  return { date: briefDate, sentAt: new Date().toISOString(), recipient };
}

/**
 * Sync issues between FacadeFlow tasks and GitHub.
 */
async function handleGithubSync(taskId: string, payload: GitHubSyncPayload): Promise<GitHubSyncResult> {
  const { direction, repository, labels = [] } = payload;

  console.log(`[FacadeFlow] GitHub sync: ${direction} for ${repository}`);

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured');
  }

  if (direction === 'github_to_facadeflow') {
    const issues = await fetchGitHubIssues(repository, labels);
    const created = await createFacadeFlowTasks(issues);
    return { direction, created, total: issues.length };
  } else {
    const tasks = await fetchFacadeFlowTasksForGitHub();
    const created = await createGitHubIssues(repository, tasks);
    return { direction, created, total: tasks.length };
  }
}

// =====================
// Helper Functions
// =====================

// =====================
// API & Helper Functions
// =====================

/**
 * Report task status back to FacadeFlow.
 * Includes optional HMAC signature if WEBHOOK_SECRET is set.
 */
async function reportTaskStatus(result: TaskResult): Promise<void> {
  const response = await fetchWithAuth(`${API_URL}/webhooks/openclaw`, {
    method: 'POST',
    body: JSON.stringify(result),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'no body');
    throw new Error(`Failed to report task status: ${response.status} ${response.statusText} - ${text}`);
  }
}

/**
 * Create a note attached to a project.
 */
async function createProjectNote(projectId: string, note: any): Promise<any> {
  const response = await fetchWithAuth(`${API_URL}/projects/${projectId}/notes`, {
    method: 'POST',
    body: JSON.stringify(note),
  });
  return response.json();
}

/**
 * Update photo with analysis results.
 */
async function updatePhotoAnalysis(photoId: string, analysis: any): Promise<any> {
  const response = await fetchWithAuth(`${API_URL}/photos/${photoId}`, {
    method: 'PATCH',
    body: JSON.stringify({ analysis }),
  });
  return response.json();
}

/**
 * Create an estimate record within a project.
 */
async function createEstimateInProject(projectId: string, estimateData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_URL}/projects/${projectId}/estimates`, {
    method: 'POST',
    body: JSON.stringify(estimateData),
  });
  return response.json();
}

/**
 * Upload a file to cloud storage.
 * This implementation assumes Supabase Storage; adjust for your provider.
 */
async function uploadToStorage(path: string, buffer: Buffer, contentType: string): Promise<string> {
  // In a real setup, use Supabase JS client or signed upload URL.
  // For now, we'll simulate by calling an endpoint.
  const response = await fetchWithAuth(`${API_URL}/storage/upload`, {
    method: 'POST',
    // If using multipart, we'd need FormData. To avoid Node FormData issues,
    // we can use base64 encoding or a pre-signed URL approach.
    // Simplified: send as JSON base64
    body: JSON.stringify({
      path,
      contentType,
      content: buffer.toString('base64'),
    }),
  });

  if (!response.ok) {
    throw new Error(`Storage upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.url; // expect { url: string }
}

/**
 * Fetch daily summary data for the brief.
 */
async function fetchDailySummary(date: string): Promise<any> {
  const response = await fetchWithAuth(`${API_URL}/dashboard/daily-brief?date=${encodeURIComponent(date)}`);
  return response.json();
}

/**
 * Format daily brief for Telegram (Markdown).
 */
function formatDailyBrief(summary: any): string {
  const itemsList = (summary.items || [])
    .map((item: any) => `• ${item.title} (${item.type}) – ${item.status || 'pending'}`)
    .join('\n');

  return `
🔔 *Daily Brief - ${summary.date}*

📊 *Summary*
• Active Projects: ${summary.active_projects ?? 0}
• Overdue Tasks: ${summary.overdue_tasks ?? 0}
• Today's Appointments: ${summary.today_appointments ?? 0}
• Estimates Sent This Week: ${summary.estimates_sent_this_week ?? 0}
• Revenue Pipeline: $${summary.revenue_pipeline?.toLocaleString() ?? '0'}

📋 *Action Items*
${itemsList || 'None'}

_Generated by Canyon AI_
  `.trim();
}

/**
 * Send a message to Telegram using OpenClaw's messaging.
 */
async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  // Use OpenClaw message tool
  // In OpenClaw skills, we can import or use global `message` if available.
  await message({
    action: 'send',
    to: chatId,
    message: text,
  });
}

/**
 * Fetch GitHub issues with given labels.
 */
async function fetchGitHubIssues(repo: string, labels: string[]): Promise<any[]> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not set');
  }

  const labelQuery = labels.join(',');
  const response = await fetch(`https://api.github.com/repos/${repo}/issues?labels=${labelQuery}&state=open`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Create FacadeFlow tasks from GitHub issues.
 */
async function createFacadeFlowTasks(issues: any[]): Promise<any[]> {
  const created: any[] = [];

  for (const issue of issues) {
    const response = await fetchWithAuth(`${API_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: issue.title,
        description: issue.body,
        external_id: issue.number,
        source: 'github',
        priority: mapGitHubLabelToPriority(issue.labels),
        due_date: issue.due_date || null,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to create task from GitHub issue #${issue.number}: ${response.status}`);
      continue;
    }

    created.push(await response.json());
  }

  return created;
}

/**
 * Fetch FacadeFlow tasks that should be exported to GitHub.
 */
async function fetchFacadeFlowTasksForGitHub(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_URL}/tasks?export_to_github=true&status=open`);
  if (!response.ok) throw new Error(`Failed to fetch tasks for GitHub export: ${response.status}`);
  return response.json();
}

/**
 * Create GitHub issues from FacadeFlow tasks.
 */
async function createGitHubIssues(repo: string, tasks: any[]): Promise<any[]> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not set');
  }

  const created: any[] = [];

  for (const task of tasks) {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        title: task.title,
        body: `\`\`\`\nFacadeFlow Task ID: ${task.id}\n\`\`\`\n\n${task.description || ''}`,
        labels: ['facadeflow', mapPriorityToGitHubLabel(task.priority)],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to create GitHub issue for task ${task.id}: ${response.status}`);
      continue;
    }

    const issue = await response.json();

    // Update FacadeFlow task with GitHub issue number
    await fetchWithAuth(`${API_URL}/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ github_issue_number: issue.number }),
    });

    created.push(issue);
  }

  return created;
}

function mapGitHubLabelToPriority(labels: { name: string }[]): string {
  if (labels.some((l) => l.name === 'urgent')) return 'urgent';
  if (labels.some((l) => l.name === 'high')) return 'high';
  if (labels.some((l) => l.name === 'low')) return 'low';
  return 'medium';
}

function mapPriorityToGitHubLabel(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'urgent';
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

// =====================
// Placeholder Implementations
// =====================

/**
 * Transcribe audio using OpenClaw's Whisper capability.
 * This is a placeholder. In production, we can either:
 * - Use the built-in audio transcription skill if callable via API
 * - Or use an external Whisper API with an API key.
 */
async function transcribeAudio(audioSource: string): Promise<string> {
  // TODO: Implement actual transcription. Options:
  // 1. If OpenClaw exposes a skill invocation API, call that.
  // 2. Use OpenAI Whisper API (requires OPENAI_API_KEY)
  // 3. Use local whisper CLI via exec (slower but free)

  // For now, a mock
  console.log(`[FacadeFlow] Mock transcribe: ${audioSource}`);
  return `[Transcription placeholder] Audio from ${audioSource} would be transcribed here using Whisper.`;
}

/**
 * Analyze image using a vision model (GPT-4o, Claude Sonnet, etc.) if available.
 */
async function analyzeImage(imageUrl: string, type: string): Promise<AnalyzeResult['analysis']> {
  console.log(`[FacadeFlow] Mock analyze: ${imageUrl} (${type})`);
  // TODO: Use vision model via API call if configured
  return {
    observations: ['Mock: Cracked sealant around window', 'Fading paint on southern facade'],
    measurements: [
      { description: 'Window opening', value: 60, unit: 'inches' },
    ],
    recommendations: ['Reseal window perimeter', 'Consider repainting'],
    analysisType: type,
  };
}

/**
 * Render estimate HTML from template.
 */
function renderEstimateHtml(data: any): string {
  const {
    projectName,
    clientName,
    items,
    subtotal,
    taxRate,
    taxAmount,
    adjustments,
    total,
    estimateNumber,
    generatedAt,
  } = data;

  const adjustmentsList = adjustments
    .map((adj: any) => `<li>${adj.description}: ${adj.type === 'add' ? '+' : '-'}$${adj.amount.toFixed(2)}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Estimate ${estimateNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { margin: 0 0 20px; }
    .header { border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .totals { width: 300px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Estimate</h1>
    <p><strong>Project:</strong> ${projectName}</p>
    <p><strong>Client:</strong> ${clientName}</p>
    <p><strong>Estimate #:</strong> ${estimateNumber}</p>
    <p><strong>Date:</strong> ${generatedAt.split('T')[0]}</p>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item: any) => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
          <td>$${item.unitPrice.toFixed(2)}</td>
          <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
    <div><span>Tax (${(taxRate * 100).toFixed(1)}%):</span><span>$${taxAmount.toFixed(2)}</span></div>
    ${adjustments.length > 0
      ? `<div><span>Adjustments:</span><span><ul>${adjustmentsList}</ul></span></div>`
      : ''}
    <div class="total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
  </div>

  <p style="margin-top: 40px; color: #666; font-size: 0.9em;">
    Generated by Canyon AI on ${generatedAt}
  </p>
</body>
</html>
  `;
}

/**
 * Convert HTML to PDF.
 * Placeholder: In production, use Puppeteer, Playwright, or a microservice.
 */
async function htmlToPdf(html: string): Promise<Buffer> {
  // For now, return a minimal PDF buffer just to satisfy the type.
  // A real implementation would use headless Chrome or a PDF library.
  console.warn('[FacadeFlow] htmlToPdf is a placeholder. Implement with Puppeteer or similar.');
  return Buffer.from('%PDF-1.4\n% Fake PDF\n', 'utf-8');
}

// =====================
// Utility Functions
// =====================

/**
 * Wrapper for fetch that adds Authorization header and handles JSON.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add API key auth
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  // Sign payload if secret set and we're sending a body
  if (WEBHOOK_SECRET && options.body && typeof options.body === 'string') {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(options.body);
    headers['X-FacadeFlow-Signature'] = hmac.digest('hex');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
