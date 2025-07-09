# Implementation Plan: Audit Remediation for EventFlow

This document provides a prioritized, atomic work plan to resolve all discrepancies identified in the SpecCheck Audit Report. The plan is structured to be executed by a developer agent, ensuring a systematic approach to fixing critical bugs, implementing missing features, and aligning the codebase with its technical specification.

---

## P0 - Critical Fixes & Foundational Setup
*Tasks to fix core bugs and install missing dependencies. This is the highest priority to make the application stable and testable.*

- [x] **SETUP**: Install all missing foundational dependencies for the project to run.
    - **File(s)**: `package.json`
    - **Action**: Run the following command: `npm install puppeteer cheerio bullmq ioredis node-schedule tailwindcss postcss autoprefixer`.
    - **Reason**: Audit Finding: [❌ Gap] The `package.json` is missing critical dependencies for Web Scraping (Puppeteer, Cheerio), Job Scheduling (BullMQ, node-schedule), and Styling (Tailwind CSS), rendering core features inoperable.

- [x] **SETUP**: Initialize Tailwind CSS configuration.
    - **File(s)**: `tailwind.config.js`, `postcss.config.js`
    - **Action**: Run `npx tailwindcss init -p` to create the `tailwind.config.js` and `postcss.config.js` files. Configure the `content` array in `tailwind.config.js` to scan app and component files.
    - **Reason**: Audit Finding: [❌ Gap] The project is missing Tailwind CSS configuration, despite the specification requiring it for styling.

- [x] **FIX**: [EF-041] Correct the Stripe session creation logic to use `customerId`.
    - **File(s)**: `lib/payments/stripe.ts`
    - **Action**: Modify the `createCheckoutSession` function signature to accept `customerId: string` instead of `email: string`. The `customer` property in the `stripe.checkout.sessions.create` call should use this `customerId`.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-041]: `createCheckoutSession` incorrectly accepts an `email` instead of the required Stripe `customerId`, which would cause a runtime failure.

- [x] **FIX**: [EF-041] Update checkout API to pass `customerId` and add price validation.
    - **File(s)**: `pages/api/checkout.ts`
    - **Action**: 1. Fetch the user from the database to get their `stripeCustomerId`. 2. Retrieve the Stripe price using `stripe.prices.retrieve(priceId)`. 3. Add a check to ensure `stripePrice.product` matches `env.STRIPE_PROMOTION_PRODUCT_ID`. 4. Pass the fetched `stripeCustomerId` to the `createCheckoutSession` function.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-041]: The B2B payment API has a critical security flaw, lacking validation for the `priceId`, and a functional bug where it passes the wrong identifier to Stripe.

- [ ] **FIX**: [EF-050] Correct the API endpoint for B2C subscriptions.
    - **File(s)**: `app/subscribe/page.tsx`
    - **Action**: Change the `fetch` request URL from the non-existent `/api/subscriptions` to `/api/checkout`. This will allow the B2C subscription flow to use the same (now fixed) checkout endpoint, but with different `priceId`s.
    - **Reason**: Audit Finding: [🟡 Partial] [EF-050]: The frontend subscription page calls a non-existent API endpoint, making it impossible for users to subscribe.

---

## P1 - Missing Feature Implementation
*Tasks to build out the core data aggregation pipeline now that foundational dependencies are in place.*

- [ ] **CREATE**: [Epic 1] Implement the master scheduler to trigger the scraping pipeline.
    - **File(s)**: `lib/scheduler/index.ts`
    - **Action**: In the `startEventScrapingScheduler` function, use `node-schedule` to schedule a recurring job (e.g., '0 */6 * * *' for every 6 hours). The job should add a new task named 'scheduled-scrape' to the `scrapingQueue`.
    - **Reason**: Audit Finding: The entire data aggregation pipeline is non-functional. This task creates the entry point that triggers the pipeline.

- [ ] **UPDATE**: [Epic 1] Connect the BullMQ worker to the event normalization pipeline.
    - **File(s)**: `lib/queues/scraping.ts`
    - **Action**: Ensure the BullMQ `Worker` logic correctly calls the `normalizeAllEvents` function when it processes a 'scheduled-scrape' job. Add logging to indicate job start and completion.
    - **Reason**: Audit Finding: The job queue system is not connected to the actual scraping logic, breaking the data flow.

- [ ] **UPDATE**: [EF-003] Implement event deduplication in the data pipeline.
    - **File(s)**: `lib/pipelines/normalize.ts` (or the worker in `lib/queues/scraping.ts`)
    - **Action**: After scraping events and before saving them to the database, query the `Event` table for an existing event with the same `sourceUrl`. If a match is found, skip the creation of the new event to prevent duplicates.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-003]: The system lacks logic to prevent duplicate events from being inserted into the database.

---

## P2 - Mismatches & Corrections
*There are no P2 tasks. The critical mismatches (tech stack) were handled as `SETUP` or `FIX` tasks in P0, and the remaining ones are documentation updates for P3.*

---

## P3 - Documentation Updates
*Tasks to modify `app_description.md` to align with the reality of the implemented codebase, resolving all documentation gaps.*

- [ ] **DOCS**: Update the tech stack to reflect the use of Leaflet for mapping.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In the "Core Tech Stack" table, change the "Mapping" component's technology from "Mapbox GL JS / React Map GL" to "Leaflet / React-Leaflet".
    - **Reason**: Audit Finding: [🟡 Mismatch] The codebase uses `Leaflet` for maps, but the specification documents `Mapbox`.

- [ ] **DOCS**: Update the observability strategy to reflect the implemented custom logger.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In section "7.3. Observability Strategy", modify the "Error Tracking" point. Replace the mention of Sentry with a description of the implemented custom logging system (`lib/monitoring/logger.ts`) that writes errors to the Supabase database.
    - **Reason**: Audit Finding: [🟡 Mismatch] The codebase uses a custom database logger, not `Sentry` as specified.

- [ ] **DOCS**: Document the implemented Progressive Web App (PWA) architecture.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In section "2. Architectural Overview", add a paragraph explaining that EventFlow is a PWA with offline capabilities, background sync, and push notifications, enabled by a service worker (`public/sw.js`).
    - **Reason**: Audit Finding: A major PWA implementation is present in the code but completely undocumented in the specification.

- [ ] **DOCS**: Document the advanced map optimization features.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In section "7.2. Code Quality & Best Practices", add a new sub-section describing the map performance optimizations, including marker clustering (`lib/map/clustering.ts`) and tile caching (`lib/map/caching.ts`).
    - **Reason**: Audit Finding: Significant map performance features (clustering, caching) are implemented but not documented.

- [ ] **DOCS**: Add a user story for the cookie consent feature.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Epic 3: User Onboarding & Authentication", add a new user story: `*   **EF-024: Cookie Consent:** As a user, I am presented with a cookie consent banner upon my first visit, allowing me to accept or reject non-essential cookies.`
    - **Reason**: Audit Finding: A `CookieBanner` component is implemented but is not part of any specified user story.