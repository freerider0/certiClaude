# CertiFast

Plataforma profesional para agencias inmobiliarias. Genera certificados CEE y crea planos profesionales.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Internationalization**: next-intl
- **Drawing Engine**: Konva.js + WASM (Boost.Geometry)
- **Payments**: Stripe
- **State Management**: Zustand (drawing tool), React Query (server state)
- **Forms**: React Hook Form + Zod

## 🌍 Supported Languages

- 🇪🇸 Español (default)
- Català
- Euskera
- Galego

## 📁 Project Structure

```
src/
├── app/
│   └── [locale]/          # Internationalized routes
│       ├── layout.tsx
│       ├── page.tsx
│       └── dashboard/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── property/         # Property-related components
│   ├── drawing/          # Drawing tool components
│   ├── order/            # Order management components
│   └── auth/             # Authentication components
├── i18n/                 # Internationalization config
│   ├── routing.ts
│   ├── navigation.ts
│   └── request.ts
├── lib/
│   └── supabase/         # Supabase utilities
└── messages/             # Translation files
    ├── es.json
    ├── ca.json
    ├── eu.json
    └── gl.json
```

## 🛠️ Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in your environment variables:
   - Supabase project URL and keys
   - Stripe keys
   - App URL

5. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📦 Key Features

- **CEE Certificate Generation**: Professional energy certificate creation
- **Floor Plan Drawing**: Advanced drawing tool with WASM-powered geometry engine
- **Multi-language Support**: Full support for Spanish regional languages
- **Agency Management**: Comprehensive tools for real estate agencies
- **Secure Authentication**: Supabase Auth with row-level security
- **Payment Processing**: Integrated Stripe payments

## 🏗️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint
```

## 📝 License

Private - All rights reserved
