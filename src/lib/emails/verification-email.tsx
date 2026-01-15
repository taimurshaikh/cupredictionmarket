interface VerificationEmailProps {
  verificationUrl: string
}

export function getVerificationEmailHtml({ verificationUrl }: VerificationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; background-color: #ffffff;">
  <div style="max-width: 560px; margin: 0 auto; padding: 48px 20px;">
    <h1 style="font-size: 24px; line-height: 1.3; font-weight: 700; color: #0f172a; margin: 0 0 20px;">
      Welcome to CUAndaz
    </h1>
    <p style="font-size: 16px; line-height: 1.5; color: #334155; margin: 0 0 16px;">
      Thanks for joining the waitlist! We're excited to have you on board.
    </p>
    <p style="font-size: 16px; line-height: 1.5; color: #334155; margin: 0 0 16px;">
      Please verify your Columbia email address to complete your signup:
    </p>
    <div style="margin: 32px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 8px;">
        Verify Email
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0;">
      If you didn't sign up for CUAndaz, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `.trim()
}

export function getVerificationEmailText({ verificationUrl }: VerificationEmailProps): string {
  return `
Welcome to CUAndaz

Thanks for joining the waitlist! We're excited to have you on board.

Please verify your Columbia email address to complete your signup by clicking the link below:

${verificationUrl}

If you didn't sign up for CUAndaz, you can safely ignore this email.
  `.trim()
}
