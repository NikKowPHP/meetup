

# **Project EventFlow: Development Master Plan (Updated Status)**

## 1. Introduction

This document outlines the phased development roadmap for **Project EventFlow**, from initial setup to production launch and post-launch enhancements. Its purpose is to provide a high-level overview of the development lifecycle and serve as a central reference point for the detailed phase documents.

Our development will be guided by the following principles:
*   **MVP First:** We will prioritize building a lean but complete Minimum Viable Product that validates our core value proposition: aggregating events and providing a B2B monetization path for organizers.
*   **Quality & Robustness:** Every phase will include testing, error handling, and observability as first-class citizens, not afterthoughts.
*   **Admin as a Core Feature:** The admin curation panel is critical for data quality and will be developed as an integral part of the MVP, not a post-launch addition.
*   **Iterative Enhancement:** After the MVP is launched and validated, we will iteratively add features based on user feedback and business goals.

## 2. Development Phases Overview

The project is broken down into five distinct phases. This overview reflects the current implementation status.

| Phase | Title | Status | Primary Goal | Deliverable |
| :--- | :--- | :--- | :--- | :--- |
| **Phase A** | Foundation & Setup | ✅ **Completed** | Establish the technical foundation and CI/CD pipeline. | A deployable "hello world" app with all services connected. |
| **Phase B** | Core Aggregation & Discovery | ✅ **Completed** | Implement the core user-facing feature: finding events. | An anonymous-user-accessible PWA showing filtered events on a map. |
| **Phase C** | Monetization & Curation | 🟡 **Partially Implemented** | Build the user/organizer systems and the business model. | A feature-complete MVP with auth, event claiming, B2B payments, and admin controls. |
| **Phase D** | Production Readiness & Launch | 📝 **In Progress** | Harden, test, and polish the application for public release. | A stable, secure, and legally compliant application live in production. |
| **Phase E**| Post-Launch: Premium & Growth | 🟡 **Partially Implemented**| Enhance the platform with B2C monetization and new features. | The first major feature update, introducing "Pro" user subscriptions. |

---

## **Phase A: Foundation & Setup**

### Status: ✅ Completed
All foundational tasks are implemented. The project has a deployable Next.js structure with configured clients for Supabase and Stripe.

*   **Goal:** Prepare the battlefield. All core services are configured, and a CI/CD pipeline is established for automated deployments.
*   **Key Activities:**
    *   [x] Initialize Git repository and Next.js project.
    *   [x] Set up Vercel for deployment (Dev/Preview/Prod environments).
    *   [x] Configure Supabase (Auth, DB, Storage) and Stripe (Test Mode).
    *   [x] Establish environment variable management (`.env.mjs`).
    *   [x] Implement basic CI/CD with linting, type-checking, and build steps.
*   **Epics Touched:** Infrastructure for all future epics.

---

## **Phase B: Core Aggregation & Discovery**

### Status: ✅ Completed
The core value proposition for the end-user is fully implemented. Anonymous users can visit the application, see events on a map, and filter them. The scraper pipeline is functional.

*   **Goal:** Prove the core user value. A user must be able to visit the site and easily find local events.
*   **Epics Covered:**
    *   Epic 1: Automated Content Aggregation (✅ Done)
    *   Epic 2: Core User Experience (Free) (✅ Done)

---

## **Phase C: Monetization & Curation**

### Status: 🟡 Partially Implemented
The foundational UI and APIs for user authentication and payments are in place. However, the critical business logic for event claiming and admin curation is missing.

*   **What's Done:**
    *   User registration and login (Epic 3).
    *   Profile pages for authenticated users.
    *   UI for selecting B2B promotion tiers and an API to initiate Stripe checkout.
*   **What's Missing:**
    *   The entire event claiming and verification workflow (Epic 4).
    *   The admin dashboard for curating events and managing claims (Epic 7).
*   **Epics Covered:**
    *   Epic 3: User Onboarding & Authentication (✅ Done)
    *   Epic 4: Organizer Event Management & Verification (❌ Not Started)
    *   Epic 5: Organizer Monetization (B2B) (🟡 Partially Implemented)
    *   Epic 7: Admin Curation & Analytics (Curation part) (❌ Not Started)
*   **NOTE:** The remaining work for this phase has been merged into the comprehensive **Phase D** plan.

---

## **Phase D: Production Readiness & Launch**

### Status: 📝 In Progress / Next Up
This phase is the current focus of development. Its scope has been expanded to include all missing features from Phases C and E, in addition to the original production hardening tasks.

*   **Goal:** Harden the application and implement all remaining features for a complete and stable public launch.
*   **Updated Scope:** This phase now includes:
    1.  **Observability & Quality:** Integrating Sentry and a full testing suite (Jest/Cypress).
    2.  **Schema Overhaul:** Upgrading `prisma/schema.prisma` to match the full application specification.
    3.  **Event Curation (from Phase C):** Implementing the complete event claiming, email verification, and admin approval workflow.
    4.  **Premium Features (from Phase E):** Implementing the backend for push notifications and Stripe subscription management.
*   **Epics Touched:** Quality assurance across all epics, plus full implementation of Epics 4, 6, and the remainder of 5 and 7.
*   **Details:** `[See Full Consolidated Task List in docs/phases/phase-d-production-readiness.md](./phases/phase-d-production-readiness.md)`

---

## **Phase E: Post-Launch - Premium & Growth**

### Status: 🟡 Partially Implemented
The user-facing UI for subscribing to a "Pro" plan exists. However, the core features that define the Pro tier (push notifications) and the backend logic for managing subscriptions are missing.

*   **What's Done:**
    *   A subscription page (`/app/subscribe`) where users can select a Pro plan.
    *   An API endpoint that can receive a subscription request.
*   **What's Missing:**
    *   The core "Pro" feature: custom push notifications.
    *   Backend logic to update a user's `subscriptionTier` in the database.
    *   Integration with the Stripe Customer Portal for subscription management.
*   **Epics Covered:**
    *   Epic 6: Premium User Subscriptions (B2C) (🟡 Partially Implemented)
    *   Epic 7: Admin Curation & Analytics (Analytics part) (✅ Done - Revenue dashboard exists)
*   **NOTE:** The remaining work for this phase has been merged into the comprehensive **Phase D** plan. Any new features developed after the completion of Phase D will constitute a future "Phase E".