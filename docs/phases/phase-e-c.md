

### Phase C: Monetization & Curation (Remaining Tasks)

This phase focuses on building the complete business logic for event organizers, from claiming an event to promoting it, and giving administrators the tools to oversee this process.

#### Epic 4: Organizer Event Management & Verification

*   [x] **Task C.1: Add "Claim Event" button to UI.**
    *   **File:** `components/EventPopup.tsx`
    *   **Action:** Conditionally render a "Claim Event" button.
    *   **Logic:** The button should only appear for authenticated users on events that have a `status` of `DRAFT` (i.e., unclaimed). This will require a prop `onClaim` to be added to the component's interface.

*   [x] **Task C.2: Create API Route for Event Claim Initiation.**
    *   **File:** `pages/api/events/[id]/claim.ts`
    *   **Action:** Create a new `POST` API route.
    *   **Logic:**
        1.  Ensure the user is authenticated via `getServerSession`.
        2.  Find the user's record in the `User` table.
        3.  Generate a secure random token: `crypto.randomBytes(32).toString('hex')`.
        4.  Create a new `EventClaimRequest` record with `status: 'PENDING'`, linking the `userId`, `eventId`, and the new `verificationToken`.
        5.  (Placeholder for email service) Log a verification URL to the console: `/api/claims/verify?token=...`.
        6.  Return a `201 Created` status with the new claim object.

*   [x] **Task C.3: Create API Route to Handle Claim Verification.**
    *   **File:** `pages/api/claims/verify.ts`
    *   **Action:** Create a new `GET` API route.
    *   **Logic:**
        1.  Read the `token` from the query parameters.
        2.  Find the `EventClaimRequest` in the database using the `verificationToken`. Return 404 if not found.
        3.  Use `prisma.$transaction` to perform two database updates:
            a. Update the `EventClaimRequest` status to `APPROVED`.
            b. Update the associated `Event` record: set `status` to `PUBLISHED` and `organizerId` to the claimer's `userId`.
        4.  On success, redirect the user to `/organizer/dashboard`.

*   [x] **Task C.4: Create API to Fetch Organizer's Events.**
    *   **File:** `pages/api/organizer/events.ts`
    *   **Action:** Create a new `GET` API route.
    *   **Logic:**
        1.  Ensure the user is authenticated.
        2.  Find the user's record.
        3.  Fetch all `Event` records where `organizerId` matches the authenticated user's ID and `status` is `PUBLISHED`.
        4.  Return the list of events as JSON.

*   [x] **Task C.5: Build Organizer's "My Events" Dashboard.**
    *   **File:** `app/organizer/dashboard/page.tsx`
    *   **Action:** Create the frontend page for organizers.
    *   **Logic:**
        1.  Make this a client component (`'use client'`).
        2.  Protect the route using `useSession` to redirect unauthenticated users.
        3.  In a `useEffect` hook, fetch the list of events from `/api/organizer/events`.
        4.  Render the list of events. Each event should display its title, description, and date.
        5.  Each event card must include a "Promote Event" button that links to `/organizer/promote/[eventId]`.

#### Epic 7: Admin Curation

*   [x] **Task C.6: Create API for Admin Claim Management.**
    *   **File:** `pages/api/admin/claims/[claimId].ts`
    *   **Action:** Create a new `PUT` API route for manual claim approval/rejection.
    *   **Logic:**
        1.  Ensure the user is authenticated and has the `ADMIN` role.
        2.  Read the `claimId` from the URL and the desired `status` ('APPROVE' or 'REJECT') from the request body.
        3.  If 'APPROVE', perform the same transaction as the email verification link (update `EventClaimRequest` and `Event`).
        4.  If 'REJECT', update only the `EventClaimRequest` status to `REJECTED`.
        5.  Return a `200 OK` response.

*   [x] **Task C.7: Build Admin Curation Dashboard.**
    *   **File:** `app/admin/curation/page.tsx`
    *   **Action:** Create the frontend page for administrators.
    *   **Logic:**
        1.  Make this a client component (`'use client'`).
        2.  Protect the route for `ADMIN` role users.
        3.  Fetch all events with `status: 'DRAFT'` and all `EventClaimRequest`s with `status: 'PENDING'`.
        4.  Render two sections: "Draft Events for Review" and "Pending Claims".
        5.  For each pending claim, render "Approve" and "Reject" buttons that trigger a `PUT` request to `/api/admin/claims/[claimId]`. On success, remove the item from the list.

