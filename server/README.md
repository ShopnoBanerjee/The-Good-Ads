# The Good Ads Backend (Supabase Auth)

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` (from Supabase Project Settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Project Settings → API)
   - `SUPABASE_JWT_SECRET` (from Supabase Project Settings → API → JWT Secret)

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   uvicorn app.main:app --reload
   ```

## Endpoint

- **POST `/api/post-login`**
  - Expects JSON: `{ "userType": "business" | "college_society" }`
  - Requires header: `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`
  - Upserts the user's profile in Supabase.

## Security

- The backend verifies the Supabase JWT using your project's JWT secret.
- Only valid, logged-in Supabase users can update their profile.

## What to Delete

- All old `better-auth` files, configs, and Pool/db setup are now unused and can be deleted.

## How to get your Supabase JWT secret

- Go to your Supabase project → Settings → API → JWT Secret.
