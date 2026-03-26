# FacadeFlow Development Tasks

## 🎯 FOCUSED MVP PLAN (100€ Budget) — 1,2,3…

**Goal:** Launch a working beta in 14 days, acquire first paying customers within 30 days.

**Budget breakdown:**
- Domain + hosting: €20
- Premium UI kit: €25
- API credits (transcription/PDF): €30
- Landing page: €25
- Buffer: €20

---

### ✅ Phase 1: Backend & Data (Days 1-3)
1. Create Supabase project, run `supabase/migrations/001_initial_schema.sql`, seed with sample data
2. Generate TypeScript types (`supabase gen types typescript > src/types/supabase.ts`)
3. Implement API client (`src/api/client.ts` + endpoints) with auth interceptors
4. Test all CRUD operations (clients, projects, estimates, tasks) via Postman

### ✅ Phase 2: Core Screens (Days 4-8)
5. Copy `navigation/` and `app/(tabs)/` from `FacadeFlow_Canyon/` into `facadeflow/mobile-app/`
6. Wire ProjectsList to API, implement pull-to-refresh + infinite scroll
7. Build ProjectDetail with tabs: Overview, Tasks, Estimates; show status workflow
8. Implement EstimatesBuilder (line items, totals) + EstimateList + detail view
9. Create ClientsList + ClientDetail; link clients to projects

### ✅ Phase 3: Field Tools (Days 9-11)
10. Integrate VoiceRecorder + transcribe button (uses OpenClaw skill via Whisper)
11. Integrate PhotoAnnotator + camera capture; upload to Supabase Storage
12. Build Before/After comparison view for photos

### ✅ Phase 4: Polish & Deploy (Days 12-14)
13. Add global error handling + Toast system (already in components/ui/Toast.tsx)
14. Configure Sentry (free tier) for crash monitoring
15. Build EAS production build, test on real Android/iOS device
16. Publish to Expo (public link) for beta testers

### ✅ Phase 5: Business Launch (Days 15-30)
17. Create landing page (Tally.co or Carrd) with Calendly embed; collect 50+ signups
18. Onboard first 3 beta customers (free 30-day trial)
19. Collect feedback, iterate on top pain point
20. Set pricing (€49/month per contractor), start charging (Stripe/PayPal)

---

## Setup & Foundation
- [x] Create Supabase schema + migrations + seed (see `supabase/`)
- [x] Extended component library (Button, Card, Input, Modal, Select, Switch, Checkbox, Avatar, Badge, Progress, Toast)
- [x] ThemeProvider + FeatureFlags + config system
- [ ] Initialize Git repo with conventional commits setup (defer to integration)
- [ ] Configure ESLint, Prettier, Husky, commitlint
- [ ] Set up Zustand store for global state (optional; can use React Query instead)
- [ ] Add error tracking (Sentry) configuration
- [ ] Set up React Native Testing Library and Jest
- [ ] Configure CI/CD (GitHub Actions for EAS Build)

**Deferred for post-MVP:** Advanced testing, CI/CD, performance optimizations

## Authentication & User Management
- [ ] Implementing Supabase Auth (simple email/password; OAuth later)
- [ ] Create AuthProvider context + route guards
- [ ] Profile screen (view/edit)
- [ ] Role management (defer; single role per user for now)

## Navigation
- [x] Redesign tab navigator with 5 tabs (Dashboard, Projects, Clients, Estimates, Field, More)
- [x] Implement nested stack navigators per section
- [x] Add tab icons
- [x] All screens created (Dashboard, ProjectsList, ProjectDetail, ClientsList, ClientDetail, EstimatesList, EstimateDetail, EstimateBuilder, FieldHome, More)
- [ ] Deep linking setup (post-MVP)
- [ ] Navigation testing

## Core Features - Projects
- [x] ProjectsListScreen with search/filter
- [x] ProjectDetailScreen with tabs: Overview, Tasks, Estimates, Photos, Notes, Timeline
- [x] Create/Edit Project (basic fields)
- [x] Project status workflow (draft → active → on-hold → completed → cancelled)
- [ ] Map integration for address (post-MVP)

## Core Features - Clients
- [x] ClientsListScreen (search, avatar with initials)
- [x] ClientDetailScreen
- [x] Client creation/editing
- [ ] Link clients to projects (basic linking via select works)
- [ ] Communication history log (defer to v2)

