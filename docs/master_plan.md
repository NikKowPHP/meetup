Got it. Using alphabetical naming for phases is a great way to avoid implying a strict numerical sequence, which can be more flexible.

Here is the updated master plan with alphabetical phase naming, along with the corresponding filenames you requested.

---

# **Project EventFlow: Development Master Plan**

## 1. Introduction

This document outlines the phased development roadmap for **Project EventFlow**, from initial setup to production launch and post-launch enhancements. Its purpose is to provide a high-level overview of the development lifecycle and serve as a central reference point for the detailed phase documents.

Our development will be guided by the following principles:
*   **MVP First:** We will prioritize building a lean but complete Minimum Viable Product that validates our core value proposition: aggregating events and providing a B2B monetization path for organizers.
*   **Quality & Robustness:** Every phase will include testing, error handling, and observability as first-class citizens, not afterthoughts.
*   **Admin as a Core Feature:** The admin curation panel is critical for data quality and will be developed as an integral part of the MVP, not a post-launch addition.
*   **Iterative Enhancement:** After the MVP is launched and validated, we will iteratively add features based on user feedback and business goals.

## 2. Development Phases Overview

The project is broken down into five distinct phases, named alphabetically. Each phase has a clear goal, a set of deliverables, and a detailed breakdown of tasks located in its corresponding markdown file.

| Phase | Title | Primary Goal | Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase A** | Foundation & Setup | Establish the technical foundation and CI/CD pipeline. | A deployable "hello world" app with all services connected. |
| **Phase B** | Core Aggregation & Discovery | Implement the core user-facing feature: finding events. | An anonymous-user-accessible PWA showing filtered events on a map. |
| **Phase C** | Monetization & Curation | Build the user/organizer systems and the business model. | A feature-complete MVP with auth, event claiming, B2B payments, and admin controls. |
| **Phase D** | Production Readiness & Launch | Harden, test, and polish the application for public release. | A stable, secure, and legally compliant application live in production. |
| **Phase E**| Post-Launch: Premium & Growth | Enhance the platform with B2C monetization and new features. | The first major feature update, introducing "Pro" user subscriptions. |

---

## **Phase A: Foundation & Setup**

This non-functional phase is about preparing the development environment and infrastructure to ensure maximum velocity and stability for subsequent phases.

*   **Goal:** Prepare the battlefield. All core services are configured, and a CI/CD pipeline is established for automated deployments.
*   **Key Activities:**
    *   Initialize Git repository and Next.js project.
    *   Set up Vercel for deployment (Dev/Preview/Prod environments).
    *   Configure Supabase (Auth, DB, Storage) and Stripe (Test Mode).
    *   Establish environment variable management (`.env.example`).
    *   Implement basic CI/CD with linting, type-checking, and build steps.
    *   Set up Sentry for error tracking.
*   **Epics Touched:** Infrastructure for all future epics.
*   **Details:** `[See Full Details in docs/phase-a-foundation-setup.md](./phase-a-foundation-setup.md)`

---

## **Phase B: Core Aggregation & Discovery**

This phase focuses exclusively on the primary value proposition for the end-user: discovering events. Authentication and monetization are deferred to ensure we perfect the core experience first.

*   **Goal:** Prove the core user value. A user must be able to visit the site and easily find local events.
*   **Epics Covered:**
    *   Epic 1: Automated Content Aggregation
    *   Epic 2: Core User Experience (Free)
*   **User Stories:** `EF-001`, `EF-002`, `EF-003`, `EF-010`, `EF-011`, `EF-012`.
*   **Details:** `[See Full Details in docs/phase-b-core-aggregation-discovery.md](./phase-b-core-aggregation-discovery.md)`

---

## **Phase C: Monetization & Curation**

With the core discovery functional, this phase builds the systems required to support a multi-sided marketplace: user accounts, organizer tools, payment processing, and administrative oversight.

*   **Goal:** Validate the business model and ensure platform quality.
*   **Epics Covered:**
    *   Epic 3: User Onboarding & Authentication
    *   Epic 4: Organizer Event Management & Verification
    *   Epic 5: Organizer Monetization (B2B)
    *   Epic 7: Admin Curation & Analytics (Curation part)
*   **User Stories:** `EF-020`, `EF-021`, `EF-022`, `EF-030`, `EF-031`, `EF-032`, `EF-040`, `EF-041`, `EF-042`, `EF-ADM-001`, `EF-ADM-002`, `EF-ADM-004`.
*   **Details:** `[See Full Details in docs/phase-c-monetization-curation.md](./phase-c-monetization-curation.md)`

---

## **Phase D: Production Readiness & Launch**

This phase is a feature freeze. The entire focus shifts to hardening the complete MVP from Phase C, ensuring it is secure, performant, and reliable enough for a public audience.

