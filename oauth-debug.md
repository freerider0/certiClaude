# OAuth Debug Guide

## Issue
The OAuth flow is failing at the `exchangeCodeForSession` step. A code is being received but the exchange fails.

## Debug Steps

### 1. Check Google Cloud Console Configuration

Go to https://console.cloud.google.com/apis/credentials and verify your OAuth 2.0 Client ID has these settings:

**Authorized redirect URIs** (must include ALL of these):
- `http://localhost:3000/api/auth/callback`
- `http://localhost:54321/auth/v1/callback`
- `http://127.0.0.1:54321/auth/v1/callback`

### 2. Check Supabase Dashboard

1. Go to http://localhost:54323 (Supabase Studio)
2. Navigate to Authentication > Providers
3. Check if Google is enabled and configured

### 3. Test Direct Supabase OAuth

Visit this URL in your browser:
```
http://localhost:3000/api/auth/test-oauth
```

This will test if Supabase can generate OAuth URLs directly.

### 4. Common Issues and Solutions

**Issue: "Redirect URI mismatch"**
- Solution: Add all redirect URIs listed above to Google Cloud Console

**Issue: "Invalid grant"**
- Solution: The code has expired or was already used. Try the flow again.

**Issue: "OAuth state parameter mismatch"**
- Solution: Clear cookies and try again. Make sure you're not mixing http/https.

### 5. Check Logs

Run your app with detailed logging:
```bash
DEBUG=* npm run dev
```

Then try the OAuth flow again and check the terminal output.

## Current Configuration

- Supabase URL: http://localhost:54321
- App URL: http://localhost:3000
- Redirect URI: http://localhost:3000/api/auth/callback
- Google Client ID: 586228879243-23u81t9n86vc3v0l1rdabeba1pk9ccfp.apps.googleusercontent.com