# Treasure Hunt Webapp (Next.js) — Vercel-ready (Demo)

Short summary:
Build a treasure-hunt style college event webapp with three interfaces — Admin, Public and QR Direct — where QR scanners (teams) enter team codes, view rotating clues, and admins monitor scan analytics.

This repository contains a working demo designed to be easy to deploy to Vercel for development and testing.

## Features (implemented)
- Next.js frontend with Tailwind CSS.
- Admin interface with JWT auth (seeded admin: `admin` / `password123`).
- CRUD for QR entries (create in admin).
- QR Direct interface at `/qr/[code]` — shows rotating clues and media.
- Server-side QR image generation (`/api/qrs/<code>/qr`).
- SQLite database (`/data/db.sqlite`) using `better-sqlite3`.
- Scan endpoint `/api/scan` that registers team scans.
- Analytics CSV export `/api/analytics/export`.

## Notes and caveats
- **Persistence on Vercel**: Vercel serverless functions have an ephemeral filesystem. SQLite file will be persistent only for the lifetime of the server instance and is not recommended for production on Vercel. For production use, switch to a hosted Postgres (e.g., Supabase, Neon) or an external storage (S3) for uploads.
- File uploads in this demo write to local `public/uploads` (not recommended on serverless). For production, configure S3 / Cloud Storage.

## Local development
1. Clone the repository.
2. Install dependencies:
```bash
npm install
```
3. Seed the DB (creates admin and sample QRs):
```bash
node scripts/seed.js
```
4. Run locally:
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000 npm run dev
```
5. Open http://localhost:3000

## Deploy to Vercel
1. Create a new Vercel project from this GitHub repo.
2. Set environment variable `JWT_SECRET` in Vercel (Production).
3. For robust data, configure a hosted Postgres DB and update `lib/db.js` accordingly.

## File upload / Media
- For images/videos in clues, include external URLs in the `clues_json` array when creating QR in admin (e.g. `{"text":"Find X","media":"https://.../img.jpg"}`).
- If you want server uploads, replace the simple demo with Cloudinary/S3 integration.

## API summary
- `POST /api/auth/login` — body `{username,password}` -> `{token}`
- `GET /api/qrs/public` — (not locked) list public qrs (in demo same as GET /api/qrs)
- `GET /api/qrs` — admin only
- `POST /api/qrs` — admin create
- `GET /api/qrs/:code` — public info about QR
- `GET /api/qrs/:code/qr` — png image of QR linking to `/qr/:code`
- `POST /api/scan` — body `{qr_code, team_code}` registers scan
- `GET /api/analytics/export?format=csv|json` — export scan logs

## Next steps / Improvements
- Add WebSockets (Socket.IO) for live counters.
- Implement secure file uploads to S3 + CDN.
- Add team dashboards, skip management, premium purchases (Stripe).
- Harden auth with 2FA, role-based access.
- Move from SQLite -> Postgres / Supabase for production.

## License
MIT

