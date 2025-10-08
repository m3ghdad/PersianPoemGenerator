# Google OAuth Fix - Complete Solution

## The Problem

When you click "Sign in with Google", you see:
```
Choose an account to continue to pspybykovwrfdxpkjpzd.supabase.co
```

This means the OAuth flow is stuck at the Supabase domain and not redirecting back to rubatar.com.

## Root Cause

The **Site URL** in your Supabase project is NOT set to `https://rubatar.com`. This is the #1 most critical setting for OAuth to work.

## THE FIX (Do These Steps EXACTLY)

### Step 1: Set Site URL in Supabase (MOST CRITICAL ⚠️⚠️⚠️)

1. **Go to**: https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/auth/url-configuration

2. **Find the "Site URL" field** - it's at the TOP of the page

3. **CRITICAL**: The Site URL field must be set to:
   ```
   https://rubatar.com
   ```
   - NO trailing slash `/`
   - NO `www`
   - MUST start with `https://`
   - EXACTLY `https://rubatar.com`

4. **Click SAVE** at the bottom of the page

5. **WAIT 2-3 minutes** for Supabase to propagate this change

### Step 2: Add Redirect URLs (ALSO CRITICAL ⚠️)

Still on the same page (https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/auth/url-configuration):

1. **Scroll down to "Redirect URLs"**

2. **You should see a list**. Make sure these URLs are in the list:
   ```
   https://rubatar.com
   http://localhost:5173
   http://localhost:3000
   ```

3. If `https://rubatar.com` is NOT in the list:
   - Click **"Add URL"**
   - Type EXACTLY: `https://rubatar.com`
   - Click the **checkmark** or press Enter
   - Click **SAVE** at the bottom

4. **WAIT 2-3 minutes**

### Step 3: Verify Google Provider is Enabled

1. Go to: https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/auth/providers

2. Find **Google** in the list

3. Make sure the toggle is **ON** (green/enabled)

4. Verify you have:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)

5. If anything is missing, follow the Google Cloud Console setup in GOOGLE_OAUTH_SETUP.md

### Step 4: Test the Fix

1. **Deploy your latest code** (with the fixes)

2. **Clear your browser data**:
   - Open Chrome/Safari
   - Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select "Cookies and other site data"
   - Select "All time"
   - Click "Clear data"

3. **Open an Incognito/Private window**

4. **Go to**: https://rubatar.com

5. **Open the browser console** (F12 or Cmd+Option+I)

6. **Click the settings button** → **ورود با گوگل**

7. **Watch the console** - you should see:
   ```
   🚀 Starting Google OAuth flow...
   📍 Current URL: https://rubatar.com
   🔄 Redirect URL: https://rubatar.com
   ✅ OAuth redirect initiated
   ```

8. **After Google sign-in**, you should be redirected to `https://rubatar.com` (NOT the Supabase domain)

9. **The console should show**:
   ```
   🔐 OAuth redirect detected, establishing session...
   ✅ OAuth session established successfully!
   User: your-email@gmail.com
   Auth state change: SIGNED_IN user-id
   ```

## What You Should See

### BEFORE the fix:
- Google shows: "Continue to pspybykovwrfdxpkjpzd.supabase.co"
- After auth, stays on Supabase domain
- You don't get logged in

### AFTER the fix:
- Google shows: "Continue to pspybykovwrfdxpkjpzd.supabase.co" (this is normal - it's the OAuth callback)
- After auth, IMMEDIATELY redirects to `https://rubatar.com`
- You see the hash in URL briefly: `https://rubatar.com#access_token=...`
- The hash disappears and you're logged in
- Auth sheet closes automatically

## If It STILL Doesn't Work

### Check #1: Site URL
Go back to https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/auth/url-configuration

The Site URL field should show EXACTLY:
```
https://rubatar.com
```

If it shows anything else (like `http://localhost:3000` or blank), that's your problem.

### Check #2: Browser Console Errors
Open the console during the OAuth flow. Look for errors like:
- `requested path is invalid` → Site URL or Redirect URLs not configured
- `redirect_uri_mismatch` → Google Cloud Console needs the Supabase callback URL
- `Invalid Refresh Token` → Old session, clear cookies and try again

### Check #3: Network Tab
1. Open browser DevTools → Network tab
2. Try signing in with Google
3. Look for a request to the Supabase domain that returns a redirect
4. Check if the redirect goes to `https://rubatar.com` or somewhere else
5. If it redirects to the wrong place, your Site URL is wrong

## Technical Explanation

### How OAuth Flow Works (PKCE - Authorization Code Flow):

1. User clicks "Sign in with Google" on `rubatar.com`
2. App redirects to Google with: `redirect_uri=https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback`
3. User signs in to Google
4. Google redirects to: `https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback?code=...`
5. **Supabase checks its "Site URL" setting**
6. **Supabase redirects to the Site URL** with authorization code: `https://rubatar.com?code=8b0f1ecb-cf7c-485a-bc5d-90fa4fda9505`
7. Our app detects the code in the URL query params
8. Our app calls `supabase.auth.exchangeCodeForSession(code)` to exchange the code for tokens
9. Session is established and user is logged in!

**If Site URL is wrong or not set**, Step 6 fails. Supabase doesn't know where to redirect, so the user stays on the Supabase domain.

**Note**: Supabase uses the PKCE flow by default (more secure). The code in the URL is NOT a session - it must be exchanged for actual tokens.

## The "Permissions-Policy" Warning

The error about `Permissions-Policy header: Unrecognized feature: 'browsing-topics'` is just a browser warning from Google. It does NOT affect OAuth and you can ignore it.

## Final Checklist

- [ ] Site URL in Supabase is `https://rubatar.com`
- [ ] Redirect URLs in Supabase includes `https://rubatar.com`
- [ ] Google provider in Supabase is enabled
- [ ] Client ID and Secret are configured
- [ ] Waited 2-3 minutes after saving settings
- [ ] Cleared browser cache and cookies
- [ ] Tested in incognito window
- [ ] Console shows successful OAuth flow

If all checkboxes are checked and it still doesn't work, there may be a different issue. Share the exact console error messages.
