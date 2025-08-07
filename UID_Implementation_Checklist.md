# Pheno Hun## 2. Strain Registry & Validation
- [x] On new strain, prompt user for 3-letter code (force uppercase, regex: `^[A-Z]{3}$`).
- [x] Validate code against reserved list (profanity, "XXX", "BAD", etc.) both client and server-side.
- [x] On existing strain, auto-apply code from registry.
- [x] If user tries to enter a different code for an existing strain, warn and auto-apply existing code (no override).

## 3. UID Generation
- [x] On plant creation (seed):
  - [x] Generate UID using `[STRAIN_CODE]_[DATE_BORN:DDMMYY]_[SEED_SEQ]`.
- [x] On clone creation:
  - [x] Generate UID using `[PARENT_UID]_c[CLONE_SEQ]`.
- [x] Ensure UID is unique per user.
- [x] Store UID and all related fields in plant document.m — Implementation Checklist

## 1. Data Model & Backend
- [x] Add `unique_id`, `strain_code`, `strain_name`, `parent_id` fields to plant documents.
- [x] Create `strain_registry` collection/table: `{ user_id, strain_name_ci, strain_code }`.
- [x] Create `counters_seed` and `counters_clone` collections/tables for atomic sequence tracking.
- [x] Implement server-side atomic counters (Cloud Function or API) for:
  - [x] SEED_SEQ: per `(user_id, strain_code, date_born_DDMMYY)`
  - [x] CLONE_SEQ: per `(parent_plant_id)`
- [x] Ensure all UID generation logic is server-side and uses Firestore transactions with retry/backoff.

## 2. Strain Registry & Validation
- [ ] On new strain, prompt user for 3-letter code (force uppercase, regex: `^[A-Z]{3}$`).
- [ ] Validate code against reserved list (profanity, “XXX”, “BAD”, etc.) both client and server-side.
- [ ] On existing strain, auto-apply code from registry.
- [ ] If user tries to enter a different code for an existing strain, warn and auto-apply existing code (no override).

## 3. UID Generation
- [ ] On plant creation (seed):
  - [ ] Generate UID using `[STRAIN_CODE]_[DATE_BORN:DDMMYY]_[SEED_SEQ]`.
- [ ] On clone creation:
  - [ ] Generate UID using `[PARENT_UID]_c[CLONE_SEQ]`.
- [ ] Ensure UID is unique per user.
- [ ] Store UID and all related fields in plant document.

## 4. Legacy Data Migration
- [x] Identify plants missing UID/strain code.
- [x] Backfill UIDs:
  - [x] Reuse existing registry code if available.
  - [x] Generate new code if not, flag for review.
  - [x] Determine SEED_SEQ/CLONE_SEQ from data; if ambiguous, start from next safe number.

## 5. Frontend UX
- [ ] Plant Form (Seed):
  - [ ] Prompt for strain code if new strain.
  - [ ] Show UID preview before submit.
- [ ] Clone Plant:
  - [ ] Read parent UID, compute next `cXX`, show UID preview.
- [ ] Plant Details:
  - [ ] Display UID (read-only) in metadata header.
  - [ ] Add copy-to-clipboard icon with accessible label and 2s toast (“UID copied”).
- [ ] Plants List:
  - [ ] (Optional) Add UID column, sortable/filterable.

## 6. Testing
- [ ] Unit Tests: Counter service, UID generation, validation, reserved code rejection.
- [ ] Integration Tests: Concurrent seed/clone creation, strain registry reuse, warning flows.
- [ ] E2E Tests:
  - [ ] Create seed → UID visible & copyable (toast shown).
  - [ ] Clone from parent → UID increments cXX.
  - [ ] Existing strain → code auto-applied, mismatch warns user.
- [ ] Non-functional: Concurrency stress tests in CI.

## 7. Documentation & QA
- [ ] Document UID rules and flows for devs and QA.
- [ ] Update Definition of Done to include UID display and copy control.
- [ ] Review with PM/client before release.
