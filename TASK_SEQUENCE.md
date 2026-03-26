# Task Sequence for Galin

## 🚀 MVP ROADMAP (14-Day Sprint to Beta)

**Budget:** 100€ allocated to domain/hosting, UI kit, API credits, landing page

**Top priority:** Get a functional app into beta testers' hands FAST

---

## Phase 1: Backend (Days 1-2) — DONE
✅ Supabase schema + migrations + seed
✅ RLS policies
✅ Tables: clients, projects, estimates, estimate_items, tasks, photos, voice_notes, annotations, users

## Phase 2: Frontend Integration (Days 3-8) — IN PROGRESS
✅ Navigation scaffold (5 tabs + nested stacks)
✅ All screens created (Dashboard, ProjectsList, ProjectDetail, ClientsList, ClientDetail, EstimatesList, EstimateBuilder, FieldHome, More)
✅ Component library (11 components)
⏳ Copy navigation & screens into actual mobile-app
⏳ Wire API client (src/api/) and test CRUD
⏳ Implement ProjectsList/ProjectDetail live data
⏳ Build EstimatesBuilder + list/detail
⏳ Integrate VoiceRecorder + transcribe (OpenClaw skill)
⏳ Integrate PhotoAnnotator + camera + upload
⏳ Before/After comparison view

## Phase 3: Polish (Days 9-10)
⏳ Add global error handling + toasts
⏳ Sentry setup
⏳ EAS production build & test on real device

## Phase 4: Launch (Days 11-14)
⏳ Deploy landing page (Carrd/Tally) with signup form
⏳ Publish Expo public link to first 10 beta testers
⏳ Collect feedback, fix critical bugs

## Phase 5: Business (Days 15-30)
⏳ Onboard 3 paying customers (€49/mo)
⏳ Set up Stripe/PayPal
⏳ Daily brief via OpenClaw cron

---

## Current Status Summary

**Completed (from previous sessions):**
- Navigation structure and all screen files
- Supabase schema (12 tables, RLS, indexes, functions)
- UI component library (11 components)
- Theme and feature flag system
- Voice recorder hook + UI
- Photo annotation hook + UI + before/after view
- API client scaffold (types, endpoints, client)

**Next immediate actions:**
1. Copy `navigation/` and `app/(tabs)/` into `facadeflow/mobile-app/`
2. Install dependencies: `@supabase/supabase-js`, `react-native-svg`, `expo-av`, `zustand` (optional)
3. Set up `.env` with Supabase URL + anon key
4. Configure API client (src/api/client.ts)
5. Run the app and connect each screen to real API endpoints

**Post-MVP (deferred until after beta launch):**
- Authentication flow (MVP uses a single "demo" user)
- Advanced offline sync
- Push notifications
- Full testing suite
- CI/CD
- Performance optimizations
- Accessibility/i18n
- Inventory module
- GitHub integration
- Advanced reporting

---

**Last updated:** 2025-03-21 (Galin requested focused MVP sequence with 100€ budget)
