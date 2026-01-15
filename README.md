# CU Prediction Market

This is a [Next.js](https://nextjs.org) project for the Columbia University prediction market platform.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yjxtypfnietbobqoqglm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeHR5cGZuaWV0Ym9icW9xZ2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjM4OTgsImV4cCI6MjA4Mzg5OTg5OH0.gZNRUdB02AV6k2szR4j1M7YxRi8zSMoHu5TqY0j938s

# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=your_resend_api_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** Replace `your_resend_api_key_here` with your actual Resend API key from [https://resend.com/api-keys](https://resend.com/api-keys).

### 2. Supabase Setup

The Supabase project "CU Prediction Market" is already configured with:
- **Project URL:** `https://yjxtypfnietbobqoqglm.supabase.co`
- **Waitlist table** created with the following schema:
  - `id` (UUID, primary key)
  - `email` (TEXT, unique, not null)
  - `verified` (BOOLEAN, default: false)
  - `verification_token` (TEXT, unique)
  - `created_at` (TIMESTAMPTZ, default: now())
  - `verified_at` (TIMESTAMPTZ, nullable)

### 3. Resend Email Setup

1. Sign up for a Resend account at [https://resend.com](https://resend.com)
2. Create an API key from the dashboard
3. Add the API key to your `.env.local` file
4. Update the `from` email address in `src/app/api/waitlist/route.ts` to use your verified domain (currently set to `onboarding@resend.dev` for testing)

### 4. Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Waitlist Signup:** Columbia email validation using Zod
- **Email Verification:** Resend-powered email verification flow
- **Waitlist Position:** Real-time position tracking based on signup order
- **Supabase Integration:** Full database integration for waitlist management

## Project Structure

- `src/app/page.tsx` - Main landing page with waitlist form
- `src/app/api/waitlist/route.ts` - Waitlist signup API endpoint
- `src/app/api/verify-email/route.ts` - Email verification endpoint
- `src/lib/supabase/` - Supabase client utilities
- `src/lib/validations/waitlist.ts` - Zod validation schemas
- `src/lib/resend.ts` - Resend email client
- `src/lib/emails/verification-email.tsx` - Email template

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features.
- [Resend Documentation](https://resend.com/docs) - learn about Resend email API.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important:** Remember to add all environment variables to your Vercel project settings before deploying.
