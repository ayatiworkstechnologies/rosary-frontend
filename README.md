# Rosary School Portal

Next.js frontend for the Rosary School admin, teacher, and parent portals.

## Features

- Role-aware authentication and guarded portal routes
- Admin management for users, classes, students, teachers, parents, fees, exams, results, circulars, downloads, events, and notifications
- Teacher workflows for attendance, homework, rosters, results, exam schedules, and notifications
- Parent access to linked children, attendance, homework, fees, results, schedules, downloads, circulars, calendars, and notifications
- Responsive desktop, tablet, and mobile layouts

## Local development

Install dependencies:

```powershell
npm ci
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

Start the development server:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Verification

```powershell
npm run lint
npm run build
npm exec playwright test
```

Playwright starts a production frontend build and a disposable SQLite backend on `127.0.0.1:8017`. Its configuration overrides `NEXT_PUBLIC_API_URL` so browser tests never call the production API.

## Production

Set the public API URL before building:

```env
NEXT_PUBLIC_API_URL=https://www.api.rosarychennai.com/api/v1
```

`NEXT_PUBLIC_*` values are embedded at build time. Rebuild the frontend whenever the production API URL changes.
