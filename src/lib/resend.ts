import { config } from 'dotenv'
import { Resend } from 'resend'

// Load environment variables from .env.local (Next.js convention)
config({ path: '.env.local' })

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
