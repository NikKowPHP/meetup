# EventFlow Canonical Specification

## 1. Overview
**Project Title:** EventFlow - Unified City Event Platform  
**Type:** Full-stack Progressive Web Application (PWA)  
**Primary Objective:** Centralize event discovery through automated aggregation from multiple sources into a unified map-based interface

## 2. Core Functionality
### 2.1 Event Aggregation
- Source integration: Eventbrite, Meetup.com, Facebook Events, local blogs, community forums
- Data points collected per event:
  - Title
  - Date/time (start + optional end)
  - Location (physical address + GPS coordinates)
  - Description (plain text)
  - Cover image URL
  - Source URL
- Normalization pipeline ensures consistent data format

### 2.2 Core Features
1. **Map-Based Discovery**
   - Interactive leaflet.js map
   - Real-time location detection
   - Cluster markers for dense areas
   - Clickable pins with event preview

2. **Filter System**
   - Primary filters:
     - Category (Music, Tech, Art, Food, etc.)
     - Date range (calendar picker)
     - Price (Free/Paid)
     - Keyword search
   - Filter combination logic: AND between categories, OR within sub-filters

3. **User Engagement**
   - "Join" button workflow:
     ```typescript
     interface Engagement {
       userId: string;
       eventId: string;
       status: 'interested' | 'attending';
       createdAt: Date;
     }
     ```
   - Calendar integration:
     - Personal ICS feed
     - WebCal subscription support

4. **Real-time Notifications**
   - Notification types:
     - Event reminders
     - New events matching interests
     - Engagement confirmations
   - Components:
     - `useEngagementNotifications` hook manages state
     - `Badge` component shows unread count
     - Toast messages for immediate feedback
   - Implementation:
     ```typescript
     // Example notification payload
     interface Notification {
       id: string;
       userId: string;
       message: string;
       type: 'reminder' | 'new_event' | 'confirmation';
       read: boolean;
       createdAt: Date;
     }
     ```

4. **User Authentication**
   - Supabase Auth implementation:
     - Email/password
     - Google OAuth
     - Session management via JWT
   - Profile management:
     - Saved preferences
     - Event history

## 3. Technical Specifications
### 3.1 Architecture
**Frontend:**
- Next.js 14 App Router
- React 19 Server Components
- Zustand for client state
- Tailwind CSS with CSS Modules

**Backend:**
- Next.js API Routes
- Prisma ORM with PostgreSQL
- Redis caching layer (event data)

**Performance Optimizations:**
1. **Largest Contentful Paint (LCP) Optimization**
   - `LcpOptimizer` component prioritizes critical resources
   - Preloads key assets
   - Implements lazy loading for non-critical elements

2. **Map Tile Caching**
   - IndexedDB-based caching via `lib/map/caching.ts`
   - Offline-first strategy for map tiles
   - Automatic cache invalidation after 24h

3. **Memoization**
   - Heavy computations memoized via `lib/optimization/memo.ts`
   - React component memoization
   - Selector-level caching for Zustand stores

**DevOps:**
- Vercel hosting (frontend)
- Supabase dedicated instance
- GitHub Actions CI/CD

### 3.2 PWA Requirements
1. **Web Manifest**
   ```json
   {
     "name": "EventFlow",
     "short_name": "EventFlow",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#2563eb",
     "icons": [...]
   }
   ```

2. **Service Worker**
   - Precaching strategy for core app shell
   - Network-first for API calls
   - Background sync for calendar updates

## 4. Monetization Implementation
### 4.1 Promoted Listings
- Stripe Checkout integration
- Promotion tiers:
  - Homepage feature (24h): $49
  - Category boost (7d): $99
  - City-wide map highlight (3d): $199

### 4.2 Subscription Model
**EventFlow Pro Features:**
- Ad-free experience
- Advanced notification triggers
- Cross-platform calendar sync
- Curated event lists

**Stripe Subscription Setup:**
- Monthly ($9.99) and annual ($99) plans
- Webhook-driven entitlement management

### 4.3 Admin Revenue Dashboard
**Purpose:** Provides administrators with visual analytics on revenue streams.

**Key Features:**
1. **Time-based Views**
   - Daily, weekly, and monthly revenue breakdowns
   - Comparative charts showing payment vs subscription revenue
2. **Data Sources**
   - Stripe payment processing (one-time payments)
   - Recurring subscriptions
   - Promoted listings revenue
3. **Visualization Components**
   - Interactive bar charts showing revenue amounts
   - Transaction volume indicators
   - Detailed tabular breakdown

**Access Control:**
- Restricted to users with Admin role
- Protected by `requireAdmin()` route guard

**Technical Implementation:**
- Data aggregation via Prisma (lib/analytics/revenue.ts)
- Chart visualization using Chart.js (app/admin/revenue/RevenueChart.tsx)
- Real-time updates through Stripe webhooks

## 5. Compliance Requirements
- GDPR data processing agreement
- CCPA opt-out mechanisms
- Weekly database backups
- SSL enforced across all endpoints

## 5.1 User Roles & Permissions

## 6. Operations and Monitoring
**Centralized Monitoring System**

### 6.1 Logging Infrastructure
- **Winston-based logger** with configurable levels
- **Error tracking** with stack traces
- **Database persistence** for critical errors
- **Contextual logging** for debugging

### 6.2 Alerting System
- **Multi-channel alerts** (email/slack)
- **Severity levels**: low, medium, high, critical
- **Rate limiting** to prevent alert fatigue
- **Database audit trail** of all alerts
- **Singleton pattern** ensures single alert source

### 6.3 Security Audits
- **Weekly automated checks**
  - Admin password strength verification
  - System dependency audits (future)
- **Scheduled execution** (Sundays at 2 AM)
- **Results logging** to monitoring system

**Technical Implementation:**
- Primary modules in `lib/monitoring/`
- Uses Supabase for alert/error storage
- Integrated with all core systems
- Extensible for future monitoring needs
**Role-Based Access Control (RBAC) System**

### Defined Roles
1. **Admin**
   - Full system access
   - Can manage all content and settings
2. **Moderator**
   - Can create/update events
   - Can view and update user profiles
3. **User**
   - Can view events
   - Can manage own profile
4. **Guest**
   - Can view public events

### Permission Matrix
| Resource  | Admin | Moderator | User | Guest |
|-----------|-------|-----------|------|-------|
| Events    | CRUD  | CRU       | R    | R     |
| Profiles  | RUD   | RU        | RU   | -     |
| Settings  | RU    | -         | -    | -     |

*Legend: C=Create, R=Read, U=Update, D=Delete*

### Technical Implementation
- Defined in `lib/auth/rbac.ts`
- Uses `hasPermission(role, resource, action)` for runtime checks
- Admin-restricted routes use `requireAdmin()` guard