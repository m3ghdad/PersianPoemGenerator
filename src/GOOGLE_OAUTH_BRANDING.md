# Customize Google OAuth Branding

## The Issue

Google shows: "Choose an account to continue to **pspybykovwrfdxpkjpzd.supabase.co**"

This domain cannot be changed to `rubatar.com` because it's the OAuth callback URL required by Supabase.

## Solution: Improve the OAuth Consent Screen

You can make Google display your app name and logo more prominently, so users focus on that instead of the domain.

### Step 1: Configure OAuth Consent Screen

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials/consent

2. **Click "EDIT APP"** (or "OAuth consent screen" in the left menu)

3. **Configure these fields**:

   **App name**: 
   ```
   Rubatar - Persian Poetry
   ```
   (This will be displayed prominently)

   **User support email**: 
   ```
   your-email@gmail.com
   ```
   (Your contact email)

   **App logo** (Optional but highly recommended):
   - Upload a 120x120px logo for your app
   - This makes it look much more professional
   - Users will see your logo instead of a generic icon

   **Application home page** (Optional):
   ```
   https://rubatar.com
   ```

   **Application privacy policy link** (Optional):
   ```
   https://rubatar.com/privacy
   ```

   **Application terms of service link** (Optional):
   ```
   https://rubatar.com/terms
   ```

   **Authorized domains**:
   Add both:
   ```
   rubatar.com
   supabase.co
   ```

4. **Click "SAVE AND CONTINUE"**

5. **Scopes** (next screen):
   - The default scopes are fine
   - You need: `email`, `profile`, `openid`
   - Click "SAVE AND CONTINUE"

6. **Test users** (if app is in testing mode):
   - Add test user emails if needed
   - Click "SAVE AND CONTINUE"

### What Users Will See After This

Instead of just:
```
Choose an account to continue to pspybykovwrfdxpkjpzd.supabase.co
```

Users will see:
```
[Your Logo]
Rubatar - Persian Poetry wants to access your Google Account

Choose an account to continue to pspybykovwrfdxpkjpzd.supabase.co
```

The app name and logo will be much more prominent, making the domain less noticeable.

### Step 2: Verify Your Domain (Advanced - Optional)

1. Go to: https://console.cloud.google.com/apis/credentials/domainverification

2. Click **"Add Domain"**

3. Add `rubatar.com`

4. Follow the verification steps (add a TXT record to your DNS)

5. Once verified, Google will show:
   ```
   Choose an account to continue to rubatar.com
   ```
   BUT this only works if you set up a custom domain for Supabase (see Option 2 below)

## Option 2: Custom Domain for Supabase (Advanced)

If you want to completely hide the Supabase domain, you can set up a custom domain like `auth.rubatar.com` that points to your Supabase project.

### Requirements:
- Access to your domain's DNS settings
- Supabase Pro plan (custom domains are a Pro feature)
- SSL certificate setup

### Steps:

1. **Go to Supabase Dashboard**:
   - https://supabase.com/dashboard/project/pspybykovwrfdxpkjpzd/settings/general

2. **Scroll to "Custom Domain"**

3. **Add custom domain**:
   ```
   auth.rubatar.com
   ```

4. **Follow Supabase's instructions** to:
   - Add DNS records (CNAME)
   - Verify domain ownership
   - Wait for SSL certificate provisioning

5. **Update Google OAuth Settings**:
   - Change the Authorized redirect URI to:
     ```
     https://auth.rubatar.com/auth/v1/callback
     ```

6. **Update Supabase Auth Settings**:
   - Site URL: `https://rubatar.com`
   - Redirect URLs: `https://rubatar.com`

After this setup, Google will show:
```
Choose an account to continue to auth.rubatar.com
```

Which is much better than the Supabase subdomain!

## Recommendation

**For now**: Use Option 1 (customize the consent screen with your app name and logo)
- It's free and quick
- Makes a huge difference in how professional your app looks
- Users will focus on your branding, not the domain

**Later**: Consider Option 2 (custom domain) if you upgrade to Supabase Pro
- Completely removes the Supabase branding
- Gives you full control over the user experience

## Important Notes

1. **The domain shown is the OAuth callback URL** - it cannot be `rubatar.com` directly because Supabase handles the OAuth callback

2. **Users don't actually see the Supabase domain for long** - after signing in with Google, they're immediately redirected to `rubatar.com`

3. **A good app name and logo** make much more difference than the domain in building user trust

4. **Most professional apps** use a subdomain for auth (like `auth.example.com` or `accounts.example.com`)