*   **Goal:** Harden the MVP for a successful and stable public launch.
*   **Key Activities:**
    *   Comprehensive end-to-end and user acceptance testing (UAT).
    *   Performance optimization (Lighthouse scores, query optimization, image loading).
    *   Security audit (checking for XSS, CSRF, insecure API endpoints).
    *   Finalizing UI/UX polish and mobile responsiveness.
    *   Writing and integrating legal documents (Privacy Policy, ToS).
    *   Configuring production environments, databases, and alerting.
*   **Epics Touched:** Quality assurance across all previously implemented epics.
*   **Details:** `[See Full Details in docs/phase-d-production-readiness.md](./phase-d-production-readiness.md)`

---

## **Phase E: Post-Launch - Premium & Growth**

Once the MVP is live and gathering initial user data, we will begin developing features that enhance the experience for power users and introduce our secondary B2C revenue stream.

*   **Goal:** Enhance and Grow. Introduce the "Pro" subscription and provide deeper analytics for the admin team.
*   **Epics Covered:**
    *   Epic 6: Premium User Subscriptions (B2C)
    *   Epic 7: Admin Curation & Analytics (Analytics part)
    *   Expansion of Epic 1 (adding more scraper sources)
*   **User Stories:** `EF-050`, `EF-051`, `EF-052`, `EF-ADM-003`.
*   **Details:** `[See Full Details in docs/phase-e-premium-growth.md](./phase-e-premium-growth.md)`

---

### **Example Structure for `docs/phase-b-core-aggregation-discovery.md`**

To maintain consistency, each phase document should follow this template:

````markdown
Excellent. This is a best-practice approach for turning a high-level plan into an actionable developer checklist. The atomic structure, with explicit files, commands, and code snippets, minimizes ambiguity and maximizes productivity.

Here is the refined structure for `Phase B`, following the highly detailed and atomic format you provided. This template can now be used for all other phase documents.

---

# **`docs/phase-b-core-aggregation-discovery.md`**

# **Phase B: Core Aggregation & Discovery**

### **Primary Goal**
To implement the core, unauthenticated user experience of discovering and filtering events from automatically aggregated sources. This phase focuses entirely on data ingestion and public-facing presentation.

### **Epics Covered**
*   Epic 1: Automated Content Aggregation
*   Epic 2: Core User Experience (Free)

### **Definition of Done**
*   All tasks in this document are checked off and have passed code review.
*   The scraper pipeline successfully ingests and deduplicates data from at least two distinct sources (one static, one dynamic) into the database via a cron job.
*   An anonymous user can visit the staging URL, see events on an interactive map, and filter them by category, date, and price.
*   The application is free of P0/P1 bugs related to the implemented features.
*   All code is deployed and functional on the Vercel staging/preview environment.

---

## **1. Backend: Scraper Pipeline & API**

### 1.1. Scraper Implementation (Epic 1)

*   [ ] **Task B.1.1: Implement Static Site Scraper.**
    *   **Action:** Write a Cheerio-based scraper for a simple, server-rendered HTML event listing.
    *   **File:** `src/lib/scrapers/static-source.ts`
    *   **Target:** A local community blog or similar static site.
    *   **Logic:**
        ```typescript
        // Pseudocode
        // fetchHTML(url) -> cheerio.load(html)
        // selectAll('.event-item') -> map over each item
        // extract .title, .date, .description
        // return structured event array
        ```

*   [ ] **Task B.1.2: Implement Dynamic Site Scraper.**
    *   **Action:** Write a Puppeteer-based scraper for a JavaScript-heavy, client-rendered site.
    *   **File:** `src/lib/scrapers/dynamic-source.ts`
    *   **Target:** A site like Meetup.com or Eventbrite.
    *   **Logic:**
        ```typescript
        // Pseudocode
        // launch puppeteer -> newPage() -> goto(url)
        // waitForSelector('.event-card')
        // page.$$eval('.event-card', cards => cards.map(c => ...))
        // return structured event array
        ```

### 1.2. Pipeline & Data Persistence (Epic 1)

*   [ ] **Task B.1.3: Implement Event Deduplication Logic.**
    *   **Action:** Before creating a new event record, check if an event with a similar signature already exists to prevent duplicates.
    *   **File:** `src/lib/scrapers/pipeline.ts` (A new file to orchestrate scraping)
    *   **Strategy:** Use a composite key for the check: `title` + `startTime` + `sourceUrl`.
    *   **Code Snippet:**
        ```typescript
        // In the pipeline function after scraping
        for (const event of scrapedEvents) {
          const existingEvent = await prisma.event.findFirst({
            where: {
              title: event.title,
              startTime: event.startTime,
              sourceUrl: event.sourceUrl,
            },
          });
          if (!existingEvent) {
            await prisma.event.create({ data: event });
          }
        }
        ```

