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
Create a `.env` or configure Vercel settings with the values shown in [.env.example](.env.example):
* `SUPABASE_URL`: Your Supabase API endpoint.
* `SUPABASE_ANON_KEY`: Your Supabase anon client key.
* `SUPABASE_SERVICE_ROLE_KEY`: Service role key for bypass RLS operations in backend / workflows.
* `N8N_SHARED_SECRET`: Secret header key for verifying incoming n8n calls. Ensure this matches consistently across Vercel environment variables and the n8n execution environment.

### 3. Supabase Database Schema Migrations
To push migrations to your live Supabase database instance:
```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```
This migration configuration creates:
* Tables for households, students, tutors, sessions, badges, elders, landmarks, bias audit logs, and scout invocations.
* PostGIS geography indices for hubs and landmarks.
* Row-Level Security (RLS) policies scoped to the phone session.
* Automated 180-day data deletion policy via `pg_cron`.
* Automatic 15-minute hub capacity recomputation.
* Database trigger `enforce_elder_pin` guarding session confirmations.

### 4. Register Supabase Database Webhooks
Register webhooks in the Supabase Dashboard (`Database` -> `Webhooks`) pointing to the corresponding n8n workflow webhook triggers:
* **households (Insert/Update)** -> Point to `WF-01-ups-recalc` webhook.
* **students (Insert)** -> Point to `WF-02-tutor-match` webhook.
* **tutors (Update, where verified_by_elder changes false -> true)** -> Point to `WF-06-tutor-verification` webhook.
* **sessions (Update, where status changes to completed)** -> Point to `WF-04-badge-mint` webhook.

### 5. Import n8n Workflows
Import the 6 workflows in `/n8n-workflows/` directory into your n8n workspace:
* **WF-01-ups-recalc.json**: Recalculates UPS and triggers queue re-sorting.
* **WF-02-tutor-match.json**: Confirms tutor match and verifies elder PIN.
* **WF-03-hub-router.json**: Routes resource requests to nearby available hubs.
* **WF-04-badge-mint.json**: Mints volunteer badges and pushes certifications to LinkedIn.
* **WF-05-hub-monitor.json**: Monitors hub capacity flags to trigger queue re-routing.
* **WF-06-tutor-verification.json**: Notifies tutors upon Elder confirmation and logs to Bias Audit.

Configure credentials in n8n for:
- **Supabase**: URL and Service Role API Key.
- **Africa's Talking**: Username, API Key, and Sender ID.
- **LinkedIn**: LinkedIn UGC Post App Credentials.
- **Google Calendar**: Google OAuth credentials.

### 6. Running local development
```bash
npm run dev
```
To check for production building completeness:
```bash
npm run build
```
