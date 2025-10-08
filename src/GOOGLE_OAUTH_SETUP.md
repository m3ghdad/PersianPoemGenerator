# Google OAuth Setup Guide - COMPLETE CONFIGURATION

## Current Issue: User not logged in after Google OAuth redirect

The OAuth flow completes but the session isn't established. This is fixed in the code, but you MUST configure Supabase correctly.

## STEP 1: Configure Supabase Site URL (CRITICAL ⚠️)

1. Go to: https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd
2. Navigate to: **Authentication** → **URL Configuration**
3. Find the **Site URL** field
4. Set it to: `https://rubatar.com` (NO trailing slash, NO http, MUST be https)
5. Click **Save**

## STEP 2: Configure Redirect URLs (CRITICAL ⚠️)

In the same **URL Configuration** section:

1. Scroll to **Redirect URLs**
2. **IMPORTANT**: Click **Add URL** and add ONLY this URL:
   - `https://rubatar.com`
   
3. For local development, also add:
   - `http://localhost:5173`
   - `http://localhost:3000`
   
4. Click **Save** after adding all URLs

**CRITICAL**: 
- Do NOT add a trailing slash (`/`) to `https://rubatar.com`
- The redirect URL must EXACTLY match what's in the code
- After saving, wait 2-3 minutes for Supabase to propagate the changes

## 3. Configure Google OAuth Provider in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Enable the Google provider
4. You'll need to configure:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

## STEP 3: Configure Google Cloud Console OAuth

1. Go to: https://console.cloud.google.com/
2. Create a new project OR select existing project
3. Navigate to: **APIs & Services** → **Credentials**
4. Click: **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **Rubatar Poetry App** (or your choice)
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   
6. Return to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
7. Application type: **Web application**
8. Name: **Rubatar Web Client** (or your choice)
9. **Authorized redirect URIs** - Add this EXACT URL:
   ```
   https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback
   ```
   
10. Click **Create**
11. Copy the **Client ID** and **Client Secret** that appear

## STEP 4: Add Google Credentials to Supabase

1. Go back to Supabase dashboard: https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd
2. Navigate to: **Authentication** → **Providers**
3. Find **Google** in the list and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Click **Save**

## STEP 5: Verify Complete Configuration

### Checklist - All must be ✅

In **Supabase Dashboard**:
- [ ] Site URL is set to `https://rubatar.com`
- [ ] Redirect URLs include both `https://rubatar.com` AND `https://rubatar.com/`
- [ ] Google provider is ENABLED
- [ ] Google Client ID is filled in
- [ ] Google Client Secret is filled in

In **Google Cloud Console**:
- [ ] OAuth consent screen is configured
- [ ] Authorized redirect URI is `https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback`

## STEP 6: Test the Integration

1. Open https://rubatar.com in an **incognito/private window** (fresh session)
2. Open browser console (F12) to see logs
3. Click the Google sign-in button
4. You should see Google's consent screen
5. After approving, look for these console logs:
   ```
   OAuth redirect detected, processing tokens...
   ✓ OAuth session established successfully
   ```
6. You should be redirected back to rubatar.com and logged in
7. The auth sheet should close automatically

## Troubleshooting Guide

### Issue: "requested path is invalid" error
**Cause**: Redirect URL not in Supabase's allowed list  
**Fix**: 
1. Go to Supabase → Authentication → URL Configuration
2. Add BOTH `https://rubatar.com` and `https://rubatar.com/` to Redirect URLs
3. Set Site URL to `https://rubatar.com` (no trailing slash)
4. Click Save and wait 2-3 minutes for changes to propagate

### Issue: "redirect_uri_mismatch" error from Google
**Cause**: Supabase callback URL not in Google Cloud Console  
**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add EXACTLY: `https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback`
4. Save

### Issue: Redirects to pspybykovwrfdxpkjpzd.supabase.co but doesn't log in
**Cause**: OAuth callback not being processed correctly (THIS WAS YOUR ISSUE)  
**Fix**: The code has been FIXED to properly extract and use OAuth tokens from URL hash. Deploy the latest code and:
1. Verify Site URL is EXACTLY: `https://rubatar.com` (no trailing slash)
2. Verify Redirect URLs include: `https://rubatar.com` (no trailing slash)
3. Clear browser cache and cookies completely
4. Test in a new incognito/private window
5. Open browser console (F12) before signing in
6. Look for these console messages:
   - `🔐 OAuth redirect detected, establishing session...`
   - `✅ OAuth session established successfully!`
   - User email should be logged
7. If you see `❌ OAuth session error`, copy the error and check Supabase settings
8. **Wait 2-3 minutes** after changing any Supabase settings before testing

### Issue: Permissions-Policy header error about 'browsing-topics'
**Cause**: Browser feature warning from Google  
**Fix**: This is just a warning, NOT an error. It doesn't affect OAuth. Ignore it.

### Issue: Session not persisting after login
**Cause**: Cookie/storage issues  
**Fix**:
- Ensure cookies are enabled for rubatar.com
- Check browser privacy settings aren't blocking third-party cookies
- Disable ad blockers temporarily
- Try incognito mode first

## What Happens During OAuth Flow (Technical Details)

1. **User clicks** "Continue with Google"
2. **App redirects** to Google's OAuth consent page
3. **User approves** the app permissions
4. **Google redirects** to: `https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback?code=...`
5. **Supabase processes** the OAuth authorization code
6. **Supabase redirects** to: `https://rubatar.com#access_token=...&refresh_token=...`
7. **App detects** hash parameters in URL (NEW: fixed in code)
8. **Session established** using the tokens from hash
9. **User is logged in**, URL hash is cleaned
10. **Profile synced** automatically (name and picture from Google)

## After Successful Setup

Once properly configured:
✅ Users click Google sign-in button  
✅ Authenticate with Google  
✅ Redirected back to rubatar.com logged in  
✅ Google profile picture and name automatically synced  
✅ Stay logged in across sessions until they sign out  

## Need More Help?

If Google OAuth still doesn't work after following ALL steps:

1. **Check browser console** for specific error messages
2. **Verify ALL checklist items** in Step 5 are ✅
3. **Wait 5 minutes** after saving Supabase config (caching)
4. **Test in incognito mode** with cache cleared
5. **Check this exact sequence** appears in console:
   ```
   Starting Google OAuth flow...
   Current hostname: rubatar.com
   Redirect URL will be: https://rubatar.com
   (after redirect)
   OAuth redirect detected, processing tokens...
   ✓ OAuth session established successfully
   ```
