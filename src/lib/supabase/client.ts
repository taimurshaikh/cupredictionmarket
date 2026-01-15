import { config } from 'dotenv'
import { createBrowserClient } from '@supabase/ssr'

// Load environment variables from .env.local (Next.js convention)
// This is safe on Vercel - dotenv won't throw if file doesn't exist
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
