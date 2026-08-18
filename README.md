# Dental Implants — service site

Static, dependency-free marketing site for a dental implant / oral surgery practice.
The flagship page is the **Dental Implants** service page, structured after the URL
pattern `/services/dental-implants/`.

## Design system

The visual language follows the **Seed** style reference — "living organism under
laboratory glass":

| Role | Token | Value |
|------|-------|-------|
| Primary / text / dark sections | `--color-forest-depths` | `#1c3a13` |
| Page canvas | `--color-snow-white` | `#fcfcf7` |
| Accent (badges only) | `--color-lime-pulse` | `#d3fa99` |
| Secondary surface | `--color-warm-stone` | `#eeeee9` |
| Supporting greens | `--color-sage-moss` / `--color-olive-gold` / `--color-eucalyptus` | `#757c5d` / `#9f995b` / `#698e79` |

Rules the stylesheet holds to:

- Display type at weight **300–350** with tightened tracking (`-0.72px` at 48px).
- **No shadows, no gradients** — hierarchy comes from colour contrast and space.
- **1000px radius** on every button, badge and pill; 16px on cards, 32px on large cards.
- Sections alternate full-bleed **Snow White** and **Forest Depths**, with Warm Stone
  used sparingly as a quiet third band.
- Lime Pulse appears only on badges and small emphasis — never as a surface.
- Product/treatment codes (`IMP-01®`, `FA-04™`) set in the mono companion face.

Fonts substitute per the reference: **Inter** for Seed Sans, **JetBrains Mono** for
Seed Sans Mono, both loaded from Google Fonts with system fallbacks.

## Structure

```
index.html                          Home
services/index.html                 Service index
services/dental-implants/index.html Dental implants service page
assets/css/styles.css               Design tokens + all component styles
assets/js/main.js                   Mobile nav, form handling, footer year
```

## Page anatomy (`/services/dental-implants/`)

Promo banner → sticky nav → breadcrumbs → hero with spec panel → what an implant is
(with an inline SVG cross-section) → four treatment options + comparison table →
benefits → six-step protocol → candidacy and bone grafting → science/technology →
cost and financing → recovery and long-term care → patient stories → FAQ →
consultation form → footer.

Includes `MedicalBusiness`, `MedicalProcedure` and `FAQPage` JSON-LD.

## Running locally

No build step. Serve the directory:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/services/dental-implants/
```

## Hosting and analytics

The repository stores the site; it does not serve it. To put it on the web,
enable **GitHub Pages**: repository *Settings → Pages → Build and deployment →
Deploy from a branch*, pick the branch and `/ (root)`. The repo is public, so
Pages is free. The site then lives at:

```
https://brandonmorena.github.io/Dental-implant/services/dental-implants/
```

Every path in the site is relative, so it works unchanged under that
`/Dental-implant/` subpath.

### Google tag

`assets/js/analytics.js` holds the Google Analytics 4 loader and is included on
every page. Set `MEASUREMENT_ID` to your own `G-` ID (GA4 Admin → Data streams →
your web stream). While the placeholder is in place the file is completely
inert — no request, no globals, no console noise.

Beyond pageviews it records two conversions:

| Event | Fires when |
|-------|-----------|
| `phone_call_click` | A `tel:` link is clicked, tagged `sticky_cta` or `page` |
| `generate_lead` | The consultation form is submitted, with the treatment selected |

No form field values are sent — only that a submission happened, and which
treatment the visitor picked from the dropdown.

To use Google Tag Manager instead, swap the `gtag/js` URL for
`gtm.js?id=GTM-XXXXXXX` and remove the two `gtag()` configuration calls.

Note that the tag cannot load inside a published Claude artifact — artifacts run
under a Content Security Policy that blocks external hosts other than Google
Fonts. It works normally on GitHub Pages or any ordinary host.

## Before publishing

This is a template. Replace:

- Practice name, address, phone, email, and hours (also in the JSON-LD block).
- The `canonical` and `og:` URLs, currently `example.com`.
- Patient testimonials — the ones included are illustrative, not real reviews.
- Cost ranges, which are illustrative and not a quote.
- The consultation form has no backend. Set an `action` on the
  `[data-consult-form]` element and the demo-only JS handler steps aside.
