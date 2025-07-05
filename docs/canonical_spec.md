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

## 5. Compliance Requirements
- GDPR data processing agreement
- CCPA opt-out mechanisms
- Weekly database backups
- SSL enforced across all endpoints