*   [ ] **Task B.1.4: Create Vercel Cron Job to Trigger Pipeline.**
    *   **Action:** Configure `vercel.json` to run the scraper pipeline on a schedule. Create an API route that acts as the secure entry point for the cron job.
    *   **File 1:** `vercel.json`
    *   **Content:**
        ```json
        {
          "crons": [
            {
              "path": "/api/cron/scrape?token=${CRON_SECRET}",
              "schedule": "0 5 * * *" // Every day at 5 AM UTC
            }
          ]
        }
        ```
    *   **File 2:** `src/app/api/cron/scrape/route.ts`
    *   **Action:** This route will import and execute the main pipeline function, ensuring it's protected by a secret token.

### 1.3. Robustness & Observability

*   [ ] **Task B.1.5: Implement Retry Logic for Network Requests.**
    *   **Action:** Wrap individual scraper `fetch` or `page.goto` calls in a utility function that implements a retry mechanism with exponential backoff.
    *   **File:** `src/lib/utils/network.ts`
    *   **Strategy:** Attempt a request up to 3 times, waiting 1s, then 2s, then 4s between failures before throwing an error.

*   [ ] **Task B.1.6: Integrate Sentry for Scraper Failures.**
    *   **Action:** Add `Sentry.captureException(e)` in the `catch` block of each scraper and within the main pipeline orchestrator to get immediate alerts on failures.
    *   **File:** `src/lib/scrapers/pipeline.ts` and individual scraper files.

---

## **2. Frontend: Discovery & Interaction**

### 2.1. API for Event Discovery

*   [ ] **Task B.2.1: Create API Route to Fetch Events.**
    *   **Action:** Build a GET endpoint that fetches events from the database. It must be able to filter by the geographical bounds of the map view.
    *   **File:** `src/app/api/events/route.ts`
    *   **Logic:**
        ```typescript
        // In GET handler
        // 1. Parse query params: minLat, maxLat, minLng, maxLng, category, etc.
        // 2. Build a Prisma `where` clause.
        // 3. const events = await prisma.event.findMany({ where: ... });
        // 4. return Response.json(events);
        ```

### 2.2. Map Integration (Epic 2)

*   [ ] **Task B.2.2: Build the Interactive Map Component.**
    *   **Action:** Create a client component using `react-map-gl` (Mapbox) to render the map and display event data as pins.
    *   **File:** `src/features/event-map/components/EventMap.tsx`
    *   **Note:** This component will be responsible for managing the map's viewport state (zoom, center).

*   [ ] **Task B.2.3: Integrate React Query for Live Map Data.**
    *   **Action:** Use the `useQuery` hook to fetch event data from `/api/events` whenever the map's viewport changes (with debouncing).
    *   **File:** `src/features/event-map/components/EventMap.tsx`
    *   **Code Snippet:**
        ```tsx
        'use client';
        import { useQuery } from '@tanstack/react-query';
        // ...
        const [viewport, setViewport] = useState(...);

        const { data: events, isLoading } = useQuery({
          // The query key includes viewport bounds to auto-refetch on change
          queryKey: ['events', viewport.bounds],
          queryFn: () => fetch(`/api/events?bounds=${JSON.stringify(viewport.bounds)}`).then(res => res.json()),
          placeholderData: keepPreviousData, // Smooth experience while panning
        });
        ```

### 2.3. Filtering and Details UI (Epic 2)

*   [ ] **Task B.2.4: Implement the Filter UI.**
    *   **Action:** Create the UI components for filtering by category (checkboxes), date range (calendar picker), and price (switch/radio).
    *   **File:** `src/features/event-map/components/EventFilters.tsx`
    *   **State Management:** Use `useState` or `useReducer` in a parent component to manage the combined filter state.

*   [ ] **Task B.2.5: Connect Filters to the API Query.**
    *   **Action:** Pass the filter state into the `useQuery` key. React Query will automatically detect the key change and refetch data with the new filter parameters.
    *   **File:** A parent component, e.g., `src/app/page.tsx` or `src/features/event-map/EventDiscovery.tsx`.
    *   **Code Snippet:**
        ```tsx
        const [filters, setFilters] = useState(...);
        const { data: events } = useQuery({
          queryKey: ['events', viewport.bounds, filters], // `filters` is now part of the key
          queryFn: () => fetchEvents(viewport.bounds, filters),
        });
        ```

*   [ ] **Task B.2.6: Create the Event Details View.**
    *   **Action:** Build a modal or drawer component that displays the full details of an event when a user clicks on a map pin.
    *   **File:** `src/features/event-map/components/EventDetailView.tsx`
    *   **Content:** Should display title, description, time, address, image, and a prominent link to the original `sourceUrl`.
````