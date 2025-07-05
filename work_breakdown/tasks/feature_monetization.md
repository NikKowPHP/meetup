# Feature: Monetization Integration

## Promoted Listings
- [x] (STRIPE) Configure Stripe SDK in `lib/payments/stripe.ts`
- [x] (API) Create checkout session endpoint in `pages/api/checkout.ts`
- [x] (WEBHOOK) Implement Stripe webhook handler in `pages/api/webhooks/stripe.ts`
- [x] (UI) Build promotion tier selector in `components/Payments/PromotionTiers.tsx`

## Subscriptions
- [x] (DB) Create Subscription model in `prisma/schema.prisma`
- [ ] (CRON) Set up subscription renewal cron job in `lib/cron/subscriptions.ts`
- [ ] (API) Create subscription management endpoints in `pages/api/subscriptions.ts`

## Analytics
- [ ] (TRACKING) Implement revenue tracking in `lib/analytics/revenue.ts`
- [ ] (DASHBOARD) Create admin revenue dashboard in `app/admin/revenue/page.tsx`