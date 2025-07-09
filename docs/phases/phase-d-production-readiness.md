Understood. The following is a highly explicit and unambiguous version of the plan for **Phase D**. Each task includes the exact file to modify, the specific actions to take, and detailed logic or code snippets to eliminate any guesswork during implementation.

---
# **`docs/phases/phase-d-production-readiness.md`**

# **Phase D: Production Readiness & Feature Completion**

### **Primary Goal**
To harden the application and implement all critical missing business logic from Phases C and E. This involves adding observability and testing, overhauling the database schema to match the specification, and building out the complete B2B/B2C feature set (event claiming/verification, B2B promotions, and premium user subscription management).

### **Epics Covered**
*   Epic 4: Organizer Event Management & Verification (Full Implementation)
*   Epic 5: Organizer Monetization (B2B) (Backend Logic)
*   Epic 6: Premium User Subscriptions (B2C) (Full Implementation)
*   Epic 7: Admin Curation & Analytics (Curation Workflow)
*   *Cross-cutting Concern: Production Quality & Observability*

### **Definition of Done**
*   All tasks in this document are checked off.
*   The database schema in `prisma/schema.prisma` fully matches the specification in `docs/app_description.md`.
*   The codebase is fully integrated with Sentry for error monitoring.
*   The project has a complete, configured testing suite (Jest & Cypress).
*   The full event claiming, email verification, and organizer dashboard workflow is implemented.
*   The B2B promotion payment flow correctly flags events as "featured" in the database.
*   Premium "Pro" users can manage their subscriptions via a Stripe Customer Portal and receive push notifications.

---

## **1. Infrastructure: Observability (Sentry)**

*   [x] **Task D.1.1: Install Sentry SDK.**
    *   **File:** `package.json`
    *   **Action:** Run the exact command: `npm install @sentry/nextjs`.

*   [x] **Task D.1.2: Initialize Sentry Configuration.**
    *   **Action:** Create the following three files with the specified content.
    *   **File 1:** `sentry.client.config.ts`
        ```typescript
        import * as Sentry from "@sentry/nextjs";
        Sentry.init({
          dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
          tracesSampleRate: 1.0,
        });
        ```
    *   **File 2:** `sentry.server.config.ts`
        ```typescript
        import * as Sentry from "@sentry/nextjs";
        Sentry.init({
          dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
          tracesSampleRate: 1.0,
        });
        ```
    *   **File 3:** `sentry.edge.config.ts`
        ```typescript
        import * as Sentry from "@sentry/nextjs";
        Sentry.init({
          dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
          tracesSampleRate: 1.0,
        });
        ```

*   [x] **Task D.1.3: Integrate Sentry with Next.js Build Process.**
    *   **File:** `next.config.js`
    *   **Action:** Modify the `module.exports` to be wrapped by `withSentryConfig`.
    *   **Logic:**
        ```javascript
        // BEFORE:
        // const withPWA = require('next-pwa')({...});
        // module.exports = withPWA({...});

        // AFTER:
        const { withSentryConfig } = require("@sentry/nextjs");
        const withPWA = require('next-pwa')({
          dest: 'public',
          disable: process.env.NODE_ENV === 'development',
          register: true,
          skipWaiting: true,
        });

        const nextConfig = withPWA({
          reactStrictMode: true,
          swcMinify: true,
        });
        
        module.exports = withSentryConfig(
          nextConfig,
          { silent: true }, // Sentry-specific options
          { hideSourceMaps: true } // Sentry-specific options
        );
        ```

## **2. Infrastructure: Quality Assurance (Testing)**

*   [x] **Task D.2.1: Install Testing Dependencies.**
    *   **File:** `package.json`
    *   **Action:** Run the exact command: `npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom cypress`.

*   [x] **Task D.2.2: Configure Jest for Next.js.**
    *   **File:** `jest.config.js`
    *   **Action:** Create the file with the following content.
        ```javascript
        const nextJest = require('next/jest');
        const createJestConfig = nextJest({ dir: './' });
        const customJestConfig = {
          setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
          testEnvironment: 'jest-environment-jsdom',
        };
        module.exports = createJestConfig(customJestConfig);
        ```

