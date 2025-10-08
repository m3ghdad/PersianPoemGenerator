# Google OAuth Diagnostic Guide

## What I Fixed

The issue was that after Google OAuth redirected back to your app with tokens in the URL hash (`#access_token=...&refresh_token=...`), the app wasn't properly extracting and using those tokens to establish a Supabase session.

### The Fix

I updated `AuthContext.tsx` to:
1. **Detect OAuth redirect**: Check if the URL has `access_token` or `refresh_token` in the hash
2. **Extract tokens**: Parse the hash parameters properly
3. **Establish session**: Use `supabase.auth.setSession()` to create the session from the tokens
4. **Clean up URL**: Remove the hash after successful login

## How to Test

### 1. Deploy the Updated Code
Make sure you deploy the latest version with the OAuth fixes.

### 2. Verify Supabase Configuration

Go to https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/auth/url-configuration

Check these EXACT settings:

**Site URL:**
```
https://rubatar.com
```
(NO trailing slash, NO http, MUST be https)

**Redirect URLs (Additional Redirect URLs):**
```
https://rubatar.com
http://localhost:5173
http://localhost:3000
```
(Add each URL separately, click "Add URL" for each one)

### 3. Test in Incognito Window

1. Open a new incognito/private window
2. Press F12 to open browser console
3. Go to https://rubatar.com
4. Click the settings button (top right)
5. Click "ورود با گوگل" (Continue with Google)
6. Complete Google sign-in

### 4. Watch the Console

You should see these messages in the console:

**When clicking Google button:**
```
🚀 Starting Google OAuth flow...
📍 Current URL: https://rubatar.com
🏠 Hostname: rubatar.com
🔄 Redirect URL: https://rubatar.com
✅ OAuth redirect initiated
```

**After Google redirects back:**
```
🔐 PKCE OAuth redirect detected! Exchanging code for session...
Code found in query params
✅ PKCE OAuth session established successfully!
✅ User email: your-email@gmail.com
✅ User ID: user-id
Auth state change: SIGNED_IN user-id
```

**If you see this instead:**
```
❌ OAuth session error: [error message]
```
Then copy the error message and we'll debug from there.

## Common Issues

### Issue 1: "requested path is invalid"
**Solution**: The Redirect URL in Supabase doesn't match. Make sure it's EXACTLY `https://rubatar.com` with no trailing slash.

### Issue 2: No console messages after redirect
**Solution**: 
1. Clear browser cache and cookies completely
2. Wait 2-3 minutes after changing Supabase settings
3. Try again in a fresh incognito window

### Issue 3: "redirect_uri_mismatch" from Google
**Solution**: Add the Supabase callback URL to Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add to Authorized redirect URIs: `https://pspybykovwrfdxpkjpzd.supabase.co/auth/v1/callback`
4. Save

### Issue 4: Console shows OAuth detected but no session
**Solution**: This means the tokens are invalid or expired:
1. Check that Google OAuth is enabled in Supabase (Authentication → Providers → Google)
2. Verify Client ID and Secret are correct
3. Try revoking access at https://myaccount.google.com/permissions
4. Sign in again

## What Changed in the Code

### Before (Not Working):
```typescript
// Only checked for implicit flow tokens in URL hash
// Didn't handle PKCE flow with code in query params
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');
```

### After (Working):
```typescript
// FIRST: Check for PKCE flow (Supabase default - more secure)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Exchange the authorization code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  // Session is now established!
}

// FALLBACK: Also check for implicit flow (less common)
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');

if (accessToken && refreshToken) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
}
```

**Key Change**: Supabase uses PKCE (Authorization Code flow) by default. The callback URL contains `?code=...` not `#access_token=...`. The code must be exchanged for tokens using `exchangeCodeForSession()`.

## Next Steps

1. **Deploy** the updated code
2. **Wait** 2-3 minutes for Supabase settings to propagate
3. **Test** in incognito with console open
4. **Report back** what console messages you see

The Permissions-Policy warning about 'browsing-topics' is just a browser warning from Google and doesn't affect OAuth functionality - you can ignore it.
