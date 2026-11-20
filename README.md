# Rastlab – Performance & Creative Agency Website (white-label)

A full-stack, white-label website for a full-service performance marketing agency
(PPC, SEO, social media, branding, web & CRO, e-mail automation). The public UI
and all seeded content are in **Slovak**; code and docs are in English.

```
.
├── backend/    Django 6 + Django REST Framework API, Slovak admin, seed command
└── frontend/   Angular 22 (standalone components, Signals, strict TS, pure SCSS)
```

## Requirements

- Python 3.12+ (tested on 3.14)
- Node.js 20.19+ / 22 LTS and npm 10+

## 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – defaults work for local dev
python manage.py migrate
python manage.py seed_data         # idempotent, safe to re-run
python manage.py createsuperuser   # account for /admin
python manage.py runserver 8000
```

- **Admin:** http://localhost:8000/admin/ — manage categories, services, case studies
  with KPIs, team members, incoming proposals ("Dopyty na spoluprácu") and audit
  requests ("Žiadosti o bezplatný audit"). Leads can be marked as processed in
  bulk or inline.
- **Tests:** `python manage.py test agency`

### API (`/api/`)

| Method | Endpoint                    | Notes                                                                                 |
| ------ | --------------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/api/categories/`          | Categories incl. `service_count`                                                      |
| GET    | `/api/services/`            | `?category=<slug>`, `?featured=true`, `?search=` (name/tools), `?ordering=name\|management_fee_from_eur` |
| GET    | `/api/services/<slug>/`     | Full dossier: deliverables, tools, ideal clients, success metrics                     |
| GET    | `/api/case-studies/`        | `?category=<slug>`, `?featured=true`                                                  |
| GET    | `/api/team/`                | Active team members                                                                   |
| POST   | `/api/proposals/`           | Project proposal (validated, honeypot-protected, rate-limited)                        |
| POST   | `/api/audits/`              | Free mini-audit request (validated, honeypot-protected, rate-limited)                 |

Validation errors are returned in Slovak, keyed by field name.

### Production database

SQLite is used by default. For PostgreSQL install `psycopg[binary]` and set
`DATABASE_URL=postgres://user:pass@host:5432/dbname` in `.env`. Set
`DJANGO_DEBUG=False`, a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`; HTTPS redirect and HSTS turn
on automatically when debug is off.

## 2. Frontend (http://localhost:4200)

```bash
cd frontend
npm install        # .npmrc enables legacy-peer-deps (works around an npm 10 resolver bug)
npm start          # ng serve
npm run build      # production build → dist/frontend
```

The dev API URL lives in `src/environments/environment.ts`
(`http://localhost:8000/api`). The production build uses
`environment.prod.ts` (`/api`, i.e. same origin behind a reverse proxy).

### Routes

| Path                | Page                                                         |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | Home: hero, featured services & case studies, ROI estimator, workflow, testimonials |
| `/sluzby`           | Searchable / filterable services (filters synced to URL)     |
| `/sluzby/:slug`     | Service dossier with pre-filled “Mám záujem” CTA             |
| `/pripadove-studie` | Case studies filterable by channel                           |
| `/o-agenture`       | Philosophy, partner certifications, team                     |
| `/kontakt`          | Proposal wizard (`?tab=ponuka`, `?service=<slug>`) and free audit (`?tab=audit`) |

## White-label rebranding

1. **Business details:** `frontend/src/app/core/config/site.config.ts` – agency
   name, wordmark, tagline, phone, e-mails, address, IČO/DIČ/IČ DPH, partner
   badges, social links, trust metrics and the GDPR notice.
2. **Colors, fonts, spacing:** `frontend/src/styles/_variables.scss` (emitted as
   CSS custom properties in `src/styles.scss`, so `:root` overrides also work).
3. **Marketing copy blocks:** `frontend/src/app/core/content/home.content.ts`
   (workflow steps, testimonials, agency pillars).
4. **Services, case studies, team:** Django admin (or edit
   `backend/agency/management/commands/seed_data.py`).
5. `frontend/src/index.html` – default `<title>`/meta description, `public/favicon.svg`.

> All agency data shipped in this repo (name, address, registration numbers,
> testimonials, case studies) is fictitious placeholder content.

## ROI estimator

`frontend/src/app/core/utils/roi-estimator.ts` contains the projection model:
industry benchmark CPC, CTR, conversion and close rates per business type,
adjusted for order value and with diminishing returns at higher budgets. Tune
the `INDUSTRY_PROFILES` to the agency's own account data.
