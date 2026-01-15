import { config } from 'dotenv'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Load environment variables from .env.local (Next.js convention)
// This is safe on Vercel - dotenv won't throw if file doesn't exist
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Find user with this verification token
    const { data: user, error: findError } = await supabase
      .from('waitlist')
      .select('id, email, verified')
      .eq('verification_token', token)
      .single()

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.verified) {
      return NextResponse.redirect(
        new URL('/?verified=true&already=true', request.url)
      )
    }

    // Update user to verified
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating verification status:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      )
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/?verified=true', request.url)
    )
  } catch (error) {
    console.error('Unexpected error in verify-email route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