*   [x] **Task D.2.3: Create Jest Setup File.**
    *   **File:** `jest.setup.js`
    *   **Action:** Create the file with the following content.
        ```javascript
        import '@testing-library/jest-dom/extend-expect';
        ```

*   [x] **Task D.2.4: Configure Cypress.**
    *   **File:** `cypress.config.ts`
    *   **Action:** Create the file with the following content.
        ```typescript
        import { defineConfig } from 'cypress';
        export default defineConfig({
          e2e: {
            setupNodeEvents(on, config) {
              // implement node event listeners here
            },
          },
        });
        ```

*   [x] **Task D.2.5: Add Test Scripts to package.json.**
    *   **File:** `package.json`
    *   **Action:** In the `scripts` object, add two new key-value pairs.
        ```json
        "scripts": {
          // ... existing scripts
          "test": "jest --watch",
          "cypress:open": "cypress open"
        },
        ```

## **3. Backend: Schema Overhaul (Closing the Spec Gap)**

*   [x] **Task D.3.1: Overhaul Prisma Schema to Match Specification.**
    *   **File:** `prisma/schema.prisma`
    *   **Action:** Delete all existing content in this file and replace it with the exact schema below.
    *   **Logic:**
        ```prisma
        generator client {
          provider = "prisma-client-js"
        }

        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }

        model User {
          id                 String              @id @default(uuid())
          email              String              @unique
          name               String?
          supabaseAuthId     String              @unique @map("supabase_auth_id")
          stripeCustomerId   String?             @unique @map("stripe_customer_id")
          subscriptionTier   String              @default("FREE") // FREE, PRO
          createdAt          DateTime            @default(now()) @map("created_at")
          updatedAt          DateTime            @updatedAt @map("updated_at")
          
          organizedEvents    Event[]             @relation("EventOrganizer")
          eventsAttending    UserAttendingEvent[]
          eventClaimRequests EventClaimRequest[]
          pushSubscriptions  PushSubscription[]
        }

        model Event {
          id              String      @id @default(cuid())
          title           String
          description     String      @db.Text
          startTime       DateTime    @map("start_time")
          endTime         DateTime?   @map("end_time")
          venueName       String?     @map("venue_name")
          address         String?
          latitude        Float?
          longitude       Float?
          sourceUrl       String      @map("source_url")
          imageUrl        String?     @map("image_url")
          isFree          Boolean     @default(true) @map("is_free")
          isFeatured      Boolean     @default(false) @map("is_featured")
          status          String      @default("DRAFT") // DRAFT, PUBLISHED, FLAGGED
          createdAt       DateTime    @default(now()) @map("created_at")
          updatedAt       DateTime    @updatedAt @map("updated_at")

          organizerId     String?     @map("organizer_id")
          organizer       User?       @relation("EventOrganizer", fields: [organizerId], references: [id])
          
          categoryId      String?
          category        Category?   @relation(fields: [categoryId], references: [id])
          
          attendees       UserAttendingEvent[]
          promotions      Promotion[]
          claimRequests   EventClaimRequest[]

          @@index([startTime, status])
        }

        model Category {
          id     String  @id @default(cuid())
          name   String  @unique
          events Event[]
        }

        model UserAttendingEvent {
          userId    String
          user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
          eventId   String
          event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
          createdAt DateTime @default(now())

          @@id([userId, eventId])
        }

        model EventClaimRequest {
          id                String   @id @default(cuid())
          status            String   @default("PENDING") // PENDING, APPROVED, REJECTED
          verificationToken String?  @unique @map("verification_token")
          createdAt         DateTime @default(now())
          updatedAt         DateTime @updatedAt
          userId            String
          user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
          eventId           String
          event             Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
          
          @@unique([userId, eventId])
        }

        model Promotion {
          id             String    @id @default(cuid())
          eventId        String
          event          Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
          stripeChargeId String    @unique @map("stripe_charge_id")
          promotionTier  String    @map("promotion_tier")
          expiresAt      DateTime  @map("expires_at")
          createdAt      DateTime  @default(now()) @map("created_at")
        }

        model PushSubscription {
          id        String   @id @default(cuid())
          userId    String
          user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
          endpoint  String   @unique
          keys      Json
          createdAt DateTime @default(now()) @map("created_at")
        }
        ```
