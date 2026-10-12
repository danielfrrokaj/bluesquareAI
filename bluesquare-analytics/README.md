# Blue Square Dashboard

Company dashboard with departments: **Finance**, **Analytics**, Marketing, Projects & Tasks (coming) and **Users**.

## Finance
- **Transactions**: income and expenses with date, virtual account, category, user and client/supplier. Filters, paging and CSV export.
- **Reports & forecast**: per virtual account and category (compared with the previous period), per user, month by month, and a forecast
  for this month and the next three (damped-trend smoothing over the last 12 complete months; expense budgets per category).
- **Fiscal invoices**: fiscalized invoices synced from BlueBill, with IIC/FIC and the tax authority's verification link. Each one is booked
  as income under the income category that matches its BlueBill category. Sync runs every 15 minutes while Finance is in use, on demand,
  or from a scheduler (`POST /api/finance/bluebill/sync` with `Authorization: Bearer $CRON_SECRET`).
- **Settings** (admins only): virtual accounts, categories with optional monthly budgets, currency rates, and the BlueBill connection (paste the token, activate).
- **Currency**: everything is reported in EUR. Transactions and BlueBill invoices in another currency (e.g. ALL) are converted with the
  rate set in Settings → Currency rates and keep their original amount and the rate used. A new rate applies to new entries; existing
  ones are recalculated only when you tick the option.

## Users and roles
Sign-in is per user (email + password). The first sign-in with `ADMIN_EMAIL` (default `admin`) and `ADMIN_PASSWORD` creates the first admin.
Admins manage settings and users; members use the dashboards and record their own transactions.

## Google Cloud expense forecast

Finance → Reports includes a Google-branded Cloud spending section. It reads the configured BigQuery billing exports on the server,
shows net usage cost after credits and costs per project for the selected date range, and keeps all amounts in **USD**, separate from
the EUR ledger, expense totals, and transaction forecast. No billing rows are inserted as transactions.

Configure `GOOGLE_CLOUD_BILLING_SOURCES` as a JSON array in `.env.local` or the deployment environment:

```dotenv
GOOGLE_CLOUD_BILLING_SOURCES='[{"name":"Firebase Payment","projectId":"multisys-502623","datasetId":"all_billing_data","billingAccountId":"01D201-C5F2F8-BFE144"},{"name":"My Billing Account","projectId":"extended-pagoda-477512-g1","datasetId":"all_billing_data","billingAccountId":"019B71-684978-5B75EC"}]'
GOOGLE_CLOUD_BILLING_MAX_BYTES=1073741824
```

- Authentication uses Application Default Credentials (`gcloud auth application-default login` locally) or the attached Cloud Run service account.
  The runtime identity needs **BigQuery Job User** on each source project and **BigQuery Data Viewer** on each billing dataset.
  Do not place access tokens or service-account keys in browser code or commit them.
- Sources are EU datasets. The standard export table is discovered automatically; detailed export is a fallback when standard is absent.
  When both exist, only standard is queried so charges are counted once. Each query also filters the billing account ID.
- Cost and repeated credits are aggregated separately before being combined. Refunds and credits retain their signs; a currency other than
  USD is shown as an unsupported source rather than silently mixed in. Unallocated account costs remain visible in the project table.
- Reads are cached per process for 15 minutes, capped at 1 GiB scanned per account by default, and waiting/error states retry after one minute
  when Reports is opened or refreshed. Missing tables, permission errors, and incomplete accounts are never treated as zero spend.
- The forecast uses the last seven complete calendar days of net usage and excludes the latest observed day. It waits for continuous
  month-to-date data and recent usage from **every** account. Current-month estimates add the remaining days at that pace; the next three
  months use the same daily pace and each month's day count. Future estimates are floored at zero, while actual negative credits stay intact.
  Forecasts are provisional: service-level delays, promotional credits, and changing usage can change the result. Historical filters affect
  actual/project costs; the forecast always starts in the current month.
- Billing is not real-time. The first export/backfill can take up to five days. Per-account usage and export timestamps appear beside the forecast.

Source definitions: [Google billing export schema](https://docs.cloud.google.com/billing/docs/how-to/export-data-bigquery-tables/standard-usage)
and [export availability](https://docs.cloud.google.com/billing/docs/how-to/export-data-bigquery-setup).
The local Google mark is from `https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png`.

Run the billing calculation checks with `npm run test:cloud-billing`.

## Website analytics

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
| `ADMIN_EMAIL` | Email (login name) of the first admin. Default `admin`. |
| `ADMIN_PASSWORD` | Password of the first admin, used only while no users exist (required in production). |
| `SESSION_SECRET` | 32+ random characters used to sign the login cookie (required in production). |
| `REPORT_TIMEZONE` | Time zone for daily/hourly reports. Default `Europe/Tirane`. |
| `BLUEBILL_API_URL` | BlueBill API base. Default: the production BlueBill API. Locally `http://localhost:3001/api/v1`. |
| `CRON_SECRET` | Enables the scheduler sync endpoint. |
| `PUBLIC_URL` | Public address used in the tracking snippet. Default: the request's host. |

## Licences
IP geolocation by [DB-IP](https://db-ip.com) (CC BY 4.0; the attribution is shown in the dashboard footer).
