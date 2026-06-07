# Multi-Tenant Organization Administrator Dashboard

An enterprise-ready, multi-tenant B2B administration dashboard built with React, TypeScript, Tailwind CSS, and Supabase. This application securely isolates tenant resources, leverages relational PostgreSQL database constraints, enforces strict Row Level Security (RLS) filters, and offloads sensitive logic to a serverless Deno Edge Function.

## Live Production & Preview URLs

* **Live Deployment - main:** [https://admin-dashboard-51zmvidxz-bilal-shaikh-s-projects1.vercel.app]
* **Live Deployment - development:** [https://admin-dashboard-i0xjm6wwf-bilal-shaikh-s-projects1.vercel.app]

## Test Credentials

* **Email:** test@yahoo.com
* **Password:** abcd1234

## Architecture & Technical Decisions

### 1. Multi-Branch Git Pipeline Strategy

To ensure zero friction during feature expansion and maintain maximum production stability, this repository follows a rigorous, production-grade branching lifecycle:

* `main`: Reflects the absolute stable, verified production-ready state.
* `development`: Serves as the primary integration and staging branch where all feature aggregates are compiled.
* `feature/*`: Granular, isolated branches dedicated to specific tracking milestones (`auth-setup`, `tenant-onboarding`, `member-invitations`), preventing code overlaps and enabling concise pull request peer reviews.

### 2. Multi-Tenant Database Architecture & Security

* **Data Isolation (RLS):** Row Level Security policies are explicitly enabled on all relational tables. Tenant data is filtered at the database level by binding transactions directly to authenticated sessions (`auth.uid()`). Admins can only read or write records within organizations they explicitly constructed.
* **Custom Extensibility:** Implements a polymorphic metadata system (`type_specific_field`) that dynamically captures unique context parameters based on tenant classifications (`Enterprise`, `SMB`, etc.).
* **Idempotency & Guardrails:** Employs a PostgreSQL `UNIQUE` index constraint across (`organization_id`, `email`) in the roster mappings. This forces transaction atomicity and guarantees duplicate invitations are cleanly caught and rejected.

### 3. Serverless Edge Computing Strategy

* **Privileged Access Control:** Member invitations are intentionally decoupled from standard client-side writes. Instead, they hit a server-side **Supabase Deno Edge Function**.
* This function decrypts user JWT claims, performs an authoritative organization ownership audit, and runs the data injection using a high-privilege administrative service role. This layout isolates server-side state logic and provides a clear hook for transactional email delivery systems (e.g., Resend, Postmark).

### 4. Client State Optimizations

* **TanStack React Query:** Leverages background revalidation and immediate cache-invalidation rings. When an invitation completes, the roster cache is instantly purged, forcing an instantaneous, zero-reload UI paint.
* **Form Submissions:** Powered by `React Hook Form` and `Zod` validation schemas to enforce clean UX styling boundaries and unified authentication inputs before hitting the network layer.

---

## Local Installation & Setup

### Prerequisites

* Node.js (v18 or higher)
* NPM or PNPM
* Supabase CLI (for modifying Edge Workers)

### Step-by-Step Guide

1. **Clone the Repository:**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

```


2. **Install Project Dependencies:**
```bash
npm install

```


3. **Configure Environment Parameters:**
Duplicate the provided configuration template:
```bash
cp .env.example .env

```


Open the newly created `.env` file and populate it with your active Supabase Project parameters (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
4. **Initialize Database Schema:**
Copy the contents of your `supabase_migration.sql` file, open your **Supabase Dashboard > SQL Editor**, paste the script, and press **Run** to generate the relational layout, indexes, and RLS policies.
5. **Fire Up the Local Development Server:**
```bash
npm run dev

```


Open `http://localhost:5173` in your browser to view the application.

---

## 📡 Edge Function Deployment Commands

If you make changes to the serverless invitation logic, redeploy using the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase functions deploy invite-member

```