## Core Features - Estimating
- [x] Estimate data model + line items + totals
- [x] EstimateBuilder screen (add/edit/delete items)
- [ ] Estimate template system (defer; static HTML template for PDF)
- [ ] PDF generation service (use expo-print in MVP, backend later)
- [x] Estimate list and detail views
- [ ] Send via email/WhatsApp (share API)

## Core Features - Photo Documentation
- [x] PhotoCapture component (camera + gallery)
- [x] PhotoAnnotator (draw, arrows, text, highlight)
- [x] PhotoGallery with grid
- [x] Before/after comparison view
- [x] Upload to Supabase Storage
- [x] Annotations storage (JSON)
- [ ] Voice note attachment to photos (post-MVP)

## Core Features - Voice Notes
- [x] VoiceRecorder component (expo-av)
- [x] Transcribe using OpenAI Whisper (via OpenClaw skill call)
- [x] VoiceNoteList and playback
- [ ] Search within transcripts (post-MVP)
- [ ] Attach voice notes to projects/tasks (basic)
- [ ] Export transcript as text (share)

## Core Features - Tasks
- [x] Task data model
- [x] TaskBoard (Kanban: Todo, In Progress, Done)
- [x] TaskForm (create/edit)
- [ ] Task assignment (defer; single user initially)
- [ ] Push notifications (post-MVP)
- [ ] Sync with calendar (post-MVP)

## Core Features - Inventory
- [ ] Defer to post-MVP (out of scope for initial beta)

## Field Operations
- [x] GPS location tagging (via expo-location; basic)
- [ ] Offline mode (defer to v2)
- [ ] Signature capture (defer)
- [ ] Measurement tools (defer)

## Reporting & Dashboard
- [x] Dashboard with KPIs (active projects, overdue tasks, recent estimates)
- [ ] Financial reports (defer)
- [ ] Time tracking (defer)
- [ ] Export to CSV/PDF (defer)

## Daily Brief & Notifications
- [ ] Configure OpenClaw cron for daily brief (post-launch)
- [ ] In-app notification system (defer)
- [ ] Push notifications (Expo) for due dates (defer)

## Integrations
### GitHub
- [ ] Defer to post-MVP

### OpenClaw Bridge
- [ ] Create "Send to Canyon" button that creates OpenClaw tasks via API (simple)

### External APIs
- [ ] Weather API (defer)
- [ ] Map APIs (Google Maps) (defer)
- [ ] PDF generation service (if not using expo-print)

## Monitoring & Quality
- [ ] Sentry setup (planned)
- [ ] Crash reporting (via Sentry)
- [ ] Defer analytics until v2

## Testing
- [ ] Manual testing only for MVP
- [ ] Defer automated tests to v2

## Documentation
- [ ] Write concise README with setup steps and .env vars
- [ ] Architecture diagram (simple mermaid)
- [ ] Defer full Storybook

## Accessibility & i18n
- [ ] Basic accessibility (labels)
- [ ] English only for MVP; defer i18n

## Performance Optimizations
- [ ] Use FlashList for long lists (optional)
- [ ] Defer advanced optimizations

## Security
- [ ] RLS already in Supabase schema
- [ ] Use expo-secure-store for tokens
- [ ] Input validation on forms
- [ ] Defer obfuscation until production build

## Deployment
- [ ] Configure EAS build profiles (development, preview, production)
- [ ] Set up OTA updates
- [ ] Create app icons + splash screen
- [ ] Build and test production binary
- [ ] Deploy landing page (Carrd/Tally)

## Navigation
- [ ] Redesign tab navigator with 5-6 tabs
- [ ] Implement nested stack navigators per section
- [ ] Add tab icons (using @expo/vector-icons)
- [ ] Deep linking setup
- [ ] Navigation testing

## Core Features - Projects
- [ ] Define Project type/interface
- [ ] Create ProjectsListScreen (with search/filter)
- [ ] Create ProjectDetailScreen with tabs:
  - [ ] Overview (info, stats, quick actions)
  - [ ] Photos (gallery + camera + annotation)
  - [ ] Estimates (list, create, view PDF)
  - [ ] Tasks (checklist, assign, due dates)
  - [ ] Notes (voice/text, attachments)
  - [ ] Timeline (activity feed)
