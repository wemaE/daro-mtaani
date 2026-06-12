# DarasaMtaani

DarasaMtaani (Street Classroom) is a mobile-first PWA connecting under-resourced primary school students in Nairobi's informal settlements (Mathare, Kibera, Mukuru, Kawangware) with vetted local volunteer tutors, routed through community resource hubs (Harambee Spatial Routing).

## Features

1. **Swahili-First Restructured Entry Flow**: Direct pathways for students, parents, tutors, and elders.
2. **Ubuntu Priority Score (UPS)**: Equitable allocation sorting based on time poverty and material deficit.
3. **Spatial Validation Agents**: Scout (academic match), Guardian (GIS hub capacity filters), and Hunter (elder approval gate).
4. **Offline Grid Support**: Local IndexedDB queue backup for 3G offline environments.

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` or configure Vercel settings with the values shown in [.env.example](.env.example):
* `VITE_SUPABASE_URL`: Your Supabase API endpoint.
* `VITE_SUPABASE_ANON_KEY`: Your Supabase anon client key.
* `N8N_SHARED_SECRET`: Secret header key for verifying incoming n8n calls.

### 3. Supabase Migrations
Apply the migrations in [supabase/migrations/00_schema.sql](supabase/migrations/00_schema.sql) using the Supabase dashboard SQL editor or Supabase CLI. This configures:
* Tables for households, students, tutors, sessions, badges, and elders.
* PostGIS geography types for hubs.
* Row-Level Security (RLS) policies scoped to the phone session.
* Automated 180-day data deletion policy.

### 4. Import n8n Workflows
Import the 5 workflows in `/n8n-workflows/` directory into your n8n workspace:
* **WF-01**: Recalculates UPS and triggers SMS via Africa's Talking.
* **WF-02**: Confirms tutor match and verifies elder PIN.
* **WF-03**: Routes resource requests to nearby available hubs.
* **WF-04**: Mints volunteer badges and pushes certifications to LinkedIn.
* **WF-05**: Monitors hub capacity flags to trigger queue re-routing.

### 5. Running local development
```bash
npm run dev
```
To check for production building completeness:
```bash
npm run build
```
