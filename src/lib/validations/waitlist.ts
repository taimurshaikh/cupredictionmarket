import { z } from 'zod'

export const waitlistEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .refine(
    (email) => email.toLowerCase().endsWith('@columbia.edu'),
    {
      message: 'Alpha is currently restricted to @columbia.edu users.',
    }
  )

export const verificationTokenSchema = z.string().uuid('Invalid verification token')
