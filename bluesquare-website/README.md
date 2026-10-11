# Blue Square AI — corporate website

A static site in plain HTML, CSS and a small amount of vanilla JS. It has no build step and no frameworks.

Open `index.html` in a browser, or serve the folder locally:

    python3 -m http.server 8080

## Pages
- `index.html` – Home
- `solutions.html` – Services: hotel software, mobile apps, dashboards, CRM, AI and automation, websites
- `projects.html` – Overview of all products
- `projects/luxhotel.html`, `projects/shqipfol.html`, `projects/multisystem.html` – Product detail pages
- `about.html` – Company story, team, infrastructure and legal details (NUIS)
- `careers.html`
- `contact.html` – Contact form (opens the visitor's email app), contact details and map

## Brand
- Logo: `assets/img/logo-mark.svg` (vector redraw of the original) and `logo-mark-white.svg` for dark backgrounds
- Colours: azure `#4A84D0`, navy `#061238`. All colours are design tokens at the top of `assets/css/styles.css`
- Font: Plus Jakarta Sans (Google Fonts)
- 3D icons: `assets/icons/*.png` (AI-generated, transparent background)

The header and footer are repeated in each page. If you change them, update every HTML file.
