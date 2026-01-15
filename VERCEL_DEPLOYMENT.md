# Vercel Deployment Guide for cuandaz.com

This guide will help you deploy the CU Prediction Market project to Vercel under the domain `cuandaz.com`.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your domain `cuandaz.com` configured and ready to use
- All environment variables from your `.env` and `.env.local` files

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://cuandaz.com
```

**Important:** 
- Set `NEXT_PUBLIC_APP_URL` to `https://cuandaz.com` (not `http://localhost:3000`)
- Add these variables for **Production**, **Preview**, and **Development** environments
- You can add them in: **Settings** → **Environment Variables**

## Step 4: Configure Custom Domain

1. Go to your project settings in Vercel
2. Navigate to **Settings** → **Domains**
3. Add your domain: `cuandaz.com`
4. Follow Vercel's instructions to configure DNS:
   - Add an A record pointing to Vercel's IP addresses, OR
   - Add a CNAME record pointing to `cname.vercel-dns.com`
5. Vercel will automatically provision an SSL certificate

## Step 5: Deploy

1. Click **"Deploy"** in Vercel
2. Vercel will build and deploy your application
3. Once deployed, your site will be available at `cuandaz.com`

## Step 6: Verify Deployment

After deployment, verify:

1. ✅ The site loads at `https://cuandaz.com`
2. ✅ Waitlist signup form works
3. ✅ Email verification emails are sent (check Resend dashboard)
4. ✅ Email verification links work correctly
5. ✅ Supabase connection is working

## Troubleshooting

### Build Errors

If you encounter build errors:
- Check that all environment variables are set correctly
- Verify that `NEXT_PUBLIC_APP_URL` is set to `https://cuandaz.com`
- Check the build logs in Vercel dashboard

### Email Issues

If emails aren't sending:
- Verify `RESEND_API_KEY` is set correctly
- Check that `notifications@cuandaz.com` is verified in Resend
- Review Resend dashboard for email logs

### Domain Issues

If the domain isn't working:
- Verify DNS records are configured correctly
- Wait for DNS propagation (can take up to 48 hours)
- Check SSL certificate status in Vercel dashboard

## Post-Deployment Checklist

- [ ] Domain is configured and SSL certificate is active
- [ ] All environment variables are set
- [ ] Site is accessible at `https://cuandaz.com`
- [ ] Waitlist signup works
- [ ] Email verification works
- [ ] Resend domain is verified (`cuandaz.com`)
- [ ] Supabase connection is working

## Notes

- The `vercel.json` file is already configured for optimal deployment
- Environment variables are automatically available in Vercel (no `.env.local` needed)
- The code is configured to work in both development and production environments
- Email verification links will use `https://cuandaz.com` automatically
