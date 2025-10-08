# Supabase Email Configuration for Rubatar.com

This document explains how to configure Supabase to send verification and password reset emails from `support@rubatar.com` with proper redirect URLs to your domain.

## Overview

The app now has the following email flows implemented:

1. **Sign Up with Email Verification**: Users must verify their email before they can sign in
2. **Password Reset**: Users receive a link to reset their password, which redirects to rubatar.com
3. **Email Verification Polling**: The app automatically detects when the user verifies their email and signs them in

## Required Configuration in Supabase Dashboard

### Step 1: Configure Site URL

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Set the **Site URL** to: `https://rubatar.com`
4. Add **Redirect URLs**:
   - `https://rubatar.com`
   - `https://rubatar.com?reset=true`
   - `http://localhost:3000` (for local development)
   - `http://localhost:3000?reset=true` (for local development)

### Step 2: Configure Email Templates

1. Go to **Authentication → Email Templates**
2. You'll see templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

#### Configure "Confirm Signup" Template

1. Click on **Confirm signup**
2. Update the template with your branding:

```html
<h2>Confirm Your Email</h2>

<p>Follow this link to confirm your email address:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best regards,<br>
Rubatar Team</p>
```

3. The `{{ .ConfirmationURL }}` will automatically include the correct redirect URL

#### Configure "Reset Password" Template

1. Click on **Reset Password**
2. Update the template:

```html
<h2>Reset Your Password</h2>

<p>Follow this link to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best regards,<br>
Rubatar Team</p>
```

### Step 3: Configure Custom SMTP (For support@rubatar.com sender)

To send emails from `support@rubatar.com`, you need to configure custom SMTP:

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable **Enable Custom SMTP**
3. Configure your SMTP settings:

#### Option A: Using a service like SendGrid, Mailgun, or Amazon SES

**SendGrid Example:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key
- Sender email: `support@rubatar.com`
- Sender name: `Rubatar`

**Mailgun Example:**
- Host: `smtp.mailgun.org`
- Port: `587`
- Username: Your Mailgun SMTP username
- Password: Your Mailgun SMTP password
- Sender email: `support@rubatar.com`
- Sender name: `Rubatar`

**Amazon SES Example:**
- Host: `email-smtp.us-east-1.amazonaws.com` (or your region)
- Port: `587`
- Username: Your SES SMTP username
- Password: Your SES SMTP password
- Sender email: `support@rubatar.com`
- Sender name: `Rubatar`

#### Option B: Using your own email server

If you have your own email server for rubatar.com:
- Host: Your mail server hostname
- Port: `587` (or `465` for SSL)
- Username: `support@rubatar.com`
- Password: The password for support@rubatar.com
- Sender email: `support@rubatar.com`
- Sender name: `Rubatar`

### Step 4: Verify Domain (Required for custom sender)

Most email providers require domain verification:

1. **For SendGrid/Mailgun/SES**: Follow their documentation to verify `rubatar.com`
2. This typically involves adding DNS records (SPF, DKIM, DMARC)
3. Example DNS records you may need to add:

```
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all

Type: TXT  
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:support@rubatar.com

Type: CNAME
Name: s1._domainkey
Value: [provided by your email service]
```

## Code Implementation (Already Done)

The following features are already implemented in the code:

### 1. Email Verification Flow
- Server-side signup creates users with `email_confirm: false`
- Frontend shows a waiting screen after signup
- App polls every 3 seconds to check if email is verified
- User is automatically signed in when email is verified

### 2. Password Reset Flow
- Reset emails redirect to `https://rubatar.com?reset=true` (or localhost in dev)
- App detects the reset token from URL hash
- Shows password reset form in a modal sheet
- Password requirements match signup requirements
- Updates password using Supabase auth

### 3. Redirect URL Handling
- Production: Uses `https://rubatar.com`
- Development: Uses `http://localhost:3000`
- Automatically detected based on hostname

## Testing the Flow

### Test Email Verification:

1. Sign up with a real email address
2. You should see a "Check Your Email" screen
3. Check your email inbox
4. Click the verification link
5. You'll be redirected to rubatar.com
6. The app should automatically detect verification and sign you in

### Test Password Reset:

1. Click "Forgot Password" on sign-in screen
2. Enter your email
3. Click "Send Reset Link"
4. Check your email inbox
5. Click the reset link
6. You'll be redirected to rubatar.com with the password reset form
7. Enter your new password (meeting all requirements)
8. Click "Update Password"
9. You should be signed in with the new password

## Important Notes

1. **Email Deliverability**: Make sure your SMTP provider is properly configured and your domain is verified to avoid emails going to spam

2. **Rate Limiting**: Supabase has rate limits on auth endpoints. Consider implementing additional rate limiting if needed

3. **Security**: 
   - Password reset tokens expire after a set time (configured in Supabase)
   - Verification links are one-time use
   - All tokens are cryptographically secure

4. **Development vs Production**:
   - The code automatically detects localhost vs production
   - Test thoroughly in development before deploying

5. **Troubleshooting**:
   - Check browser console for errors
   - Check Supabase logs for auth errors
   - Verify URL parameters are correctly set
   - Ensure SMTP credentials are correct

## Support

If you encounter issues:
1. Check Supabase Dashboard → Logs for error messages
2. Verify all redirect URLs are correctly configured
3. Test SMTP connection from Supabase dashboard
4. Check spam folder for verification emails
5. Verify DNS records are properly set up for your domain
