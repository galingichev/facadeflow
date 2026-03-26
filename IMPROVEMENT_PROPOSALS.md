# Improvement Proposals for FacadeFlow

## 1. Navigation & Information Architecture

**Problem:** Current navigation is minimal (Home, Explore, Projects). Not aligned with contractor workflow.

**Proposed Structure:**
- Home (dashboard with today's schedule, urgent items)
- Projects (list + grid)
- Clients (CRM)
- Estimates (quotes/proposals)
- Field (camera, voice notes, measurements)
- More (settings, team, reports, inventory)

**Action:**
- Redesign tab navigation with 5-6 primary sections
- Implement nested stack navigators for each section
- Add bottom tab labels and icons

---

## 2. Data Layer & State Management

**Problem:** No data persistence, no API integration, no state management.

**Proposed Solution:**
- **Backend:** Supabase (PostgreSQL + realtime + auth) or Firebase
- **State:** Zustand or React Context for local state
- **ORM/Query:** Supabase client or RTK Query
- **Offline:** WatermelonDB or Realm for local storage + sync

**Tables Needed:**
- `projects` (id, name, client_id, address, status, dates, etc.)
- `clients` (id, name, phone, email, company, notes)
- `estimates` (id, project_id, items[], total, status, pdf_url)
- `project_photos` (id, project_id, url, annotations, type [before/after])
- `measurements` (id, project_id, data, notes)
- `voice_notes` (id, project_id, audio_url, transcript, duration)
- `tasks` (id, project_id, title, assignee, due_date, status)
- `inventory_items` (id, name, sku, quantity, supplier_id)
- `suppliers` (id, name, contact, catalog_url)

**Action:**
- Set up Supabase project and define schema
- Generate TypeScript types from schema
- Create data access layer with hooks

---

## 3. Authentication & User Management

**Problem:** No auth flow implemented.

**Solution:**
- Email/password auth via Supabase Auth
- Magic link login
- Role-based access (admin, estimator, field technician, viewer)
- Profile management

**Action:**
- Implement auth screens (login, signup, forgot password)
- Add auth context/guard routes
- Set up row-level security in database

---

## 4. Project Detail Screen

**Problem:** Projects screen is just placeholder.

**Proposed Features:**
- Project header (client, address, status, dates)
- Tabs: Overview, Photos, Measurements, Estimates, Tasks, Notes
- Quick actions: Add photo, add note, create estimate, schedule task
- Timeline/activity feed
- Map view of location

**Action:**
- Build comprehensive project detail screen with all above features
- Use expo-image-picker for photo capture
- Implement basic CRUD operations

---

## 5. Photo Documentation with Annotations

**Problem:** Field contractors need to document work with photos and markups.

**Proposed Implementation:**
- Capture/select photos
- Draw on images (arrows, circles, text)
- Add labels (window type, defect, measurement)
- Organize by before/after
- Export annotated PDFs

**Libraries:**
- `react-native-svg` for drawing
- `expo-image-picker` for camera/gallery
- `react-native-gesture-handler` for drawing gestures

**Action:**
- Build PhotoAnnotator component
- Create PhotoGallery screen with annotation capabilities
- Store annotations as JSON overlay or render onto image

---

## 6. Voice Notes & Speech-to-Text

**Problem:** Contractors in the field can't type easily. Need voice input.

**Solution:**
- Record audio clips
- Transcribe to text using OpenAI Whisper API (OpenClaw can handle transcription!)
- Attach to projects/tasks
- Playback and edit transcripts

**Implementation:**
- Use `expo-av` for audio recording
- Use OpenClaw's openai-whisper skill (or direct API) for transcription
- Store audio files in Supabase Storage or S3
- Display transcripts with timestamps

**OpenClaw Integration:**
- Upload recording → trigger transcription via webhook or manual
- Store resulting transcript in database

**Action:**
- Build VoiceRecorder component
- Set up Whisper transcription service
- Integrate with project detail

---

## 7. Estimating & Quote Generation

**Problem:** Need to generate professional quotes quickly.

**Features:**
- Line item builder (description, quantity, unit price, total)
- Material database with current pricing
- Labor cost calculation (hours × rate)
- Tax, overhead, profit margin settings
- Template-based PDF generation with branding

**Tech:**
- `react-native-pdf` or PDF from HTML (puppeteer/weasyprint on backend)
- Template engine (Handlebars, EJS)

**Action:**
- Create EstimateBuilder screen
- Build quote PDF generator service
- Add estimate templates

---

## 8. Daily Brief & Cron Integration

**Problem:** User wants daily brief (see TO_DO list).

**Proposed Daily Brief:**
- Sent each morning (configurable time)
- Summary of:
  - Today's appointments/site visits
  - Overdue tasks
  - Projects needing attention
  - New leads
  - Pending estimates
- Interactive: tap to open project, snooze, mark complete

**Delivery:**
- Telegram message (since user uses Telegram)
- Or in-app notification

**OpenClaw Integration:**
- Set up cron job to query database
- Generate formatted message
- Send via Telegram channel

**Action:**
- Design daily brief format
- Create backend endpoint to gather data
- Configure cron in OpenClaw
- Set up messaging to Telegram

---

## 9. GitHub Skills Integration

**Problem:** "GitHub skills" on todo list. Likely means syncing skills/repos.

**Interpretation:**
- Create an AgentSkill that can:
  - Read GitHub issues/PRs
  - Comment on PRs with code review insights
  - Create branches/tasks from issues
  - Update issue status based on commits
- Or: use GitHub Actions to trigger OpenClaw tasks

**Proposed Skill: GitHub Project Sync**
- Configure with GitHub token and repo
- Poll issues/PRs periodically (cron)
- Create tasks in FacadeFlow from issues
- Comment on GitHub with status updates from FacadeFlow
- Sync labels and assignees

**Action:**
- Build `github-sync` AgentSkill
- Set up webhooks or polling
- Map GitHub fields to FacadeFlow tasks/projects

---

## 10. OpenClaw Task Integration

**Problem:** "Give Canyon tasks from my FacadeFlow project"

**Interpretation:**
- Two-way sync between FacadeFlow tasks and OpenClaw todos
- OpenClaw can work on FacadeFlow tasks proactively
- FacadeFlow triggers OpenClaw actions (e.g., generate quote, analyze photo)

**Implementation:**
- REST API endpoint in FacadeFlow backend (or directly from DB)
- OpenClaw reads tasks via webhook/polling
- OpenClaw executes relevant skills (generate doc, transcribe, etc.)
- Updates FacadeFlow with results

**Example Flow:**
1. In FacadeFlow: create task "Analyze this photo for damage assessment"
2. OpenClaw polls or receives webhook
3. OpenClaw fetches photo, runs vision analysis (if skill available)
4. Adds transcript/notes to FacadeFlow project

**Action:**
- Design task schema for OpenClaw integration
- Build bridge: OpenClaw <-> FacadeFlow
- Create sample tasks and automation

---

## 11. Performance & Monitoring

**Add:**
- Error tracking (Sentry)
- Performance monitoring (React DevTools, Expo instrumentation)
- Analytics (PostHog, Mixpanel, Amplitude)
- Crash reporting

---

## 12. Testing & Quality

**Add:**
- Unit tests with Jest
- Component tests with React Native Testing Library
- E2E tests with Detox
- TypeScript strict mode
- Pre-commit hooks (lint-staged, husky)
- CI/CD with GitHub Actions

---

## 13. Documentation

**Produce:**
- README with setup instructions
- CONTRIBUTING.md
- API documentation (if backend)
- Component Storybook (if component library)
- Deployment guides

---

## 14. Accessibility & i18n

**Accessibility:**
- Screen reader support (accessibility labels)
- High contrast theme
- Large text support
- Keyboard navigation (for tablets)

**Internationalization:**
- Use i18next
- Support multiple languages (English, Bulgarian maybe?)
- RTL layout support

---

## Priority Roadmap

### Phase 1 (Weeks 1-2) - Foundation
- [ ] Set up backend (Supabase) and define schema
- [ ] Implement auth flow
- [ ] Build project CRUD screens
- [ ] Basic navigation structure
- [ ] TypeScript types generation

### Phase 2 (Weeks 3-4) - Core Features
- [ ] Client management
- [ ] Estimate/quote builder
- [ ] Photo capture & gallery
- [ ] Voice notes integration (STT via OpenClaw)
- [ ] Task management

### Phase 3 (Weeks 5-6) - Polish & Integrations
- [ ] Daily brief cron + Telegram delivery
- [ ] GitHub issues sync
- [ ] Offline mode & sync
- [ ] PDF generation
- [ ] Error tracking & analytics

### Phase 4 (Later)
- [ ] Advanced features (AI takeoff, route optimization)
- [ ] Web dashboard
- [ ] Multi-tenant SaaS billing (Stripe)
- [ ] Advanced reporting

---

## Quick Wins (Can Do Now)

These are things I can set up immediately in FacadeFlow_Canyon without affecting original:

1. **Initialize Git repo** (if not already) and add conventional commits
2. **Set up ESLint + Prettier** with consistent rules
3. **Add commitlint** and husky hooks
4. **Create TypeScript type definitions** for core domain
5. **Build reusable UI component library** (Button, Card, Input, etc.)
6. **Set up Storybook** for component development
7. **Add testing infrastructure** (Jest, RTL)
8. **Write sample components** for project cards, photo thumbnails, estimate lines
9. **Create API client scaffold** (Axios wrapper, typed endpoints)
10. **Add environment config** (.env template, config module)
11. **Write deployment scripts** for EAS Build
12. **Generate sample data** for development
13. **Build daily brief generator script** (node script) - can be run by cron
14. **Create OpenClaw AgentSkill** for FacadeFlow task management

---

## OpenClaw-Specific Contributions

Since you're setting up OpenClaw as your AI assistant, I can create:

1. **AgentSkill: facade_task_processor**
   - Listens for FacadeFlow tasks via webhook or polling
   - Executes appropriate actions (transcribe, analyze, generate)
   - Updates FacadeFlow via API

2. **Cron Jobs:**
   - Daily brief → Telegram
   - Sync with GitHub
   - Database backups
   - Usage reports

3. **Memory Integration:**
   - Track project decisions, client preferences
   - Auto-generate daily notes about FacadeFlow progress

4. **Voice Workflow:**
   - Receive voice messages via Telegram (you already have Telegram channel)
   - Transcribe and convert to FacadeFlow tasks/notes

5. **Workspace Automation:**
   - Auto-commit changes with conventional messages
   - Changelog generation
   - Release notes from GitHub releases
