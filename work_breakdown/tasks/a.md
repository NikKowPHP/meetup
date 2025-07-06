Of course. Here is a prioritized to-do list to resolve all discrepancies identified in the SpecCheck Audit Report.

---

# Audit Resolution To-Do List

This plan outlines the necessary code modifications to address all findings from the audit report. The tasks are prioritized from critical security and logic fixes to code cleanup.

### P0: Critical Payment Logic & Security Fixes

*   [x] **[FIX]**: Implement correct security validation for promotion checkouts and remove incorrect validation from subscriptions.
    *   **File to Modify**: `pages/api/checkout.ts`
    *   **Action**: Before creating the Stripe Checkout session, add logic to retrieve the `priceId` from Stripe's API. Validate that the `stripePrice.product` ID matches the `env.STRIPE_PROMOTION_PRODUCT_ID` from your environment variables. If it does not match, return a `400 Bad Request` error.
    *   **Reason**: As per the audit, this endpoint currently lacks validation, allowing any Stripe Price ID to be processed, which is a security and business logic flaw.

    *   **File to Modify**: `pages/api/subscriptions.ts`
    *   **Action**: In the `handlePost` function, **remove** the block of code that validates the `priceId` against `env.STRIPE_PROMOTION_PRODUCT_ID`.
    *   **Reason**: The audit correctly identified that this environment variable is for one-time promotions and was being used incorrectly to validate recurring subscriptions.

### P1: Code Cleanup & Dead Code Removal

*   [x] **[DELETE]**: Remove the orphaned and unused data request API endpoint.
    *   **File to Delete**: `pages/api/data-requests.ts`
    *   **Action**: Delete the entire file.
    *   **Reason**: The audit found that this API endpoint is not connected to any user interface component and its intended purpose (data privacy controls) is handled by a different, functional endpoint (`/api/user/delete`). This constitutes dead code and should be removed.