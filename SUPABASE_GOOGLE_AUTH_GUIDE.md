# Supabase Google OAuth Integration Guide for Next.js

This guide provides a complete walkthrough for integrating Google OAuth authentication with Supabase in a Next.js application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Supabase Dashboard Configuration](#supabase-dashboard-configuration)
4. [Next.js Implementation](#nextjs-implementation)
5. [URL Configuration Reference](#url-configuration-reference)
6. [Testing and Troubleshooting](#testing-and-troubleshooting)

## Prerequisites

- A Google Cloud account
- A Supabase project
- A Next.js application
- Basic understanding of OAuth 2.0 flow

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown in the top bar
3. Click "New Project"
4. Enter your project name and click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: Your application name
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email` and `profile` (minimum required)
   - Save and continue

### Step 4: Configure OAuth Client

1. After consent screen setup, create OAuth client ID:
   - Application type: "Web application"
   - Name: "Your App Name - Supabase"
   
2. Add Authorized JavaScript origins:
   ```
   https://your-project-ref.supabase.co
   http://localhost:3000
   https://your-production-domain.com
   ```

3. Add Authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```

4. Click "Create" and save your credentials:
   - **Client ID**: `your-client-id.apps.googleusercontent.com`
   - **Client Secret**: `your-client-secret`

## Supabase Dashboard Configuration

### Step 1: Access Authentication Settings

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"

### Step 2: Enable Google Provider

1. Find "Google" in the providers list
2. Toggle it to enable
3. Enter your Google OAuth credentials:
   - **Client ID**: The Client ID from Google Cloud Console
   - **Client Secret**: The Client Secret from Google Cloud Console
4. The callback URL will be automatically set to:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
5. Click "Save"

### Step 3: Configure Auth Settings

1. Go to "Authentication" > "URL Configuration"
2. Set your Site URL:
   ```
   http://localhost:3000 (for development)
   https://your-production-domain.com (for production)
   ```
3. Add redirect URLs (URLs where users can be redirected after auth):
   ```
   http://localhost:3000/*
   https://your-production-domain.com/*
   ```

## Next.js Implementation

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Step 2: Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create Supabase Client

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 4: Implement Google Login

Create a login component `src/components/auth/google-login.tsx`:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function GoogleLogin() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Error logging in with Google:', error)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google SVG icon */}
      </svg>
      Continue with Google
    </button>
  )
}
```

### Step 5: Create Auth Callback Route

Create `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

### Step 6: Protect Routes

Create middleware `src/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## URL Configuration Reference

### Google Cloud Console URLs

| Setting | URL/Value | Where to Find |
|---------|-----------|---------------|
| OAuth Consent Screen | `https://console.cloud.google.com/apis/credentials/consent` | APIs & Services > OAuth consent screen |
| Credentials Page | `https://console.cloud.google.com/apis/credentials` | APIs & Services > Credentials |
| Client ID | `your-client-id.apps.googleusercontent.com` | After creating OAuth 2.0 Client ID |
| Client Secret | `your-client-secret` | After creating OAuth 2.0 Client ID |

### Supabase URLs

| Setting | URL/Value | Where to Find |
|---------|-----------|---------------|
| Project URL | `https://your-project-ref.supabase.co` | Project Settings > API |
| Anon Key | `eyJ...` | Project Settings > API > Project API keys |
| Callback URL | `https://your-project-ref.supabase.co/auth/v1/callback` | Authentication > Providers (auto-generated) |

### Application URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `http://localhost:3000` | Local development |
| Production | `https://your-domain.com` | Production deployment |
| Auth Callback | `/auth/callback` | OAuth callback endpoint |

## Testing and Troubleshooting

### Common Issues and Solutions

1. **"Redirect URI mismatch" error**
   - Ensure the callback URL in Google Console matches exactly with Supabase
   - Check for trailing slashes
   - Verify HTTP vs HTTPS protocol

2. **"Invalid client" error**
   - Double-check Client ID and Secret in Supabase dashboard
   - Ensure Google+ API is enabled in Google Cloud Console

3. **User not redirected after login**
   - Verify the `redirectTo` parameter in `signInWithOAuth`
   - Check if the redirect URL is in the allowed list in Supabase

4. **Session not persisting**
   - Ensure cookies are being set correctly
   - Check middleware configuration
   - Verify server/client component usage

### Testing Checklist

- [ ] Google Cloud Project created and configured
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created with correct redirect URIs
- [ ] Supabase Google provider enabled with correct credentials
- [ ] Environment variables set in Next.js
- [ ] Auth callback route implemented
- [ ] Login flow works in development
- [ ] Login flow works in production
- [ ] User session persists across page refreshes
- [ ] Protected routes redirect unauthenticated users

## Security Best Practices

1. **Never expose your Client Secret** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Implement CSRF protection** for auth endpoints
4. **Validate redirect URLs** to prevent open redirect vulnerabilities
5. **Use HTTPS** in production for all auth-related endpoints
6. **Implement rate limiting** on auth endpoints
7. **Log authentication events** for security monitoring

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)