- [ ] Create/Edit Project modal/screen
- [ ] Project status workflow (draft → active → on-hold → completed → cancelled)
- [ ] Map integration for project address

## Core Features - Clients
- [ ] Define Client type
- [ ] ClientsListScreen (search, sort, groups)
- [ ] ClientDetailScreen
- [ ] Client creation/editing
- [ ] Link clients to projects
- [ ] Add communication history log

## Core Features - Estimating
- [ ] Estimate data model (line items, taxes, adjustments)
- [ ] EstimateBuilder screen
  - [ ] Add/edit/delete line items
  - [ ] Material selector from inventory
  - [ ] Labor calculator (hours × rate)
  - [ ] Cost summaries (materials, labor, overhead)
- [ ] Estimate template system (HTML/Handlebars)
- [ ] PDF generation service (backend or expo-print)
- [ ] Estimate list and detail views
- [ ] Send estimate via email/WhatsApp (share API)

## Core Features - Photo Documentation
- [ ] PhotoCapture component (camera + gallery)
- [ ] PhotoAnnotator (draw, add text, arrows)
- [ ] PhotoGallery with grid/list toggle
- [ ] Before/after comparison view
- [ ] Upload to cloud storage (Supabase Storage)
- [ ] Annotations storage (JSON)
- [ ] Voice note attachment to photos

## Core Features - Voice Notes
- [ ] VoiceRecorder component (expo-av)
- [ ] Transcribe using OpenAI Whisper (via OpenClaw skill)
- [ ] VoiceNoteList and playback
- [ ] Search within transcripts
- [ ] Attach voice notes to projects/tasks
- [ ] Export transcript as text

## Core Features - Tasks
- [ ] Task data model (title, description, assignee, due_date, status, priority)
- [ ] TaskBoard (Kanban style: Todo, In Progress, Done)
- [ ] TaskForm (create/edit)
- [ ] Task assignment (team members)
- [ ] Push notifications for due dates
- [ ] Sync with calendar

## Core Features - Inventory
- [ ] InventoryItem type
- [ ] InventoryList with search/filter by category/supplier
- [ ] Add/edit/delete items
- [ ] Stock level tracking
- [ ] Low stock alerts
- [ ] Supplier linking
- [ ] Purchase order creation

## Field Operations
- [ ] Offline mode (watermelonDB or realm)
- [ ] Sync queue for offline changes
- [ ] GPS location tagging for photos/tasks
- [ ] Quick note voice-to-text
- [ ] Signature capture for contracts
- [ ] Measurement tools (integrate with camera?)

## Reporting & Dashboard
- [ ] Dashboard screen with KPIs:
  - Active projects count
  - Overdue tasks
  - This week's estimates sent
  - Revenue pipeline
- [ ] Financial reports (gross margin, project profitability)
- [ ] Time tracking reports
- [ ] Export to CSV/PDF

## Daily Brief & Notifications
- [ ] Design daily brief format (Telegram message)
- [ ] Create backend endpoint to gather daily data
- [ ] Configure OpenClaw cron job to fetch and send brief
- [ ] In-app notification system
- [ ] Push notification setup (Expo Notifications)

## Integrations
### GitHub
- [ ] Create AgentSkill: github-sync
- [ ] Poll GitHub issues/PRs
- [ ] Map GitHub labels to project status/tasks
- [ ] Comment on GitHub with FacadeFlow updates
- [ ] Create branches from FacadeFlow tasks

### OpenClaw Bridge
- [ ] Design webhook endpoints for OpenClaw to fetch tasks
- [ ] Implement authentication between systems
- [ ] Create "Send to Canyon" button in app
- [ ] Map FacadeFlow tasks to OpenClaw skills
- [ ] Status updates back to FacadeFlow

### External APIs
- [ ] Weather API (for outdoor work planning)
- [ ] Material pricing APIs (if available)
- [ ] Map APIs (Google Maps, Mapbox)
- [ ] PDF generation service

## Monitoring & Quality
- [ ] Sentry error tracking setup
- [ ] Performance monitoring (React Profiler)
- [ ] Analytics (PostHog)
- [ ] Crash reporting
- [ ] Log aggregation