#### Epic 5: B2B Monetization Fulfillment

*   [x] **Task C.8: Update Stripe Webhook for Promotions.**
    *   **File:** `pages/api/webhooks/stripe.ts`
    *   **Action:** Enhance the `checkout.session.completed` event handler.
    *   **Logic:**
        1.  Inside the `switch` statement for `event.type`, check if `checkoutSession.metadata.eventId` exists.
        2.  If it does, this signifies a promotion purchase.
        3.  Create a new record in the `Promotion` table, linking it to the `eventId` and storing the `stripeChargeId`.
        4.  Update the corresponding `Event` record, setting `isFeatured` to `true`.

*   [x] **Task C.9: Prioritize Featured Events in Search API.**
    *   **File:** `pages/api/search.ts`
    *   **Action:** Modify the Prisma query to prioritize featured events.
    *   **Logic:** Add an `orderBy` clause to the `prisma.event.findMany` call: `orderBy: [{ isFeatured: 'desc' }, { startTime: 'asc' }]`.

---

### Phase E: Premium & Growth (Remaining Tasks)

This phase focuses on implementing the B2C subscription model, including the core "Pro" features like push notifications and subscription management.

#### Epic 6: Premium User Subscriptions (B2C)

*   [x] **Task E.1: Create API for Managing Push Subscriptions.**
    *   **File:** `pages/api/notifications/subscribe.ts`
    *   **Action:** Create a new API route with `POST` and `DELETE` handlers.
    *   **Logic:**
        *   **POST:** Authenticate user. Take the push subscription object from the request body and save it to the `PushSubscription` table, linking it to the user's ID.
        *   **DELETE:** Authenticate user. Take the subscription `endpoint` from the request body, find the matching record for that user, and delete it.

*   [x] **Task E.2: Enhance Service Worker for Push Events.**
    *   **File:** `public/sw.js`
    *   **Action:** Add event listeners for `push` and `notificationclick` to the end of the file.
    *   **Logic:**
        *   The `push` listener should parse the event data as JSON and call `self.registration.showNotification()`.
        *   The `notificationclick` listener should close the notification and focus or open a new window to the app's root URL.

*   [x] **Task E.3: Build UI for Notification Preferences.**
    *   **File:** `app/profile/notifications/page.tsx`
    *   **Action:** Create the frontend page for users to manage notifications.
    *   **Logic:**
        1.  Make this a client component (`'use client'`).
        2.  Check if the user is authenticated.
        3.  Render a button "Enable Notifications". On click, request permission from `navigator`, get the subscription object via `registration.pushManager.subscribe()`, and `POST` it to `/api/notifications/subscribe`.
        4.  If a subscription already exists, show an "Disable Notifications" button that sends a `DELETE` request instead.

*   [x] **Task E.4: Update Stripe Webhook for Subscription Lifecycle.**
    *   **File:** `pages/api/webhooks/stripe.ts`
    *   **Action:** Add handlers for B2C subscription status changes.
    *   **Logic:**
        *   Add `case 'invoice.paid':` and `case 'customer.subscription.created':`. In the handler, find the user by their `stripeCustomerId` and update their `subscriptionTier` to `'PRO'`.
        *   Add `case 'customer.subscription.deleted':`. In the handler, find the user by `stripeCustomerId` and set their `subscriptionTier` back to `'FREE'`.

*   [x] **Task E.5: Create API for Stripe Customer Portal.**
    *   **File:** `pages/api/user/manage-subscription.ts`
    *   **Action:** Create a new `POST` API route.
    *   **Logic:**
        1.  Ensure the user is authenticated.
        2.  Retrieve the user's `stripeCustomerId` from the database.
        3.  Call `stripe.billingPortal.sessions.create()` with the customer ID and a `return_url` pointing back to the profile page.
        4.  Return the generated `url` in the JSON response.

*   [x] **Task E.6: Add "Manage Subscription" Button to Profile UI.**
    *   **File:** `app/profile/page.tsx`
    *   **Action:** Add a button for subscription management.
    *   **Logic:**
        1.  The button's `onClick` handler should make a `POST` request to `/api/user/manage-subscription`.
        2.  When it receives the JSON response with the URL, it should redirect the browser using `window.location.href = data.url;`.