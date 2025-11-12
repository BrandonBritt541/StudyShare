# StudyShare MVP

A campus-only marketplace where students buy and sell used textbooks and school supplies. Access is restricted to verified `.edu` emails with school-local listings.

## 🎯 Key Features

- **Email+password signup/login** (.edu only)
- **School auto-mapping** from email domain
- **Listings** with search + filters
- **In-app messaging** between buyers and sellers
- **Notify-me bell** for unavailable items (14-day alerts)
- **Referral codes** (5-digit numeric, points-based)
- **Profile management** with Major, College Year, and referral info
- **Schedule uploads** (images only)
- **Admin/moderator views**
- **In-app analytics tracking**

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Forms/Validation:** React Hook Form + Zod
- **Auth:** Supabase Auth (email/password, .edu validation)
- **Database:** Supabase (Postgres, RLS, Storage, Realtime)
- **Search:** Postgres ILIKE + GIN index
- **CI/CD:** GitHub Actions → Vercel deployment
- **Tests:** Vitest + Playwright smoke tests
- **Package Manager:** pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 8+ ([install](https://pnpm.io/installation))
- **Git** ([download](https://git-scm.com/))
- **Supabase Account** ([sign up](https://supabase.com/))
- **GitHub Account** ([sign up](https://github.com/))

## 🚀 Local Setup (Step-by-Step for Beginners)

### Step 1: Clone the Repository

```bash
# Clone the repository to your computer
git clone https://github.com/BrandonBritt541/StudyShare.git
cd StudyShare

# Create and checkout the feature branch if it doesn't exist locally
git fetch origin
git checkout claude/studyshare-mvp-setup-011CV4QHSkNSyFfeChyS2BtM
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies using pnpm
pnpm install
```

This will install:
- Next.js and React
- Supabase client library
- Form handling (React Hook Form, Zod)
- TailwindCSS and styling utilities
- Testing frameworks (Vitest, Playwright)
- Linting and formatting tools (ESLint, Prettier)

### Step 3: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details and create the database
   - Wait for the database to initialize (2-3 minutes)

2. **Get your Supabase credentials:**
   - In your Supabase dashboard, go to **Settings → API**
   - Copy the **Project URL** and **Anon Key**

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local with your Supabase credentials
   nano .env.local  # or use your preferred editor
   ```

   Fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Step 4: Apply Database Migrations

The Supabase CLI will help you apply migrations to your database:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Initialize Supabase in your project (creates supabase/.env file)
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-id

# Apply all migrations to your database
supabase migration up

# Optional: View the Supabase dashboard to verify tables were created
# Go to https://app.supabase.com → Your Project → SQL Editor
```

Alternatively, if you prefer to apply migrations manually:

1. Go to your Supabase project → **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_triggers_and_functions.sql`
   - `supabase/migrations/003_rls_policies.sql`
   - `supabase/migrations/004_seed_schools.sql`
4. Click **Run** for each query

### Step 5: Start Development Server

```bash
# Start the Next.js development server
pnpm dev

# The app will be available at http://localhost:3000
```

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
StudyShare/
├── app/                      # Next.js App Router
│   ├── login/               # Login page
│   ├── signup/              # Sign up page
│   ├── listings/            # Browse listings
│   │   ├── new/            # Create listing
│   │   └── [id]/           # Listing detail
│   ├── messages/            # In-app messaging
│   ├── profile/             # User profile
│   │   ├── alerts/         # Notify-me alerts
│   │   ├── listings/       # My listings
│   │   └── schedules/      # Schedule uploads
│   ├── notifications/       # Notifications bell
│   └── admin/              # Admin dashboard
├── components/              # Reusable React components
├── lib/                    # Utility functions & Supabase config
├── types/                  # TypeScript type definitions
├── server/                 # Server actions & API routes
├── styles/                 # Global CSS
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
├── tests/                  # Unit & E2E tests
├── public/                 # Static assets
├── .github/workflows/      # CI/CD pipelines
├── .env.example            # Example environment variables
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
├── tailwind.config.ts      # TailwindCSS config
└── README.md              # This file
```

## 🔐 Authentication Flow

### Sign Up (.edu email only)

1. User enters email (must end in `.edu`) and password
2. Backend validates `.edu` domain
3. Supabase Auth creates user account
4. App extracts school from email domain (e.g., `@calpoly.edu` → Cal Poly SLO)
5. Profile record created with:
   - Auto-generated 5-digit referral code
   - Associated school
   - Default role: `student`

### Login

1. User enters email and password
2. Supabase Auth verifies credentials
3. Session token issued
4. User redirected to listings dashboard

### Logout

- Session cleared from client and Supabase

## 🗄️ Database Schema

### Core Tables

- **schools** - Campus information (domain-mapped)
- **profiles** - User profiles (first name, major, college year, referral code)
- **listings** - Item listings (photos, price, condition, course info)
- **message_threads** - Buyer-seller conversations
- **messages** - Individual messages with filtering
- **alerts** - Notify-me subscriptions (14-day expiry)
- **notifications** - Alert match notifications
- **user_schedules** - Uploaded class schedules
- **courses** - Course information per school
- **reports** - User reports for moderation
- **referrals** - Referral tracking for points

### Key Features

- **Row Level Security (RLS):** All data scoped to user's school
- **Triggers:** Auto-generate referral codes, match alerts to new listings
- **Indexes:** Optimized search and filtering on listings

See `supabase/migrations/` for complete schema.

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Auto-format code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # Run TypeScript type checking

# Testing
pnpm test             # Run unit tests (Vitest)
pnpm test:ui          # Run tests with UI
pnpm test:e2e         # Run E2E tests (Playwright)

# Database
pnpm supabase:migrate # Create new migration
```

## 🧪 Testing

### Unit Tests

```bash
pnpm test              # Run all tests once
pnpm test:ui           # Run tests with interactive UI
pnpm test --watch      # Run in watch mode
```

### E2E Tests

```bash
pnpm test:e2e          # Run Playwright tests
```

Test files are in the `tests/` directory.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions will:**
   - Run linting and type checks
   - Build the project
   - Run tests
   - Deploy to Vercel (if all checks pass)

### Manual Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in the project directory
3. Follow the prompts

### Environment Variables in Vercel

Add these in Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 🔑 Environment Variables

### Required for Development

```env
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase public key
```

### Optional

```env
SUPABASE_SERVICE_ROLE_KEY         # For server-side operations
NEXT_PUBLIC_APP_URL               # Application URL
NODE_ENV                          # development | production
```

## 📚 API & Utilities

### Supabase Client

```typescript
import { supabase } from '@/lib/supabase';

// Usage example:
const { data: listings, error } = await supabase
  .from('listings')
  .select('*')
  .eq('school_id', userSchoolId);
```

### Database Types

TypeScript types are defined in `types/database.ts` for full type safety.

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# On macOS/Linux: Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# On Windows: Use Task Manager or:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Supabase Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check Supabase project is active in dashboard
3. Verify your IP isn't blocked by Supabase firewall

### Migration Errors

```bash
# Reset database (⚠️ WARNING: Deletes all data)
supabase db reset

# Check migration status
supabase migration list
```

### pnpm Command Not Found

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)

## 📝 Development Guidelines

- **TypeScript:** Use strict mode, avoid `any`
- **Components:** Keep components small and focused
- **Database:** Always use parameterized queries
- **Security:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- **Testing:** Write tests for critical features
- **Commits:** Use clear, descriptive commit messages

## 🤝 Contributing

When making changes:

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Run tests: `pnpm test`
5. Create a pull request with description

## 📄 License

MIT License - See LICENSE file for details

## ✉️ Support

For issues and questions:
- GitHub Issues: [StudyShare Issues](https://github.com/BrandonBritt541/StudyShare/issues)
- Email: support@studyshare.dev

## 🗺️ MVP Checklist

- [ ] Email/password signup (only .edu emails accepted)
- [ ] School auto-mapped via domain
- [ ] User profile with Major and College Year
- [ ] Create, search, view listings
- [ ] In-app messaging between buyer and seller
- [ ] Notify-Me bell (14-day expiry, in-app notifications)
- [ ] Referral codes (auto-generate, points increment)
- [ ] Schedule image uploads
- [ ] All content scoped to user's school
- [ ] CI/CD + Supabase migrations functional