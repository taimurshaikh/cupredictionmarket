import { config } from 'dotenv'
import { createBrowserClient } from '@supabase/ssr'

// Load environment variables from .env.local (Next.js convention)
config({ path: '.env.local' })

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
