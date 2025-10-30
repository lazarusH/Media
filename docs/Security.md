## Security (short)

- RLS is on for `profiles` and `media_requests`.
- Users see their own data. Admins see all.
- Admin role is stored in `profiles.role` (`admin`, `office`).
- Triggers keep `updated_at` fresh and auto‑create profiles.
- Do not seed real passwords or emails in production.

