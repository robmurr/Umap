# UMap

UMap is a real-time, location-based discovery platform designed to help people explore events and experiences happening around them. Instead of relying on fragmented social media posts or static map listings, UMap provides a live, spatial view of what is happening in a city at any given moment.

The initial focus is on dense urban areas with active student and young professional populations.

---

## Vision

Discovery should be spatial, social, and real.

UMap aims to make cities feel alive by combining live event visibility, real-time attendance signals, and simple community feedback directly on an interactive map.

---

## MVP Scope

The first version of UMap focuses on validating one core behavior:

Will users open a real-time map to discover nearby events and make decisions based on live activity?

The MVP includes:

* Interactive map displaying nearby events
* Event detail view
* User check-in functionality
* Real-time attendance count
* Simple emoji-based sentiment reactions
* Basic user authentication
* Event creation interface for early business onboarding

The MVP intentionally excludes advanced personalization, gamification systems, analytics dashboards, and AI recommendations.

---

## Tech Stack

### Mobile Application

* React Native (TypeScript)
* Mapbox SDK
* Axios for API communication
* React Navigation

### Backend

* Node.js
* Express
* TypeScript
* Socket.io for real-time updates

### Database

* PostgreSQL
* PostGIS extension for geospatial queries

### Infrastructure

* Railway or Render for backend hosting
* Managed PostgreSQL instance
* Environment-based configuration

---

## Repository Structure

This project uses a monorepo structure:

```
umap/
│
├── apps/
│   ├── mobile/        # React Native application
│   └── server/        # Backend API and real-time services
│
├── packages/
│   └── shared/        # Shared TypeScript types
│
├── .env.example
├── tsconfig.base.json
└── README.md
```

### Architecture Overview

* The mobile app communicates with the backend via REST APIs.
* Real-time updates (attendance and reactions) are delivered via WebSockets.
* The backend performs geospatial queries using PostGIS.
* Shared TypeScript types ensure consistency between frontend and backend.

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* PostgreSQL with PostGIS enabled
* npm or yarn

---

### 1. Clone the Repository

```
git clone https://github.com/robmurr/umap.git
cd umap
```

---

### 2. Configure Environment Variables

Create a `.env` file in `apps/server`:

```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/umap
```

---

### 3. Install Dependencies

From the root directory:

```
npm install
```

Then install dependencies inside each app:

```
cd apps/server
npm install

cd ../mobile
npm install
```

---

### 4. Start the Backend

```
cd apps/server
npm run dev
```

The health check endpoint should be available at:

```
http://localhost:4000/health
```

---

### 5. Start the Mobile App

```
cd apps/mobile
npx expo start
```

Make sure the mobile app API base URL matches your backend host.

---

## Database Notes

The `events` table includes a PostGIS geometry column for location storage. Geospatial queries are performed using `ST_DWithin` to retrieve events within a specified radius.

Ensure PostGIS is enabled:

```
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Current Development Phase

The project is currently in Phase 0 and Phase 1:

* Backend structure and database schema
* Core event model
* Map rendering integration
* Basic event retrieval by location

Real-time attendance and reaction systems will follow in subsequent phases.

---

## Founders

Rob Murray
Software Lead
Computer Science, University at Buffalo

Sam Seebode
Business Lead

---

## Tentative Roadmap (High-Level)

Phase 0
Architecture setup, database design, repository structure

Phase 1
Map rendering and event display

Phase 2
Real-time attendance and reactions

Phase 3
Filtering, validation, and beta readiness

Phase 4
Closed beta launch in a targeted urban neighborhood

---

## Contributing

This project is currently in private development. Contribution guidelines will be added as the codebase stabilizes.

---

## License

All rights reserved. Unauthorized use or distribution is prohibited.