*   [x] **Task D.3.2: Generate New Prisma Client.**
    *   **Action:** Run the exact command: `npx prisma generate`.

## **4. Feature: Event Curation & Organizer Tools (Epic 4)**

*   [x] **Task D.4.1: Create API Route for Event Claim Initiation.**
    *   **File:** `pages/api/events/[id]/claim.ts`
    *   **Action:** Create a new API route that allows a user to claim an event.
    *   **Logic:**
        1.  Check for `POST` method.
        2.  Get user session. Return 401 if not authenticated.
        3.  Get event ID from `req.query.id`.
        4.  Use `prisma.eventClaimRequest.create` to insert a new request linking the `userId` and `eventId`.
        5.  Return 201 Created on success.

*   [x] **Task D.4.2: Implement Email Verification for Claims.**
    *   **File:** `pages/api/events/[id]/claim.ts`
    *   **Action:** Extend the previous task to send a verification email.
    *   **Logic:**
        1.  After successfully creating the `EventClaimRequest`, generate a secure random token: `const token = crypto.randomBytes(32).toString('hex');`
        2.  Update the newly created claim request with the token: `prisma.eventClaimRequest.update({ where: { id: newClaim.id }, data: { verificationToken: token } });`
        3.  (Placeholder for email service) Log the verification URL to the console: `console.log(\`Verification URL: /api/claims/verify?token=${token}\`);`

*   [x] **Task D.4.3: Create API Route to Handle Claim Verification.**
    *   **File:** `pages/api/claims/verify.ts`
    *   **Action:** Create the endpoint that the user clicks from their email.
    *   **Logic:**
        1.  Check for `GET` method.
        2.  Get the `token` from `req.query`.
        3.  Find the claim request: `prisma.eventClaimRequest.findUnique({ where: { verificationToken: token } });`
        4.  If not found, return 404.
        5.  Use a `prisma.$transaction` to:
            a.  Update the `EventClaimRequest` status to `APPROVED`.
            b.  Update the associated `Event`'s `status` to `PUBLISHED` and set its `organizerId` to the claimer's user ID.
        6.  On success, redirect the user to the organizer dashboard: `res.redirect('/organizer/dashboard');`

*   [x] **Task D.4.4: Build Admin Curation & Claim Management Dashboard.**
    *   **File:** `app/admin/curation/page.tsx`
    *   **Action:** Create the React page for the admin interface.
    *   **Logic:**
        1.  Protect the route to require an admin role.
        2.  Fetch all events with `status: 'DRAFT'`.
        3.  Fetch all claims with `status: 'PENDING'`.
        4.  Render two lists: "Draft Events for Review" and "Pending Claims".
        5.  Each item in "Pending Claims" should have "Approve" and "Reject" buttons that call `PUT /api/admin/claims/[claimId]` with the new status.

*   [x] **Task D.4.5: Create Admin API for Manual Claim Management.**
    *   **File:** `pages/api/admin/claims/[claimId].ts`
    *   **Action:** Build the secure endpoint for an admin to approve or reject a claim.
    *   **Logic:**
        1.  Implement a `PUT` handler.
        2.  Verify the user is an Admin.
        3.  Get `claimId` from URL and new status ('APPROVED'/'REJECTED') from the request body.
        4.  If 'APPROVED', use a transaction to update the `EventClaimRequest` and the associated `Event` (set `organizerId` and `status`).
        5.  If 'REJECTED', just update the `EventClaimRequest` status.

*   [x] **Task D.4.6: Build Organizer's "My Events" Dashboard.**
    *   **File:** `app/organizer/dashboard/page.tsx`
    *   **Action:** Create a page for organizers to view their events.
    *   **Logic:**
        1.  Protect route for authenticated users.
        2.  Fetch all events where the `organizerId` matches the current user's ID.
        3.  Display a list of these events. Each event card must include a "Promote Event" button which links to a promotion page.

*   [x] **Task D.4.7: Add "Claim Event" Button to UI.**
    *   **File:** `components/EventPopup.tsx`
    *   **Action:** Add the user-facing button to initiate a claim.
    *   **Logic:**
        1.  Inside the component, get the user session.
        2.  Conditionally render a `<Button>`: ` {isAuthenticated && <Button onClick={handleClaim}>Claim Event</Button>} `
        3.  The `handleClaim` function will trigger a `POST` request to `/api/events/[EVENT_ID]/claim`.

