# Organizers Companion App TODO

A logical TODO list for implementing the Organizer Companion App and related Main-App band availability features in a logical order.

## Phase 1: Database & Access Controls
- [ ] Create `schedules` table in Supabase
- [ ] Create `band_availability` table (or add fields) to track bands' availability for organizers
- [ ] Define RLS policies to restrict access: organizers can manage schedules; bands can manage their own availability
- [ ] Write and apply migrations via Supabase CLI

## Phase 2: Main-App Band Availability Feature
- [x] Design UI in Main-App for bands to set their availability (distinct from member availability)
- [ ] Implement Supabase queries/mutations for availability CRUD
- [ ] Add unit/integration tests for availability flows
- [ ] Update Main-App documentation (README, API reference)

## Phase 3: Organizer Companion App Scaffold
- [ ] Scaffold `organizer-app` in the monorepo or standalone Next.js workspace
- [ ] Configure Supabase client & authentication (reuse Main-App env vars)
- [ ] Set up environment variables and developer docs

## Phase 4: Core Organizer Features
- [ ] Data access utilities: `getBands()`, `getAvailability(date)`, `getDaySchedule(date)`, `upsertSchedule()`
- [ ] Bands management UI: add/edit/delete bands
- [ ] Day view scheduling page at `/days/[date]`: two-column layout (available bands vs. schedule)
- [ ] Implement "Add to schedule" button for available bands
- [ ] Support multiple bands per day with assigned time slots

## Phase 5: UI/UX & Shared Components
- [ ] Import and reuse Main-App design system (theme, components, typography)
- [ ] Build drag-and-drop schedule board (e.g., react-dnd)
- [ ] Integrate a time-picker for slot adjustments
- [ ] Show unsaved changes, auto-save states, and toast notifications

## Phase 6: Testing, Deployment & Documentation
- [ ] Write unit tests for data functions and UI components
- [ ] Write integration/E2E tests covering scheduling flows
- [ ] Update CI configuration to include new migrations and tests
- [ ] Deploy to staging, run smoke tests, then to production
- [ ] Update overall project README with setup and usage for `organizer-app`

## Phase 7: Future Enhancements
- [ ] Conflict detection and warnings for overlapping slots
- [ ] Multiple stages support (tabs or columns per stage)
- [ ] Bulk import/export of bands and schedules (CSV, PDF, .ics)
- [ ] Automated email reminders and calendar invites via Supabase Functions
- [ ] Role-based access for stage managers within the organizer app 