import { config } from 'dotenv'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Load environment variables from .env.local (Next.js convention)
// This is safe on Vercel - dotenv won't throw if file doesn't exist
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
