### **Project Implementation Plan: EventFlow Audit Remediation**

This document outlines the prioritized work plan to resolve all discrepancies identified in the SpecCheck Audit Report. The tasks are structured atomically to be executed by a developer AI, ensuring the codebase is brought into 100% compliance with the `app_description.md` specification.

---

### **P0 - Critical Fixes & Foundational Setup**

*This tier addresses critical bugs preventing features from working as intended and installs missing core dependencies.*

- [x] **SETUP**: Install missing Firebase Admin SDK for push notifications
    - **File(s)**: `package.json`
    - **Action**: Run the command `npm install firebase-admin`. This is a prerequisite for enabling server-side push notifications.
    - **Reason**: Audit Finding: [❌ Gap] `sw.js` has push handlers, but no server-side FCM SDK is present in `package.json`.

- [x] **FIX**: [EF-013]: Correct engagement API to use the valid `UserAttendingEvent` model
    - **File(s)**: `pages/api/engagement.ts`
    - **Action**: In the `handler` function, replace all instances of `prisma.eventAttendance` with `prisma.userAttendingEvent`. The logic for creating, updating, or deleting records should target the correct model as defined in `prisma/schema.prisma`.
    - **Reason**: Audit Finding: [🟡 Partial] [EF-013]: The API route attempts to use `prisma.eventAttendance`, which does not exist in the schema. The correct model is `UserAttendingEvent`.

---

### **P1 - Missing Feature Implementation**

*This tier creates the necessary components, APIs, and pages for specified features that are currently missing from the codebase.*

- [x] **CREATE**: [EF-022]: Create API endpoint to fetch events a user is attending
    - **File(s)**: `pages/api/user/attended-events.ts` (new file)
    - **Action**: Create a new API route `GET /api/user/attended-events`. This route should be protected, requiring an authenticated session. It will query the `UserAttendingEvent` model to find all events associated with the session user's ID and return the full event details.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-022]: No dedicated page or component was found that lists all events a user has "Joined". This API is the first step.

- [x] **CREATE**: [EF-022]: Create UI page for user's personal event calendar
    - **File(s)**: `app/profile/my-events/page.tsx` (new file)
    - **Action**: Create a new Next.js page component that fetches data from the `/api/user/attended-events` endpoint on component mount. The page should display the list of events, showing key details like title, date, and a link to the event.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-022]: A user-facing page to view "Joined" events is missing.

- [x] **UPDATE**: [EF-022]: Add navigation link to the personal event calendar page
    - **File(s)**: `app/profile/page.tsx`
    - **Action**: Add a new link or button on the main profile page that navigates the user to the `/profile/my-events` page.
    - **Reason**: Audit Finding: [❌ Unverified] [EF-022]: A user-facing page to view "Joined" events is missing. This makes the new page discoverable.

- [x] **CREATE**: [EF-ADM-002]: Create API endpoint for admins to update event status
    - **File(s)**: `pages/api/admin/events/[id].ts` (new file)
    - **Action**: Create a new API route `PUT /api/admin/events/[id]`. This route must be protected by an admin role check. It should accept a new `status` in the request body (e.g., 'PUBLISHED') and update the corresponding event in the database.
    - **Reason**: Audit Finding: [🟡 Partial] [EF-ADM-001 & EF-ADM-002]: The admin dashboard lacks controls to edit or approve draft events. This API is needed for that UI to function.

- [x] **UPDATE**: [EF-ADM-001 & EF-ADM-002]: Add approve/edit controls to the admin curation dashboard
    - **File(s)**: `app/admin/curation/page.tsx`
    - **Action**: In the `Draft Events for Review` section, for each draft event, add an "Approve" button. This button's `onClick` handler should call the new `PUT /api/admin/events/[id]` endpoint to change the event's status to 'PUBLISHED'.
    - **Reason**: Audit Finding: [🟡 Partial] [EF-ADM-001 & EF-ADM-002]: The admin dashboard lacks UI controls to approve draft events.

---

### **P2 - Mismatches & Corrections**

*This tier updates existing code that is implemented but does not fully align with the specification, such as missing feature gating.*

- [x] **UPDATE**: [EF-051]: Gate keyword notification API to "Pro" subscribers
    - **File(s)**: `pages/api/notifications/keywords.ts`
    - **Action**: In the `handler` function, before the `switch (req.method)` block, add a check: `if (user.subscriptionTier !== 'PRO')`. If the user is not a "Pro" subscriber, return a `403 Forbidden` error with a message like "This feature is available for Pro subscribers only."
    - **Reason**: Audit Finding: [🟡 Partial] [EF-051]: The custom keyword notification feature is not gated and is available to all users, contrary to the specification.

- [x] **UPDATE**: [EF-051]: Conditionally render keyword management UI for "Pro" subscribers
    - **File(s)**: `app/profile/notifications/page.tsx`
    - **Action**: Fetch the user's profile, including their `subscriptionTier`. Wrap the keyword management UI (the list, input field, and buttons) in a conditional render. If `profile.subscriptionTier === 'PRO'`, show the UI. Otherwise, show a message like "Upgrade to Pro to unlock custom keyword notifications" with a link to the `/subscribe` page.
    - **Reason**: Audit Finding: [🟡 Partial] [EF-051]: The UI for managing keywords is visible to all users. It should be hidden or disabled for non-Pro users.

---

### **P3 - Documentation Updates**

*This tier addresses all mismatches between the specification and the implemented code by updating the `app_description.md` document.*

- [x] **DOCS**: Update `app_description.md` to reflect the use of Winston for logging
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Section 7.3. Observability Strategy", replace the mention of "Sentry" with "a custom Winston-based logger that writes to the Supabase database".
    - **Reason**: Audit Finding: [🟡 Partial] The spec mentions Sentry, but the code implements a custom Winston logger.

- [x] **DOCS**: Update `app_description.md` schema to include `keywords` field
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Section 5. High-Level Prisma Schema", add the `keywords String[]` field to the `PushSubscription` model definition.
    - **Reason**: Audit Finding: [🟡 Partial] The implemented `PushSubscription` schema contains a `keywords` field that is not documented in the specification.

- [x] **DOCS**: Add Revenue Analytics dashboard to the specification
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Section 6. Development Epics & User Stories", under "Epic 7: Admin Curation & Analytics", update the description for `EF-ADM-003` to be more specific: "As an Admin, I can see a detailed revenue dashboard with daily, weekly, and monthly breakdowns of B2B and B2C income."
    - **Reason**: Audit Finding: The implemented revenue analytics dashboard is far more detailed than the general "Key Metrics" story in the spec.

- [x] **DOCS**: Document performance and security utilities in the specification
    - **File(s)**: `docs/app_description.md`
    - **Action**: In "Section 7.2. Code Quality & Best Practices", add a new bullet point: "**Proactive Performance & Security:** The application includes dedicated utilities for front-end performance (e.g., LCP optimization) and a rate-limited security alert system for robust monitoring."
    - **Reason**: Audit Finding: The `LcpOptimizer`, `memo` utility, and `SecurityAlertSystem` are valuable, implemented features not mentioned in the spec.