# Implementation Plan: Audit Remediation

This document provides a prioritized work plan to address all findings from the SpecCheck Audit Report. The tasks are structured atomically to facilitate implementation by a developer agent, with the goal of bringing the codebase into 100% compliance with its specifications.

---

## P0 - Critical Code Fixes
*Tasks that resolve bugs, security vulnerabilities, or incorrect logic.*

- [x] **FIX**: Remove orphaned subscriptions API endpoint.
    - **File**: `pages/api/subscriptions.ts`
    - **Action**: Delete the entire file. This endpoint is superseded by the more robust Stripe webhook logic and contains incorrect implementation details.
    - **Reason**: Audit finding: "Legacy/Orphaned Endpoint". The file represents dead code that conflicts with the current, correct implementation.

---

## P1 - Implementation of Missing Features
*Tasks to build documented features that are currently missing from the codebase.*

- [x] **UPDATE**: Add keyword storage to PushSubscription model.
    - **File**: `prisma/schema.prisma`
    - **Action**: Modify the `PushSubscription` model to include a new field: `keywords String[] @default([])`. This will store an array of user-defined notification keywords.
    - **Reason**: Audit finding: "User Story EF-051 ([Premium] As a Pro user, I can set up a notification for a specific keyword) is not implemented." This change provides the necessary database schema to store keyword data.

- [x] **COMMAND**: Regenerate Prisma Client.
    - **File**: N/A (Project Root)
    - **Action**: Run the command `npx prisma generate` in the terminal to update the Prisma client types to reflect the recent schema change.
    - **Reason**: To make the new `keywords` field from the `PushSubscription` model available to the application's TypeScript code.

- [x] **CREATE**: Create API endpoint for managing notification keywords.
    - **File**: `pages/api/notifications/keywords.ts`
    - **Action**: Create a new API route that handles `GET`, `POST`, and `DELETE` requests for a user's notification keywords. The `GET` method should retrieve keywords for the authenticated user. The `POST` method should add a new keyword to their list. The `DELETE` method should remove a specified keyword. Ensure the user is authenticated for all methods.
    - **Reason**: Audit finding: "User Story EF-051 is not implemented." This API provides the backend logic for the frontend to manage a user's custom notification keywords.

- [x] **UPDATE**: Implement UI for managing notification keywords.
    - **File**: `app/profile/notifications/page.tsx`
    - **Action**: Below the existing "Enable/Disable Notifications" section, add a new UI section titled "Keyword Notifications". This section should only be visible if notifications are enabled. It must contain: 1. A list of the user's current keywords fetched from the new API. 2. A delete button next to each keyword. 3. An input field and an "Add Keyword" button to add a new keyword. All actions should call the `/api/notifications/keywords` endpoint.
    - **Reason**: Audit finding: "User Story EF-051 is not implemented." This task completes the feature by providing the necessary user interface.

---

## P2 - Correcting Mismatches
*Tasks to modify existing code to align with documentation.*

*(No P2 tasks were identified in the audit. The primary mismatch was the orphaned API, which is addressed as a P0 Critical Fix.)*

---

## P3 - Documentation Updates
*Tasks that modify documentation files to reflect the reality of the implemented code.*

- [x] **DOCS**: Update architectural documentation to describe the job queue system.
    - **File**: `docs/app_description.md`
    - **Action**: In section "2. Architectural Overview", replace the Mermaid diagram node `H(Vercel Cron Job)` and its description. The new diagram and text must accurately describe the use of `node-schedule` to trigger jobs in a `bullmq` (Redis) queue. In section "3. Core Tech Stack", replace the "Vercel Cron Jobs" entry with "BullMQ & node-schedule" and update its rationale to reflect its power for handling resilient, long-running background tasks.
    - **Reason**: Audit finding: "Undocumented Functionality (Documentation Gaps)". The implemented job queue system is significantly more complex and powerful than the simple "Vercel Cron Job" described, and this must be reflected in the core architectural document.