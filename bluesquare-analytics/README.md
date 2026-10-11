# Blue Square Analytics

Self-hosted, cookieless website analytics for any number of websites.
Tracks page views, visible **seconds on each page**, **clicks** on links and buttons, **countries**, referrers, devices and browsers, with daily/hourly activity reports and CSV export.

## How it works
- `public/t.js`: the 3 KB tracker that each website loads. No cookies and no browser storage; it follows Next.js and other single-page-app page changes.
- `POST /api/collect`: receives events. It only accepts events from the website's registered domain (and its subdomains), drops bots, looks up the country from the IP with the free DB-IP Lite database and **never stores the IP**.
- Visitors are counted with a hash of a random daily salt, the site, the IP and the browser. Salts are deleted after a day, so visitors can't be traced or followed across days.
- Dashboard: password login, list of websites, per-site statistics, CSV export (`activity`, `pages`, `countries`, `clicks`).

## Run locally
```bash
npm install
npm run dev            # http://localhost:4400, password "admin" in development
```
Without `DATABASE_URL` the app uses an embedded Postgres (PGlite) stored in `./data`. Run only **one** server process at a time against that folder.

## Add a website
1. Sign in, then under **Add a website** enter a name and its domain (e.g. `bluesquare.ai`).
2. Copy the snippet into the `<head>` of every page:
   ```html
   <script defer src="https://ANALYTICS_HOST/t.js" data-site="SITE_ID"></script>
   ```
3. Optional: add `data-track="Book demo"` to any element to give its clicks a clear name.

For the Blue Square AI website (`bluesquare-next`), set `NEXT_PUBLIC_ANALYTICS_URL` and `NEXT_PUBLIC_ANALYTICS_SITE_ID` instead; it loads the tracker after cookie consent.

## Deploy to Google Cloud (Cloud Run + Cloud SQL)
Replace `PROJECT`, `REGION` (e.g. `europe-west1`) and the passwords.

```bash
gcloud config set project PROJECT
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# 1. Database (smallest shared-core instance)
gcloud sql instances create bs-analytics --database-version=POSTGRES_16 --tier=db-f1-micro --region=REGION
gcloud sql databases create analytics --instance=bs-analytics
gcloud sql users create analytics --instance=bs-analytics --password='DB_PASSWORD'

# 2. Secrets
printf 'postgresql://analytics:DB_PASSWORD@localhost/analytics?host=/cloudsql/PROJECT:REGION:bs-analytics' | gcloud secrets create bsa-database-url --data-file=-
printf 'YOUR_DASHBOARD_PASSWORD' | gcloud secrets create bsa-admin-password --data-file=-
openssl rand -hex 32 | tr -d '\n' | gcloud secrets create bsa-session-secret --data-file=-

# 3. Build and deploy (from this folder; uses the Dockerfile)
gcloud run deploy bs-analytics --source . --region=REGION --allow-unauthenticated \
  --add-cloudsql-instances=PROJECT:REGION:bs-analytics \
  --set-secrets=DATABASE_URL=bsa-database-url:latest,ADMIN_PASSWORD=bsa-admin-password:latest,SESSION_SECRET=bsa-session-secret:latest \
  --set-env-vars=REPORT_TIMEZONE=Europe/Tirane \
  --min-instances=0 --max-instances=3 --memory=512Mi
```
Grant the Cloud Run service account the **Cloud SQL Client** and **Secret Manager Secret Accessor** roles if the deploy reports a permission error.
Optionally map a domain such as `analytics.bluesquare.ai` (Cloud Run → Manage custom domains) and set `PUBLIC_URL` to it.

The tables are created automatically on first start.

**Cost:** Cloud Run fits in the free tier at this traffic level; the smallest Cloud SQL instance costs roughly €8–10 per month. A free alternative is a hosted Postgres such as Neon or Supabase: put its connection string in `bsa-database-url` and drop `--add-cloudsql-instances`.

## Environment variables
| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Empty means the embedded local database. |
| `ADMIN_PASSWORD` | Dashboard password (required in production). |
| `SESSION_SECRET` | 32+ random characters used to sign the login cookie (required in production). |
| `REPORT_TIMEZONE` | Time zone for daily/hourly reports. Default `Europe/Tirane`. |
| `PUBLIC_URL` | Public address used in the tracking snippet. Default: the request's host. |

## Licences
IP geolocation by [DB-IP](https://db-ip.com) (CC BY 4.0; the attribution is shown in the dashboard footer).
