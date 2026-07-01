# Finance CRM

A finance CRM for budget planning, ATO tax return PDF generation, DocuSeal e-signing, document storage (Supabase), and optional per-user Google Drive backup.

## Prerequisites

| Requirement | Version |
|-------------|---------|
| [Node.js](https://nodejs.org/) | **20.19+**, **22.12+**, or **24+** (recommended: **22 LTS** — matches Vercel production) |
| npm | **10+** (bundled with Node 20+) |
| Git | Any recent version |

Check your versions:

```bash
node -v   # e.g. v22.x.x
npm -v    # e.g. 10.x.x
```

Optional — pin Node 22 locally with [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 22
nvm use 22
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/) |
| Build | [Vite 8](https://vite.dev/) + [Nitro](https://nitro.build/) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Database & auth | [Supabase](https://supabase.com/) (Postgres, Auth, Storage) |
| E-signing | [DocuSeal](https://www.docuseal.com/) |
| Google Drive | OAuth 2.0 per user (`googleapis`) |
| Testing | [Vitest](https://vitest.dev/) |
| Production host | Vercel (`nodejs22.x` runtime) |

## Quick start

```bash
git clone https://github.com/shreyvijayvargiya/finance-crm.git
cd finance-crm
npm install
cp .env.example .env
# Fill in .env (see setup guide below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy the example file and fill in every required value:

```bash
cp .env.example .env
```

| Variable | Required | Used for |
|----------|----------|----------|
| `VITE_SUPABASE_URL` | Yes | Browser Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser Supabase client |
| `SUPABASE_URL` | Yes | Server-side Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server uploads, Drive token storage, admin DB access |
| `GOOGLE_CLIENT_ID` | Yes* | Google sign-in (via Supabase) + Connect Google Drive |
| `GOOGLE_CLIENT_SECRET` | Yes* | Same as above |
| `APP_URL` | Production | Google Drive OAuth redirect base URL |
| `DOCUSEAL_API_KEY` | Yes | PDF e-signing embed + signed PDF download |
| `DOCUSEAL_API_URL` | No | Defaults to `https://api.docuseal.com` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | No | Legacy service-account Drive upload (optional) |
| `GOOGLE_DRIVE_FOLDER_ID` | No | Legacy service-account Drive folder (optional) |

\* `CLIENT_ID` / `CLIENT_SECRET` are accepted as aliases for `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

**Never commit `.env` or service-account JSON files to git.**

---

## 1. Supabase setup

### 1.1 Create a project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project** and wait for provisioning.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only — keep secret)

### 1.2 Run database schema

1. Open **SQL Editor** in Supabase.
2. Run the full script from [`supabase/schema.sql`](supabase/schema.sql).
3. If upgrading an existing project, also run migrations in [`supabase/migrations/`](supabase/migrations/) (especially `user_google_drive_connections` for Google Drive).

This creates:

- `documents` table + RLS policies
- `profiles` table + auto-create trigger on sign-up
- `user_google_drive_connections` table (per-user Drive OAuth tokens)
- `documents` storage bucket

### 1.3 Enable authentication providers

Go to **Authentication → Providers**.

#### Email provider

1. Open **Email**.
2. Enable **Email** sign-in.
3. Configure as needed:
   - **Confirm email** — disable for local dev if you want instant sign-up without inbox verification.
   - **Secure email change** — optional.

#### Google provider

1. Open **Google**.
2. Enable **Google** sign-in.
3. Paste the **Client ID** and **Client Secret** from Google Cloud (see [Section 2](#2-google-cloud-setup) below).
4. Save.

> Use the **same** OAuth Web client for Supabase Google login and for Connect Google Drive in this app.

### 1.4 URL configuration

Go to **Authentication → URL Configuration**.

| Setting | Local development | Production example |
|---------|-------------------|--------------------|
| **Site URL** | `http://localhost:3000` | `https://finance-crm.buildsaas.dev` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://finance-crm.buildsaas.dev/auth/callback` |

Add **both** local and production URLs to **Redirect URLs** if you deploy to a live domain.

After Google sign-in, Supabase redirects users to `/auth/callback` in this app.

### 1.5 Video walkthrough — Email & Google sign-in

For a step-by-step video on enabling **Email** and **Google** login in Supabase (providers + URL configuration), watch:

**[Supabase Google & Email Authentication Setup (YouTube)](https://www.youtube.com/watch?v=sB6bPOvvlgw)**

Follow the video alongside sections **1.3** and **1.4** above, then continue with [Google Cloud setup](#2-google-cloud-setup) to create the OAuth Client ID and Client Secret used in the Google provider.

---

## 2. Google Cloud setup

All Google credentials are created in [Google Cloud Console](https://console.cloud.google.com/).

### 2.1 Create or select a project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Use the project selector (top bar) → **New Project** (e.g. `Finance CRM`).
3. Note the **project number** — it appears in OAuth client IDs.

### 2.2 Enable Google Drive API

1. Go to [Google Drive API library](https://console.cloud.google.com/apis/library/drive.googleapis.com).
2. Select your project.
3. Click **Enable**.

### 2.3 Configure OAuth consent screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
2. Choose **External** (or **Internal** if you have Google Workspace).
3. Fill in **App name**, **User support email**, and **Developer contact**.
4. Under **Scopes**, add:
   - `.../auth/drive.file` (Google Drive — per-file access)
   - `.../auth/userinfo.email` (see connected Google account email)
   - For Supabase login, Google also adds basic profile scopes automatically.
5. Under **Test users** (while app is in Testing), add Gmail accounts that will sign in.
6. Save.

### 2.4 Create OAuth Web client (Client ID + Secret)

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Name: e.g. `Finance CRM Web`.
5. **Authorized redirect URIs** — add all of these:

   **Supabase Google sign-in** (required for “Continue with Google”):

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   Replace `<your-project-ref>` with your Supabase project ref (from `VITE_SUPABASE_URL`).

   **Connect Google Drive** (required for Settings → Connect Google Drive):

   ```
   http://localhost:3000/auth/drive-callback
   https://your-production-domain.com/auth/drive-callback
   ```

6. Click **Create**.
7. Copy **Client ID** → `GOOGLE_CLIENT_ID` in `.env`.
8. Copy **Client secret** → `GOOGLE_CLIENT_SECRET` in `.env`.
9. Paste the **same** Client ID and Client secret into **Supabase → Authentication → Providers → Google**.

### 2.5 Connect Google Drive (recommended — per user)

This app uses **per-user OAuth**, not a service account, for Drive uploads.

1. User signs in to the app.
2. Goes to **Settings → Connect Google Drive**.
3. Approves Google consent.
4. Signed PDFs are saved to a **Finance CRM** folder in **that user's** Google Drive.

**Requirements:**

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Redirect URI `http://localhost:3000/auth/drive-callback` (and production URL) in Google Cloud
- `APP_URL` set to your public app URL in production (e.g. `https://finance-crm.buildsaas.dev`)
- `user_google_drive_connections` table created (from `schema.sql`)

No service account or shared folder ID is needed for this flow.

### 2.6 Optional — service account + folder ID (legacy)

> **Note:** Google no longer allows service accounts to upload to personal My Drive (no storage quota). This path only works with **Google Workspace Shared Drives** or is kept for older deployments. **Use Section 2.5 instead** for personal Gmail.

If you still need service-account upload:

#### Create a service account

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create credentials → Service account**.
3. Name it (e.g. `finance-crm-drive`).
4. Open the service account → **Keys → Add key → Create new key → JSON**.
5. Save the JSON file locally (do not commit).
6. Either:
   - Put the JSON on one line in `.env` as `GOOGLE_SERVICE_ACCOUNT_JSON={...}`, or
   - Save as `google-service-account.json` (gitignored) and set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account.json`

#### Create a Drive folder ID (Workspace Shared Drive only)

1. In Google Drive, create or open a **Shared drive** folder (Workspace required).
2. Share the folder with the service account email (`...@...iam.gserviceaccount.com`) as **Content manager**.
3. Open the folder in the browser. The URL looks like:

   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

4. Copy `FOLDER_ID_HERE` → `GOOGLE_DRIVE_FOLDER_ID` in `.env`.

---

## 3. DocuSeal setup

DocuSeal powers the embedded e-signature flow on the Budget Planner sign page.

### 3.1 Create an account

1. Sign up at [DocuSeal](https://www.docuseal.com/).
2. Or self-host — see [DocuSeal docs](https://www.docuseal.com/docs).

### 3.2 Get an API key

1. Log in to the DocuSeal dashboard.
2. Open **API** / **Settings → API** (exact label may vary by plan).
3. Create or copy your **API key**.
4. Add to `.env`:

   ```env
   DOCUSEAL_API_KEY=your-api-key-here
   ```

### 3.3 Optional — custom API URL

If you self-host DocuSeal:

```env
DOCUSEAL_API_URL=https://your-docuseal-instance.com
```

### 3.4 How it is used in this app

1. User completes the budget grid and taxpayer form.
2. App generates an ATO PDF and sends it to DocuSeal via API.
3. User signs in the embedded DocuSeal form (`/grid/sign/:submissionId`).
4. On completion, the signed PDF is saved to Supabase Storage and optionally to the user's Google Drive.

---

## 4. Production deployment checklist

| Step | Action |
|------|--------|
| Node runtime | **Node.js 22.x** on Vercel (configured in `vite.config.ts` → `nodejs22.x`) |
| Env vars | Set all variables in your host (Vercel, etc.) |
| `APP_URL` | `https://your-production-domain.com` |
| Supabase Site URL | Match production domain |
| Supabase Redirect URLs | `https://your-production-domain.com/auth/callback` |
| Google redirect URIs | Add `https://your-production-domain.com/auth/drive-callback` |
| Supabase Google provider | Same Client ID / Secret as production `.env` |
| Database | `schema.sql` + migrations applied |
| OAuth consent | Publish app or add test users in Google Cloud |

Build and run locally like production:

```bash
npm run build
npm run start    # serves .output/server (default Nitro output)
```

---

## 5. Development commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production server after build
npm run preview      # Preview production build (Vite preview)
npm test             # Run Vitest test suite (33 tests)
npm run lint         # ESLint
npm run format       # Prettier + ESLint fix
npm run check        # Prettier check only
npm run generate-routes  # Regenerate TanStack Router route tree
```

**Default ports:** dev server `3000` (set in `package.json` → `npm run dev`).

---

## 6. Project structure (high level)

| Path | Purpose |
|------|---------|
| `src/routes/` | Pages (budget grid, documents, settings, auth callbacks) |
| `src/lib/server/` | Server functions (signing, documents, Drive connect) |
| `src/lib/google-drive/` | Per-user Drive OAuth + upload |
| `src/lib/docuseal/` | DocuSeal API client |
| `supabase/schema.sql` | Database + storage setup |
| `.env.example` | Environment variable template |

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Add exact callback URL to Google Cloud OAuth client |
| `invalid_client` on Drive connect | Client ID and secret must match; create a fresh secret in Google Cloud |
| `profiles` 404 in Supabase logs | Run `schema.sql` profiles section |
| `user_google_drive_connections` 404 | Run migration `20250628_user_google_drive_connections.sql` |
| Drive not uploading | User must connect Drive in **Settings**; service account path is optional/legacy |
| DocuSeal errors | Verify `DOCUSEAL_API_KEY` and API plan limits |
| Google login fails | Check Supabase redirect URLs and Google provider credentials |

---

## Learn more

- [TanStack Start](https://tanstack.com/start)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [DocuSeal API](https://www.docuseal.com/docs)
