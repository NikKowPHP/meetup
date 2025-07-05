# Feature: Authentication & Profile Management

## Auth Implementation
- [x] (SUPABASE) Configure Supabase Auth in `lib/auth/supabaseClient.ts`
- [x] (API) Create auth API routes in `pages/api/auth/[...nextauth].ts`
- [x] (HOOK) Implement useSession hook in `hooks/useSession.ts`

## Profile Management
- [x] (UI) Build profile page in `app/profile/page.tsx`
- [x] (API) Create profile API endpoint in `pages/api/profile.ts`
- [x] (STATE) Manage profile state in `store/profile.ts`

## Security
- [x] (MIDDLEWARE) Implement auth middleware in `middleware.ts`
- [x] (RBAC) Create role-based access control in `lib/auth/rbac.ts`
- [x] (VALIDATION) Add input validation for profile updates in `lib/validation/profileSchema.ts`