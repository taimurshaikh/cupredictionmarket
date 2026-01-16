import { config } from 'dotenv'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { waitlistEmailSchema } from '@/lib/validations/waitlist'
import { resend } from '@/lib/resend'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/emails/verification-email'
import { randomUUID } from 'crypto'

// Load environment variables from .env.local (Next.js convention)
// This is safe on Vercel - dotenv won't throw if file doesn't exist
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email with Zod
    const validationResult = waitlistEmailSchema.safeParse(email)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const validatedEmail = validationResult.data.toLowerCase()

    // Create Supabase client
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', validatedEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new emails
      console.error('Error checking for existing email:', checkError)
      return NextResponse.json(
        { error: 'Failed to process request. Please try again.' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist.' },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = randomUUID()

    // Insert into waitlist
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: validatedEmail,
        verification_token: verificationToken,
      })
      .select('id, created_at')
      .single()

    if (insertError) {
      console.error('Error inserting into waitlist:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      )
    }

    // Calculate waitlist position (count of users who signed up before or at the same time)
    const { count, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', newUser.created_at)

    if (countError) {
      console.error('Error calculating waitlist position:', countError)
      // Continue even if position calculation fails
    }

    const waitlistPosition = count || 1

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/api/verify-email?token=${verificationToken}`

    try {
      await resend.emails.send({
        from: 'CUAndaz <noreply@onboarding.cuandaz.com>',
        to: validatedEmail,
        subject: 'Verify your email for CUAndaz',
        html: getVerificationEmailHtml({ verificationUrl }),
        text: getVerificationEmailText({ verificationUrl }),
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the request if email fails - user is still added to waitlist
    }

    return NextResponse.json(
      { 
        success: true,
        position: waitlistPosition,
        message: 'Successfully joined waitlist! Please check your email to verify your address.' 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in waitlist route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