## **5. Feature: B2B Monetization Backend (Epic 5)**

*   [x] **Task D.5.1: Update Stripe Webhook for Promotions.**
    *   **File:** `pages/api/webhooks/stripe.ts`
    *   **Action:** Enhance the webhook to handle successful B2B promotion checkouts.
    *   **Logic:**
        1.  Inside the `switch (event.type)` block, add: `case 'checkout.session.completed':`
        2.  Get the session object: `const checkoutSession = event.data.object;`
        3.  Check if `checkoutSession.metadata.eventId` exists.
        4.  If it does, create a `Promotion` record in the database and update the corresponding `Event`'s `isFeatured` flag to `true`. Include the `stripeChargeId` from the session.

*   [x] **Task D.5.2: Prioritize Featured Events in Search API.**
    *   **File:** `pages/api/search.ts`
    *   **Action:** Modify the event fetching logic to always show featured events first.
    *   **Logic:** Add an `orderBy` clause to the main `prisma.event.findMany` call: `orderBy: [{ isFeatured: 'desc' }, { startTime: 'asc' }]`.

## **6. Feature: Premium User Features (B2C - Epic 6)**

*   [x] **Task D.6.1: Create API for Managing Push Subscriptions.**
    *   **File:** `pages/api/notifications/subscribe.ts`
    *   **Action:** Build endpoints to save and delete push subscriptions.
    *   **Logic:**
        1.  **POST handler:** Get user from session, get subscription object from body, save to `PushSubscription` table, linking it to the `userId`.
        2.  **DELETE handler:** Get user from session, get `endpoint` from body, delete from `PushSubscription` table.

*   [x] **Task D.6.2: Enhance Service Worker for Push Events.**
    *   **File:** `public/sw.js`
    *   **Action:** Append the following listeners to the end of the file.
        ```javascript
        self.addEventListener('push', event => {
          const data = event.data.json();
          event.waitUntil(
            self.registration.showNotification(data.title, {
              body: data.body,
              icon: '/icons/icon-192x192.png'
            })
          );
        });

        self.addEventListener('notificationclick', event => {
          event.notification.close();
          event.waitUntil(clients.openWindow('/'));
        });
        ```

*   [x] **Task D.6.3: Build UI for Notification Preferences.**
    *   **File:** `app/profile/notifications/page.tsx`
    *   **Action:** Create the user-facing page to enable notifications.
    *   **Logic:**
        1.  Check if user is on a "PRO" plan (from their user record).
        2.  Display an "Enable Notifications" button.
        3.  On click, request notification permission. If granted, get the subscription object from `self.registration.pushManager.subscribe()` and `POST` it to `/api/notifications/subscribe`.

*   [x] **Task D.6.4: Update User Record on B2C Subscription.**
    *   **File:** `pages/api/webhooks/stripe.ts`
    *   **Action:** Enhance the webhook to manage user subscription status.
    *   **Logic:**
        1.  Add `case 'invoice.paid':` and `case 'customer.subscription.created':`. In the handler, get the `customerId` and user email. Find the user and update `stripeCustomerId` and set `subscriptionTier` to `'PRO'`.
        2.  Add `case 'customer.subscription.deleted':`. In the handler, find the user by `customerId` and set `subscriptionTier` to `'FREE'`.

*   [x] **Task D.6.5: Implement Stripe Customer Portal.**
    *   **File 1 (API):** `pages/api/user/manage-subscription.ts`
        *   **Action:** Create an API route that generates a Stripe Billing Portal session.
        *   **Logic:** Get the authenticated user, retrieve their `stripeCustomerId` from the database, call `stripe.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: ... })`, and return the session URL as JSON.
    *   **File 2 (UI):** `app/profile/page.tsx`
        *   **Action:** Add a "Manage Subscription" button.
        *   **Logic:** The button's `onClick` handler calls `/api/user/manage-subscription`, gets the URL from the response, and then executes `window.location.href = data.url;`.

## **7. Finalization**

*   [x] **Task D.7.1: Final Prisma Client Generation.**
    *   **Action:** Run the exact command `npx prisma generate` to ensure client types are perfectly in sync with all schema changes from this phase.