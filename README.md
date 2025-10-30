# የሚድያ ሽፋን አስተዳደር (Media Coverage Management)

Simple system for media coverage requests.

### What it does
- Office users send requests (date, time, location, agenda).
- Admins review and decide.
- Real‑time updates and notifications.
- Ethiopian calendar and time supported.

### Roles
- Office: create and track own requests.
- Admin: view all, approve/reject, manage users.

### Tech
- React + TypeScript, Vite, Tailwind, shadcn/ui.
- Supabase: Auth, Postgres, Realtime, RLS.

### Database quick view
- `profiles`: user metadata and role (`admin`, `office`).
- `media_requests`: request details and status.
- RLS: users see their own; admins see all.
- Time rule: next‑day requests must be before 1:00 PM.

### Docs
- See `docs/` for database SQL, security, and a short admin guide.