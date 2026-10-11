# Blue Square AI — corporate website (Next.js)

Next.js App Router site, statically prerendered (29 pages), plain CSS, no UI or animation libraries.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` if the domain is not `https://bluesquare.ai` (used for canonical URLs, sitemap and structured data).

## Structure
- `src/app/(en)/…` English pages at `/…`; `src/app/(sq)/sq/…` Albanian pages at `/sq/…`. Each route file is a thin wrapper around a view in `src/views/`.
- `src/content/en.ts`, `sq.ts` — all copy. `src/content/data.ts` — language-independent facts (icons, images, product links, prices).
- `src/lib/site.ts` — company facts (NUIS, address, phone, team). Change them here only.
- `src/lib/schema.ts` — Schema.org JSON-LD: Organization/ProfessionalService (with NUIS as `taxID`, address, geo, founders), WebSite, WebPage subtypes with BreadcrumbList, Service list, SoftwareApplication/MobileApplication per product.
- `src/lib/seo.ts` — per-page title, description, canonical, hreflang (en, sq, x-default), Open Graph and Twitter tags.
- `src/app/sitemap.ts`, `robots.ts`, `manifest.ts` — generated SEO files.

## Brand
- Colours from the logo: azure `#4A84D0`, navy `#061238` (tokens at the top of `src/app/globals.css`).
- Logo: `public/logo-mark.svg` (vector) and `logo-mark-white.svg`.
- 3D icons: `public/icons/*.png`, generated with Gemini. To add one, see `tools/generate-icon.sh` and `tools/cutout-icons.py`.

## Contact form
The form opens the visitor's email app with the message addressed to info@bluesquare.ai. To send server-side instead, replace `handleSubmit` in `src/components/ContactForm.tsx` with a call to an API route.