## Testing
- [ ] Unit tests for utilities, hooks, components
- [ ] Component tests with React Native Testing Library
- [ ] E2E tests with Detox (login flow, create project)
- [ ] Mock Service Worker for API mocking
- [ ] CI test runs on PRs

## Documentation
- [ ] README with comprehensive setup guide
- [ ] Architecture diagram
- [ ] Component Storybook
- [ ] API documentation (OpenAPI spec if custom backend)
- [ ] Deployment guide (EAS)
- [ ] Contributing guidelines
- [ ] Changelog maintenance

## Accessibility & i18n
- [ ] Add i18next and translation files (en, bg)
- [ ] Extract all strings to translation keys
- [ ] Accessibility audit (labels, contrasts, hit areas)
- [ ] Test with screen readers
- [ ] Support dynamic font scaling
- [ ] RTL layout testing

## Performance Optimizations
- [ ] Image optimization (react-native-fast-image)
- [ ] Lazy loading lists (FlashList)
- [ ] Code splitting (if needed)
- [ ] Bundle size analysis
- [ ] Memoization of expensive renders

## Security
- [ ] Enable RLS in Supabase
- [ ] Input validation on all forms
- [ ] Secure storage for tokens (expo-secure-store)
- [ ] Obfuscation for production builds
- [ ] Regular dependency audits

## Deployment
- [ ] Configure EAS build profiles (development, preview, production)
- [ ] Set up OTA updates
- [ ] App store assets and metadata
- [ ] Play Store listing
- [ ] Deep linking configuration
- [ ] App icons and splash screens

---

## Quick Wins (Can Implement Immediately)

These tasks don't require backend and can be done in isolation:

### UI Components Library
- [ ] Create `components/ui/` folder structure
- [ ] Implement Button component (variants, sizes, loading state)
- [ ] Implement Card component (elevation, padding, border radius)
- [ ] Implement Input component (text, email, number, error states)
- [ ] Implement Modal component (confirm, action sheet)
- [ ] Implement Badge/Tag component
- [ ] Implement Avatar component (initials, image)
- [ ] Implement ProgressBar/Spinner
- [ ] Document components with Storybook or MDX

### Type Definitions
- [ ] Create `types/index.ts`
- [ ] Define core types:
  ```ts
  type ProjectStatus = 'draft' | 'inquired' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  type Client = { id: string; name: string; email?: string; phone?: string; company?: string; address?: Address }
  type Project = { id: string; client_id: string; name: string; description?: string; address: Address; status: ProjectStatus; start_date?: string; end_date?: string; budget?: number }
  type Estimate = { id: string; project_id: string; items: EstimateItem[]; subtotal: number; tax_rate: number; total: number; status: 'draft' | 'sent' | 'accepted' | 'rejected' }
  type EstimateItem = { id: string; description: string; quantity: number; unit_price: number; unit: string; total: number }
  ```
- [ ] Add Zod schemas for validation

### API Client Scaffold
- [ ] Create `api/client.ts` (Axios instance with interceptors)
- [ ] Create `api/endpoints/` with typed functions
- [ ] Add error handling middleware
- [ ] Add request/response logging in dev mode
- [ ] Add request cancellation support
- [ ] Create mock API for development (msw or manual)

### Configuration
- [ ] Create `config/index.ts` (env vars with defaults)
- [ ] Add support for multiple environments (dev, staging, prod)
- [ ] Create feature flags system
- [ ] Add constants (colors, spacing, typography)

### Utilities
- [ ] Create `utils/date.ts` (formatting, relative time)
- [ ] Create `utils/validation.ts` (form validators)
- [ ] Create `utils/format.ts` (currency, phone, address)
- [ ] Create `utils/async.ts` (debounce, throttle, retry)

### Design Tokens
- [ ] Create `constants/theme.ts` with colors (primary, secondary, success, warning, error, neutrals)
- [ ] Define spacing scale (4px base)
- [ ] Define typography scale (font sizes, line heights, weights)
- [ ] Define border radius, shadows, z-index
- [ ] Export as React Native styles or StyleSheet.create

### Navigation
- [ ] Create `navigation/` folder
- [ ] Set up tab navigator with 5 tabs (Dashboard, Projects, Clients, Estimates, Field)
- [ ] Create stack navigators for each section
- [ ] Add TypeScript types for route params
- [ ] Create custom hook `useNavigation` with typed helpers

### State Management
- [ ] Install Zustand
- [ ] Create store for:
  - [ ] `useAuthStore()` (user, token, login/logout)
  - [ ] `useProjectsStore()` (projects list, filters, current project)
  - [ ] `useUIStore()` (theme, modals, toasts)
- [ ] Add persistence (zustand/middleware) if needed
- [ ] Write selectors for derived state

### Error Handling & Toasts
- [ ] Create `components/Toast.tsx` (success, error, info)
- [ ] Create `contexts/ToastContext.tsx`
- [ ] Global error handler for uncaught errors (Sentry + toast)
- [ ] API error parser (map error codes to user messages)

### Forms
- [ ] Set up Formik or React Hook Form + Zod validation
- [ ] Create common form components:
  - [ ] FormField (label, input, error)
  - [ ] Select dropdown
  - [ ] DatePicker
  - [ ] Switch/Toggle
  - [ ] Checkbox group
- [ ] Create form validation schemas for:
  - [ ] Project creation
  - [ ] Client creation
  - [ ] Estimate line item
  - [ ] User signup

### Assets
- [ ] Create/Source icon set for tab bar (home, projects, clients, estimates, field, more)
- [ ] Create app icon (different sizes)
- [ ] Create splash screen
- [ ] Add placeholder images (empty states, illustrations)

### Samples
- [ ] Generate sample clients (10)
- [ ] Generate sample projects (20) linked to clients
- [ ] Generate sample estimates (30)
- [ ] Create sample voice notes (text only or dummy audio)
- [ ] Create sample photo data with dummy URLs

### Scripts
- [ ] Add `scripts/setup-db.ts` to seed Supabase with sample data
- [ ] Add `scripts/generate-types.ts` to fetch Supabase types and write to `types/supabase.ts`
- [ ] Add `scripts/validate-schema.ts` to check database schema matches types
- [ ] Add `scripts/export-data.ts` to export data as JSON/CSV

### CI/CD
- [ ] Create `.github/workflows/test.yml` for running tests
- [ ] Create `.github/workflows/eas-build.yml` for building
- [ ] Add status checks to PR template
- [ ] Add automatic changelog generation (release-drafter or semantic-release)

### Documentation
- [ ] Write comprehensive README with:
  - Project description
  - Tech stack
  - Setup instructions (Node version, npm install, env vars, EAS setup)
  - Database setup (Supabase connection)
  - Running on device/simulator
  - Script reference
  - Contributing guidelines
- [ ] Create `docs/architecture.md` with diagrams (screenshots with Excalidraw or Mermaid)
- [ ] Create `docs/components.md` with component library documentation

---

## Integration with OpenClaw

### AgentSkills to Create
- [ ] `facade_daily_brief` - Gathers project stats and sends Telegram message
- [ ] `github_facade_sync` - Syncs GitHub issues with FacadeFlow tasks
- [ ] `facade_transcribe` - Accepts audio file, returns transcript, creates note in FacadeFlow
- [ ] `facade_photo_analysis` - Analyzes uploaded photo (using vision model if available)
- [ ] `facade_estimate_generator` - Generates estimate from description using templates

### Cron Jobs
- [ ] Daily brief (7:00 AM)
- [ ] GitHub sync every 30 minutes
- [ ] Database backup daily (retain 7 days)
- [ ] Usage metrics collection
- [ ] Stale task cleanup (mark incomplete tasks past due)

### Webhooks
- [ ] `/webhooks/openclaw` endpoint to receive task completions
- [ ] Verify signatures
- [ ] Update FacadeFlow records accordingly

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Foundation | 1 week | Setup, auth, navigation, types, API client |
| Core MVP | 2 weeks | Projects, clients, estimates, photos, tasks |
| Polish | 1 week | Offline, notifications, testing, docs |
| Deploy | 3 days | EAS config, store assets, submit |

Total: ~4 weeks to MVP that can be demoed

---

## Notes

- Do NOT modify original FacadeFlow folder
- All work goes in FacadeFlow_Canyon
- Can later merge or copy changes back if approved
- Keep commits conventional: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
