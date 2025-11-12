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

## 🎓 Module 2: Authentication & Profile Management (Module 2 Additions)

### Session Persistence

StudyShare now uses Supabase Auth Helpers with automatic session persistence. Sessions are stored in browser storage and automatically restored on page reload.

**How it works:**
- Browser client (`lib/supabase-browser.ts`) enables `persistSession: true`
- `SessionProvider` wraps the app and listens for auth state changes
- Middleware redirects unauthenticated users to `/login`
- Sessions automatically refresh when they expire

**If you see "Session expired" errors:**
1. Clear browser cookies: Open DevTools → Application → Cookies → Delete all studyshare/localhost cookies
2. Reload the page
3. Login again
4. The session should now persist across page reloads

**Testing session persistence:**
1. Login with `.edu` email
2. Close the browser tab (don't quit the browser)
3. Open a new tab and navigate to http://localhost:3000/profile
4. **Expected:** You should still be logged in (no redirect to /login)
5. Reload the page
6. **Expected:** Session persists after reload
7. Click "Log Out" to clear session

### Managing Majors

Majors are now stored in the database and managed via Admin panel.

**Admin: How to add majors**

1. **Log in as admin** (requires `role='admin'` in profiles table)
   - Contact database admin to set your role to 'admin'
   - Or manually update in Supabase:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE email = 'your-email@school.edu';
     ```

2. **Go to Admin Panel:**
   - Navigate to http://localhost:3000/admin
   - Click "Majors" card

3. **Add majors via form:**
   - Type major name: `Data Science`
   - Click "Add"
   - Repeat for each major

4. **Or seed dev majors via SQL:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/seed/dev_insert_majors.sql`
   - Run the query
   - ~20 common majors will be inserted

5. **Toggle majors on/off:**
   - Click "Deactivate" to hide from dropdown
   - Click "Activate" to show in dropdown
   - Delete removes the major entirely

6. **Verify majors appear in dropdown:**
   - Go to `/profile/setup`
   - Click "Major" dropdown
   - Should list majors alphabetically

### Changing Passwords

Users can change their password while logged in.

**How to change password:**
1. Login to your account
2. Click menu or go to `/profile/settings`
3. Click "Change Password"
4. Enter new password (min 8 characters)
5. Confirm password
6. Click "Change Password"
7. **Expected:** Redirects to profile, password updated

### Profile Settings

Users can now edit profile information after signup.

**How to edit profile:**
1. Login
2. Go to `/profile/settings` or click "Settings" in profile menu
3. Edit:
   - First Name / Last Initial
   - Major (from dropdown)
   - College Year
   - Graduation Year (optional)
4. Click "Complete Profile Setup"
5. Changes saved to database

### Logout

Users can now logout securely.

**How to logout:**
1. Go to `/profile/settings`
2. Scroll to "Session" section
3. Click "Log Out"
4. Confirm logout
5. **Expected:** Redirected to login page, session cleared

---

## 🧪 Module 2 Testing Checklist

### Test Majors Management

- [ ] Login as admin user
- [ ] Navigate to http://localhost:3000/admin/majors
- [ ] Add 5 majors via form (e.g., Data Science, Mechanical Engineering, etc.)
- [ ] Verify majors appear in table with "Active" status
- [ ] Create new user account with .edu email
- [ ] Complete profile setup
- [ ] In "Major" dropdown, verify 5 majors appear alphabetically
- [ ] Deactivate one major (e.g., "Data Science")
- [ ] Create another new account
- [ ] In dropdown, verify deactivated major is gone
- [ ] Activate the major again
- [ ] Verify it reappears in dropdown

### Test Session Persistence

- [ ] Login with valid .edu email (e.g., testuser@calpoly.edu / TestPassword123)
- [ ] Navigate to `/profile`
- [ ] **Verify:** You see your profile info (not redirected to login)
- [ ] Reload the page (Ctrl+R or Cmd+R)
- [ ] **Verify:** Still logged in, profile still visible
- [ ] Close this browser tab (not the whole browser)
- [ ] Open a new tab
- [ ] Navigate to http://localhost:3000/listings
- [ ] **Verify:** Still logged in (not redirected to login)
- [ ] Open DevTools → Application → Cookies
- [ ] Delete all cookies for localhost
- [ ] Reload the page
- [ ] **Verify:** Redirected to login page

### Test Change Password

- [ ] Login with user email (e.g., testuser@calpoly.edu / TestPassword123)
- [ ] Go to `/profile/settings`
- [ ] Click "Change Password"
- [ ] Enter new password: `NewPassword123`
- [ ] Confirm: `NewPassword123`
- [ ] Click "Change Password"
- [ ] **Verify:** Success message shows, redirects to profile
- [ ] Go to `/profile/settings` again
- [ ] Click "Log Out"
- [ ] Login with same email and OLD password (TestPassword123)
- [ ] **Verify:** "Unauthorized" error (password changed)
- [ ] Login with new password (NewPassword123)
- [ ] **Verify:** Login successful

### Test Logout

- [ ] Login with .edu email
- [ ] Go to `/profile/settings`
- [ ] Scroll to "Session" section
- [ ] Click "Log Out"
- [ ] Confirm logout
- [ ] **Verify:** Redirected to login page
- [ ] Navigate to `/listings`
- [ ] **Verify:** Redirected to login page

---

## 📝 Session Persistence: How It Works

### Technical Details

1. **Browser Client** (`lib/supabase-browser.ts`):
   ```typescript
   persistSession: true     // Store auth session in storage
   autoRefreshToken: true   // Auto-refresh tokens before expiry
   detectSessionInUrl: true // Detect session from URL (OAuth)
   ```

2. **SessionProvider** (`lib/session-context.tsx`):
   - Wraps entire app in RootLayout
   - Listens to `onAuthStateChanged` events
   - Provides `useSession()` hook to components

3. **Middleware** (`middleware.ts`):
   - Redirects `/login` and `/signup` if authenticated
   - Redirects protected routes (`/listings`, `/profile`, etc.) if not authenticated
   - Checks for Supabase session cookies

4. **Server Actions**:
   - Auth actions (`server/actions/auth.ts`) use Supabase server client
   - Sessions handled by Supabase automatically
   - Cookies set/cleared by Supabase Auth

### Why Sessions Might Expire

- Supabase JWT expires (usually 1 hour)
- Browser local storage cleared
- Cookies deleted
- Token revoked on server
- Cross-site request restrictions

### Fixing Session Issues

1. **Session shows as logged out when it shouldn't:**
   - Clear browser cookies: `Application → Cookies → Delete all`
   - Clear local storage: `Application → Local Storage → Clear`
   - Refresh page

2. **Getting redirected to login unexpectedly:**
   - Check `.env.local` has correct Supabase URL and keys
   - Check Supabase project is active (not paused)
   - Check browser allows cookies (enable 3rd party cookies if needed)

3. **Session doesn't persist after page reload:**
   - Cookies might be blocked; check browser settings
   - Private/Incognito mode: Use regular browsing mode
   - Clear site data and try again

---

## ✉️ Support

For issues and questions:
- GitHub Issues: [StudyShare Issues](https://github.com/BrandonBritt541/StudyShare/issues)
- Email: support@studyshare.dev

## 📦 Module 3: Listings, Search & Notify-Me Bell

### New Features

- **Create & Manage Listings** - Sellers can create listings with images, price, condition, and optional course info
- **Browse with Search** - Full-text search on listing titles
- **Listings Grid** - Cards showing image, price, quality, type, seller info
- **Listing Detail Page** - Full view with image gallery, all metadata, seller info, and contact buttons
- **Notify-Me Alerts** - Subscribe to searches, get notified for 14 days when new listings match
- **Notifications Page** - View all notifications, mark as read, navigate to listings
- **Notification Bell** - Header icon with unread count, polls every 30 seconds

### Key Implementation Details

**Listings CRUD:**
- Create: `POST /api/listings/create` (server action)
- Read: `GET /api/listings/search` with filters
- Update: `PATCH /api/listings/:id` (seller only)
- Delete: `DELETE /api/listings/:id` (seller only)

**Image Upload:**
- Client-side compression using Canvas API
- Max 6 images per listing, ≤5MB each
- Supports JPG, PNG, WEBP
- Automatic scaling to 1200x1200px, 0.8 JPEG quality

**Search & Filters:**
- Full-text search on title
- Filter by: type, quality, major, course code, professor, price range
- Sort by: newest, relevance, price_asc, price_desc
- Pagination: 12 listings per page

**Alert System:**
- 14-day subscription window
- Matches on title contains query (case-insensitive)
- SQL trigger fires on new listing insert
- Auto-creates notifications for all matching alerts

**RLS Policies:**
- Users can only see listings from their school
- Users can only create listings for their school
- Users can only edit/delete their own listings

### Supabase Storage Setup

**Create listing-images bucket in Supabase Dashboard:**

1. Go to Supabase Dashboard → Your Project → Storage
2. Click "Create a new bucket"
3. Name: `listing-images`
4. Privacy: **Public**
5. Click "Create bucket"
6. Go to "Policies" tab in the bucket
7. Add policy:
   ```sql
   CREATE POLICY "Users can upload their own listing images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     auth.uid() = owner AND
     bucket_id = 'listing-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );

   CREATE POLICY "Anyone can view listing images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'listing-images');

   CREATE POLICY "Users can delete their own listing images"
   ON storage.objects FOR DELETE
   USING (
     auth.uid() = owner AND
     bucket_id = 'listing-images'
   );
   ```

---

## 🧪 Module 3 Testing Checklist

### Test Creating Listings

- [ ] Login with .edu email
- [ ] Navigate to `/listings/new`
- [ ] Fill in listing form:
  - Title: "Physics Textbook"
  - Description: "Used for Physics 101"
  - Type: "textbook"
  - Quality: "good"
  - Price: "45.99"
  - Course Code: "PHYS 101"
  - Professor: "Dr. Smith"
  - Major: "Physics"
- [ ] Upload 2-3 images (JPG/PNG/WEBP)
- [ ] Click "Create Listing"
- [ ] **Verify:** Redirected to `/listings`, listing appears in grid
- [ ] Click on the listing card
- [ ] **Verify:** Redirected to `/listings/[id]`, all details visible

### Test Listing Detail Page

- [ ] Navigate to any listing detail page
- [ ] **Verify:** Image gallery shows with thumbnail navigation
- [ ] Click on different thumbnail images
- [ ] **Verify:** Main image updates
- [ ] **Verify:** All metadata displayed:
  - Title, price, condition, type, course code
  - Description (if provided)
  - Course title, professor, major (if provided)
  - Posted time
- [ ] **Verify:** Seller card shows:
  - Seller name with initial avatar
  - College year
  - Major
  - Referral code
- [ ] Click "Message Seller" button
- [ ] **Verify:** Alert shows "Messaging feature coming soon!"
- [ ] Click "Back to Listings"
- [ ] **Verify:** Returns to browse page

### Test Search & Notify-Me

- [ ] Go to `/listings`
- [ ] Search for "textbook"
- [ ] **Verify:** Results show only textbook listings
- [ ] Search for "nonexistent item xyz"
- [ ] **Verify:** No results shown, "Notify Me" button appears
- [ ] Click "Notify Me"
- [ ] **Verify:** Alert shows "Subscribed! You'll be notified when someone lists 'nonexistent item xyz'"
- [ ] Go to `/profile/alerts`
- [ ] **Verify:** Alert appears with:
  - Query text: "nonexistent item xyz"
  - Days remaining: ~14
  - Progress bar showing 100% (14/14 days)
- [ ] Search for another nonexistent item
- [ ] Create Notify-Me alert
- [ ] **Verify:** Second alert appears in list
- [ ] Delete one alert by clicking "Delete"
- [ ] **Verify:** Alert removed from list

### Test Notifications & Alert Matching

- [ ] Create a Notify-Me alert for "Python textbook"
- [ ] Go to `/listings/new`
- [ ] Create a listing with title "Python textbook for sale"
- [ ] Submit listing
- [ ] Go to `/notifications`
- [ ] **Verify:** Notification appears with:
  - 🔔 icon
  - Message: "New listing matches your alert: Python textbook for sale"
  - "View Listing" button
- [ ] Click "View Listing"
- [ ] **Verify:** Navigates to the listing detail page
- [ ] Go back to `/notifications`
- [ ] **Verify:** Notification still shows with "Mark Read" button
- [ ] Click "Mark Read"
- [ ] **Verify:** Notification changes color (no longer highlighted)
- [ ] Click notification bell in header
- [ ] **Verify:** Unread count decreases by 1
- [ ] **Verify:** Navigates to `/notifications` page

### Test Notification Bell

- [ ] Create 3 Notify-Me alerts
- [ ] Go to `/listings/new`
- [ ] Create 3 listings that match the alerts
- [ ] Go to header
- [ ] **Verify:** Bell icon shows "3" badge
- [ ] Click bell
- [ ] **Verify:** Navigates to `/notifications`
- [ ] **Verify:** 3 unread notifications displayed
- [ ] Click "Mark All as Read"
- [ ] Go back to header
- [ ] **Verify:** Bell icon shows no badge (or 0)

### Test Filtering & Sorting

- [ ] Go to `/listings`
- [ ] Create multiple listings with different:
  - Types: textbook, notes, supplies
  - Quality: new, like_new, good, fair
  - Prices: $10, $25, $50, $100
  - Majors: CS, Physics, Biology
- [ ] Search for a common word in titles (e.g., "book")
- [ ] **Verify:** Only listings with that word appear
- [ ] Sort by "Price: Low to High"
- [ ] **Verify:** Listings ordered by price ascending
- [ ] Sort by "Price: High to Low"
- [ ] **Verify:** Listings ordered by price descending
- [ ] Sort by "Newest"
- [ ] **Verify:** Most recently created listings first

### Test RLS & School Isolation

- [ ] Create account with @calpoly.edu email
- [ ] Create a listing
- [ ] Note the listing ID
- [ ] **Verify:** Can see the listing on browse page
- [ ] Create a second account with different domain (e.g., @berkeley.edu if available, or use different school)
- [ ] **Verify:** Cannot see the Cal Poly listing on browse page
- [ ] Try accessing listing directly via URL: `/listings/[cal-poly-listing-id]`
- [ ] **Verify:** "Listing not found" error or no access

### Test Error Handling

- [ ] Upload image >5MB
- [ ] **Verify:** Error message shown
- [ ] Upload non-image file
- [ ] **Verify:** Error message shown
- [ ] Create listing without title
- [ ] **Verify:** Form validation error
- [ ] Create listing with price -$10
- [ ] **Verify:** Validation error
- [ ] Search for very long string (500+ chars)
- [ ] **Verify:** Graceful handling, no crash

---

## 💬 Module 4: Messaging System

### New Features

- **Message Threads** - One unique thread per buyer-listing pair, reuses existing thread
- **Inbox Page** (`/messages`) - Lists all threads sorted by most recent message
- **Thread Detail Page** (`/messages/[threadId]`) - Real-time chat with message history
- **Message Composer** - Text input with quick replies and multiline support
- **Unread Badges** - Shows unread message count on each thread and in header bell
- **Profanity Filter** - Auto-redacts profanity words (doesn't block messages)
- **Reporting** - Report users or messages from the thread menu
- **Real-time Updates** - Messages append in real-time via Supabase subscriptions
- **Message Bell** - Header icon showing total unread message count with polling

### Key Implementation Details

**Thread Model:**
- One thread per buyer-listing pair (unique constraint on buyer_id, listing_id)
- Reuses existing thread if buyer messages the same listing again
- Tracks last_message_at via trigger on message insert

**Message Composer:**
- Multiline text input with Shift+Enter for new lines, Enter to send
- Quick reply buttons: "Is this still available?", "Can you meet on campus?", etc.
- Info text: "Phone numbers, emails, and payment info are OK to share in chat"

**Profanity Filter:**
- Server-side word redaction (replaces with asterisks)
- Does NOT block messages, just sanitizes them
- Allows phone/email sharing

**RLS Policies:**
- Users can only read/write messages in threads they're part of
- Prevents unauthorized access to other threads
- School isolation is enforced through user's school_id

**Unread Tracking:**
- Messages marked is_read=false on insert
- Mark thread as read when user opens thread
- Aggregate unread count from unread messages from other participants

**Realtime:**
- Supabase Realtime subscription on messages table filtered by thread_id
- Messages append to chat in real-time as they're received
- Scroll to bottom on new message arrival

**Notifications:**
- New notification created (type='new_message') when message is sent
- Includes sender name, thread ID, listing ID, message preview
- Notification bell polls every 20 seconds for unread message count

### Server Actions

- `createOrGetThread(listingId, sellerId)` - Create or reuse thread, validate permissions
- `sendMessage(threadId, body)` - Send message, apply profanity filter, create notification
- `getMessages(threadId)` - Get all messages in thread with sender profile
- `getThreads()` - Get inbox threads with unread count per thread
- `markThreadAsRead(threadId)` - Mark other participant's messages as read
- `getUnreadMessageCount()` - Get total unread count across all threads
- `reportMessage(messageId, reason)` - Create message report
- `reportUser(userId, reason)` - Create user report

---

## 🧪 Module 4 Testing Checklist: Messaging System

### Test Setup (Two Users)

First, set up two test users in different browsers:

**User A (Seller):**
- Create account with email like `seller@calpoly.edu`
- Complete profile setup
- Create a test listing (e.g., "Physics Textbook - $30")

**User B (Buyer):**
- Create account with email like `buyer@calpoly.edu`
- Complete profile setup
- Keep this browser tab open

### Test Message Thread Creation

- [ ] User B navigates to User A's listing
- [ ] User B clicks "Message Seller"
- [ ] **Verify:** Redirected to `/messages/[threadId]` with message composer
- [ ] User B types first message: "Hi, is this still available?"
- [ ] User B clicks "Send"
- [ ] **Verify:** Message appears immediately in chat
- [ ] User B clicks quick reply "Can you meet on campus?"
- [ ] **Verify:** Sends message without manual typing
- [ ] User B refreshes the page
- [ ] **Verify:** Messages persist, chat history visible

### Test Inbox and Thread List

- [ ] User A switches to their browser
- [ ] User A navigates to `/messages`
- [ ] **Verify:** Thread from User B appears at top with:
  - Listing thumbnail from the item
  - Listing title
  - "buyer@calpoly.edu" name or "Buyer" label
  - Last message preview: "Hi, is this still available?"
  - Unread badge showing "2" (two unread messages)
- [ ] User A clicks on the thread
- [ ] **Verify:** Opens conversation view with all 2 messages from User B
- [ ] **Verify:** Unread badge disappears after viewing
- [ ] User A types reply: "Yes, still available. Meet tomorrow?"
- [ ] User A sends message
- [ ] Switch to User B's browser (keep open from before)
- [ ] **Verify:** New message appears in real-time without refresh
- [ ] User B's unread badge increments (now 1 unread message from User A)

### Test Unread Message Badge in Header

- [ ] User B at `/messages` page, unread badge shows "1"
- [ ] User B clicks message bell in header (should navigate to /messages)
- [ ] **Verify:** Bell shows "1" badge
- [ ] User B opens the thread with User A
- [ ] **Verify:** Badge disappears when thread is marked as read
- [ ] Return to User A's browser
- [ ] User A sends 3 new messages quickly
- [ ] **Verify:** User B's bell shows "3" badge
- [ ] Wait ~20 seconds (polling interval)
- [ ] **Verify:** Bell updates with correct count

### Test Profanity Filtering

- [ ] User B sends message with profanity: "This textbook is shit quality"
- [ ] Message sends successfully (no block)
- [ ] **Verify:** User A sees redacted version: "This textbook is *** quality"
- [ ] User A sends: "What the hell?"
- [ ] **Verify:** User B sees: "What the ****?"

### Test Quick Replies

- [ ] User A types nothing and clicks quick reply: "Is this still available?"
- [ ] **Verify:** Message appears immediately
- [ ] Click another quick reply: "What condition is it in?"
- [ ] **Verify:** Sends without manual typing
- [ ] Verify quick replies disappear after first real message is sent

### Test Report Functionality

- [ ] User B opens thread with User A
- [ ] User B clicks "⋮ More" button in header
- [ ] **Verify:** Menu shows "Report user..." and "Report message..."
- [ ] Click "Report user..."
- [ ] Type reason: "Unresponsive seller"
- [ ] Click "Submit Report"
- [ ] **Verify:** Alert shows "Report submitted. Our team will review it shortly."
- [ ] Go to Supabase dashboard → SQL Editor
- [ ] Run: `SELECT * FROM reports WHERE target_type='user';`
- [ ] **Verify:** Row exists with reporter_id, target_id, reason

### Test Thread Reuse

- [ ] User B navigates back to the same listing
- [ ] User B clicks "Message Seller" again
- [ ] **Verify:** Same thread opens (URL is the same)
- [ ] **Verify:** Message history still visible
- [ ] User B sends new message: "Are you still selling?"
- [ ] **Verify:** Appends to same thread, doesn't create duplicate

### Test Thread Isolation & RLS

- [ ] User C creates third account at same school
- [ ] User C tries to access User A↔User B thread directly: `/messages/[threadId-from-A-and-B]`
- [ ] **Verify:** Gets error or "Thread not found" (RLS blocks access)
- [ ] Check network tab: Query returns 0 results due to RLS policy

### Test Error Handling

- [ ] User B sends empty message (just spaces)
- [ ] **Verify:** Error shows "Message cannot be empty"
- [ ] User B sends 5100 characters (over limit)
- [ ] **Verify:** Error shows "Message too long (max 5000 characters)"
- [ ] Close browser and reopen in private window
- [ ] Try accessing `/messages/[threadId]` without logging in
- [ ] **Verify:** Redirected to login page
- [ ] Login and try again
- [ ] **Verify:** Can access thread if user is participant

### Test Mobile/UX

- [ ] Open thread on mobile (use browser dev tools → Toggle device toolbar)
- [ ] **Verify:** Composer sticks to bottom
- [ ] Verify message bubbles don't overflow screen width
- [ ] **Verify:** Quick replies wrap properly on small screens
- [ ] Verify timestamps are readable

---

## 🎁 Module 5: Referrals & Points System

### New Features

- **First-Login Referral Modal** - Shows on profile confirmation after signup
- **Referral Code Input** - 5-digit numeric code validation
- **Points Tracking** - Users earn 5 points when someone uses their code
- **Profile Referral Section** - Display referral code with copy button and points total
- **Admin Referrals Page** - View all referrals and points awarded
- **Anti-Abuse Controls** - Prevent self-referrals and multiple redemptions per user
- **Event Logging** - Track referral_redeemed and points_awarded events

### Quick Local Test (5 minutes)

1. **Create User A (Referrer):**
   - Sign up: `referrer@calpoly.edu`
   - Complete profile → redirected to `/profile/confirmation`
   - Skip referral modal or close it
   - Go to `/profile/settings`
   - Copy your referral code (5 digits)

2. **Create User B (New User with Referral):**
   - Sign up: `newuser@calpoly.edu` (same school)
   - Complete profile → `/profile/confirmation`
   - **Verify:** Referral modal appears
   - Enter User A's code and click "Apply"
   - **Verify:** Success message, modal closes

3. **Verify Points Awarded:**
   - Switch to User A's browser
   - Go to `/profile/settings`
   - **Verify:** Points Total increased by 5
   - **Verify:** "Friends Who Joined" shows 1

### Server Actions

- `redeemReferral(code)` - Validate and apply referral code
- `getReferralInfo()` - Get user's code, points, referral count
- `getAllReferrals()` - Admin-only list of all referrals
- `hasRedeemedReferral()` - Check if user already redeemed a code

### RLS & Security

- Users can only see their own referral code
- Users cannot see who referred them (admin-only)
- Admin can see all referrals and who referred whom
- Prevents: self-referrals, duplicate redemptions, cross-school referrals

---

## 🧪 Full Module 5 Testing Checklist: Referrals & Points

### First-Login Modal

- [ ] Create new account, complete profile setup
- [ ] **Verify:** Referral modal appears on `/profile/confirmation`
- [ ] Click "Skip for now"
- [ ] **Verify:** Modal closes, won't show again (check localStorage)
- [ ] Logout and login
- [ ] **Verify:** Modal doesn't appear again

### Referral Code Redemption

- [ ] **User A:** Copy referral code from `/profile/settings`
- [ ] **User B:** New account, see modal after profile setup
- [ ] Enter User A's code
- [ ] Click "Apply"
- [ ] **Verify:** Success: "Thank you! Your referral code has been applied."
- [ ] Switch to User A
- [ ] Go to `/profile/settings`
- [ ] **Verify:** Points increased by 5
- [ ] **Verify:** "Friends Who Joined" shows 1

### Code Validation

- [ ] Try 3 digits → "Apply" button disabled
- [ ] Type letters → auto-strips to digits only
- [ ] Enter invalid code "99999" → Error: "Referral code not found"
- [ ] Enter too long string → truncates to 5 digits

### Anti-Abuse

- [ ] Try self-referral with own code → "Cannot use your own referral code"
- [ ] User B tries to redeem again → "You have already redeemed a referral code"
- [ ] Different school user tries → "Referrer must be from your school"

### Admin Page

- [ ] Login as admin
- [ ] Visit `/admin/referrals`
- [ ] **Verify:** Table shows all referrals (Referred User, Referrer, Code, Points, Date)
- [ ] **Verify:** Stats show Total Referrals, Total Points, Unique Referrers
- [ ] Login as regular user
- [ ] Try `/admin/referrals`
- [ ] **Verify:** Unauthorized error (RLS blocks)

---

---

## 📚 Module 6A: Class Schedules (Image Uploads Only)

### New Features

- **Schedule Image Uploads** - Upload 1-10 images per entry (JPG/PNG/WEBP, ≤5MB)
- **Schedule Grid** - Browse all uploaded schedules with timestamps
- **Delete Schedules** - Remove individual schedule entries
- **Supabase Storage** - Images stored in `schedules` bucket with RLS
- **Event Logging** - Track schedule_images_uploaded and schedule_deleted events
- **RLS Protection** - Users see only their own schedules

### Quick Local Test (5 minutes)

1. **Upload Schedules:**
   - Login as User A
   - Navigate to `/profile/schedules`
   - Drag & drop 2-3 schedule images (or click to browse)
   - **Verify:** Progress bars appear per file
   - **Verify:** Images appear in grid after upload

2. **Verify Persistence:**
   - Refresh page (F5)
   - **Verify:** Uploaded schedules still visible in grid
   - **Verify:** Timestamps shown (e.g., "2 minutes ago")

3. **Delete Schedule:**
   - Click "Delete" button on a schedule entry
   - Confirm deletion in modal
   - **Verify:** Entry removed from grid
   - **Verify:** Removed from Supabase Storage (check dashboard)

4. **RLS & Privacy:**
   - Login as User B (different account, same school)
   - Try to access `/profile/schedules`
   - **Verify:** User B sees empty grid (only their own schedules)
   - **Verify:** Cannot see User A's schedules

### Server Actions

- `uploadScheduleImages(files)` - Upload 1-10 images, create user_schedules entry
- `getScheduleImages()` - Fetch all user's schedule uploads
- `deleteScheduleEntry(scheduleId)` - Delete entry and remove images from storage
- `getScheduleImageCount(userId)` - Count uploads for analytics

### RLS & Security

- **User_schedules table:** Only owner can read/write/delete
- **Storage bucket:** Path-based isolation by user_id (e.g., `schedules/uuid/filename`)
- **File validation:** JPG/PNG/WEBP only, ≤5MB per file
- **Maximum:** 1-10 images per upload session

---

### 🧪 Full Module 6A Testing Checklist: Class Schedules

- [ ] **Upload multiple images** → Click `/profile/schedules` → Drag-drop 3 PNG files
- [ ] **Verify:** Progress bars show for each file
- [ ] **Verify:** All files upload successfully
- [ ] **Verify:** Images appear in grid with primary image visible + thumbnails for others
- [ ] **Verify:** Timestamps shown (e.g., "just now", "5 minutes ago")
- [ ] **Refresh page** (F5)
- [ ] **Verify:** Schedules still visible, not lost on reload
- [ ] **Upload single WEBP image** → Drag one WEBP file
- [ ] **Verify:** Uploads successfully (format validation working)
- [ ] **Try invalid format** → Drag a PDF file
- [ ] **Verify:** Error: "Only JPG, PNG, and WEBP files are allowed"
- [ ] **Try oversized file** → Create 6MB JPG image (or use tool)
- [ ] **Verify:** Error: "Files must be 5MB or smaller"
- [ ] **Try >10 files** → Select 15 JPG files
- [ ] **Verify:** Error: "Maximum 10 images per upload"
- [ ] **Delete one schedule** → Click "Delete" on first entry
- [ ] **Verify:** Confirmation modal appears
- [ ] **Verify:** After confirming, entry removed from UI
- [ ] **Verify:** Entry removed from Supabase Storage (check `supabase_storage.objects` table)
- [ ] **Create User B** (different account, same school)
- [ ] **User B visits** `/profile/schedules`
- [ ] **Verify:** Empty grid (only sees own schedules, not User A's)
- [ ] **User B uploads own schedules**
- [ ] **Switch back to User A**
- [ ] **Verify:** User A still doesn't see User B's schedules
- [ ] **Check event logging** → Go to Supabase SQL Editor
- [ ] Run: `SELECT * FROM events WHERE event_type IN ('schedule_images_uploaded', 'schedule_deleted');`
- [ ] **Verify:** Rows exist for uploads and deletes with user_id and data

---

## 🎓 Module 6B: Admin › Courses & Materials

### New Features

- **Course CRUD** - Create, read, update, delete courses (admin only)
- **Professor Names** - Store multiple professor names per course
- **Common Materials** - Track typical materials (textbooks, lab manuals, etc.)
- **School Scoping** - Courses visible only to students at same school
- **Admin Form** - Inline editing with professor/material arrays
- **Event Logging** - Track course_created, course_updated, course_deleted

### Quick Local Test (5 minutes)

1. **Create Course (as Admin):**
   - Login as admin account
   - Navigate to `/admin/courses`
   - Click "+ New Course"
   - Fill: Code "CS 101", Name "Intro to Computer Science"
   - Add professors: "Dr. Smith", "Prof. Jones"
   - Add materials: "Introduction to Algorithms", "Lab Manual"
   - Click "Create Course"
   - **Verify:** Course appears in table

2. **Verify Student Access:**
   - Login as regular user
   - Search for course in listings form → "CS 101" should autocomplete
   - **Verify:** Students can see courses when creating listings
   - **Verify:** Students cannot access `/admin/courses` (redirects or 401)

3. **Edit & Delete:**
   - Logout and login as admin
   - Go to `/admin/courses`
   - Click "Edit" on CS 101
   - Change name to "Intro to CS (Updated)"
   - Click "Update Course"
   - **Verify:** Table reflects change
   - Click "Delete" on a course
   - Confirm deletion
   - **Verify:** Removed from table

### Server Actions

- `createCourse(data)` - Create new course (admin only)
- `updateCourse(courseId, data)` - Update course details
- `deleteCourse(courseId)` - Remove course
- `getCourses()` - Fetch all courses for user's school
- `searchCourses(query)` - Search by code or name
- `getCourseById(courseId)` - Get single course details

### RLS & Security

- **Students:** Can read courses from their school
- **Admins:** Can create, update, delete courses
- **Validation:** Code and name required; professors/materials validated as strings

---

### 🧪 Full Module 6B Testing Checklist: Courses

- [ ] **Login as admin** → Visit `/admin/courses`
- [ ] **Verify:** Page loads with empty courses table
- [ ] **Click "+ New Course"**
- [ ] **Fill form:**
  - Code: "MATH 201"
  - Name: "Calculus II"
  - Add professor: "Prof. Johnson"
  - Add professor: "Dr. Lee" (second professor)
  - Add material: "Calculus Textbook (8th ed)"
  - Add material: "Problem Set Solutions"
- [ ] **Click "Create Course"**
- [ ] **Verify:** Success, course appears in table
- [ ] **Verify:** Code "MATH 201" visible in monospace font
- [ ] **Verify:** Professors show first 2, "+1 more" if >2
- [ ] **Verify:** Materials show similarly
- [ ] **Create second course:**
  - Code: "CS 101"
  - Name: "Computer Science I"
  - Professors: "Dr. Smith"
  - Materials: "Programming Textbook", "IDE Setup Guide"
- [ ] **Click "Edit" on MATH 201**
- [ ] **Verify:** Form pre-populates with existing data
- [ ] **Change name** to "Calculus II - Spring 2024"
- [ ] **Add professor:** "Dr. Williams"
- [ ] **Click "Update Course"**
- [ ] **Verify:** Table reflects changes
- [ ] **Click "Delete" on CS 101**
- [ ] **Verify:** Confirmation modal appears
- [ ] **Click "Delete"** in modal
- [ ] **Verify:** Course removed from table
- [ ] **Login as regular student**
- [ ] **Try to access** `/admin/courses` directly
- [ ] **Verify:** Redirected to `/` or shows unauthorized error
- [ ] **Create a new listing** and see if courses appear in dropdown/search
- [ ] **Verify:** "MATH 201" and remaining course appear as options
- [ ] **Check event logging** → Supabase SQL Editor
- [ ] Run: `SELECT * FROM events WHERE event_type LIKE 'course_%';`
- [ ] **Verify:** Rows for course_created, course_updated, course_deleted

---

## 📊 Module 7: Admin › Overview (Analytics Dashboard)

### New Features

- **7-Day & 30-Day Windows** - Toggle between time periods
- **User Analytics** - Total users, new users in period
- **Listing Analytics** - Active listings, new, sold
- **Message Analytics** - Messages sent, active threads
- **Alert Analytics** - Created, matched to listings
- **Referral Analytics** - Redemptions, points awarded, unique referrers
- **Schedule Analytics** - Uploads in period, total all-time
- **Stat Cards** - Visual cards with emojis for each metric
- **Event-Driven** - Data computed from existing tables

### Quick Local Test (5 minutes)

1. **View Analytics:**
   - Login as admin
   - Navigate to `/admin/overview`
   - **Verify:** Page shows stat cards for all categories
   - **Verify:** "Last 7 Days" button active by default

2. **Switch Time Window:**
   - Click "Last 30 Days"
   - **Verify:** Page reloads with updated stats
   - Numbers may differ (larger window = more activity)

3. **Data Accuracy:**
   - Create a listing
   - Return to analytics page
   - **Verify:** "New Listings (7d)" increments by 1
   - Send a message between buyer and seller
   - **Verify:** "Messages Sent (7d)" increments

### Server Actions

- `getAnalyticsData(timeWindow)` - Fetch all metrics for 7d or 30d
  - Returns: users (total, new), listings (active, new, sold), messages (sent, active threads), alerts (created, matched), referrals (redeemed, points, unique referrers), schedules (uploaded, total)

### Queries & Indexes

- Indexes on `created_at`, `status`, `school_id` for fast aggregation
- Counts use exact mode to ensure accuracy
- Time window filtering via `gte(created_at, cutoffDate)`

---

### 🧪 Full Module 7 Testing Checklist: Analytics

- [ ] **Login as admin** → Visit `/admin/overview`
- [ ] **Verify:** Page loads with stat cards for:
  - Users (Total Users, New Users 7d)
  - Listings (Active, New 7d, Sold)
  - Messages (Sent 7d, Active Threads 7d)
  - Alerts (Created 7d, Matched 7d)
  - Referrals (Redeemed 7d, Points Awarded 7d, Unique Referrers 7d)
  - Schedules (Uploaded 7d, Total Uploads)
- [ ] **Verify:** All stat cards display numbers and icons
- [ ] **Verify:** Icons are emojis (👥, 📦, 💬, etc.)
- [ ] **Click "Last 30 Days" button**
- [ ] **Verify:** Button styling changes (primary color)
- [ ] **Verify:** Numbers update (typically higher for 30d window)
- [ ] **Click "Last 7 Days"** to switch back
- [ ] **Perform actions** in different browser windows:
  - **Window 1 (Admin):** Keep overview page open
  - **Window 2:** Create a new listing
  - **Window 3:** Send a message in an existing thread
- [ ] **Refresh overview page** in Window 1
- [ ] **Verify:**
  - "New Listings (7d)" increased by 1
  - "Messages Sent (7d)" increased by 1
  - "Active Threads (7d)" updated
- [ ] **Check cross-school isolation:**
  - Create second school admin
  - Login and visit `/admin/overview`
  - **Verify:** Admins see stats only for their own school (different numbers)
- [ ] **Login as regular user**
- [ ] **Try to access** `/admin/overview`
- [ ] **Verify:** Redirected (not admin) or error page shown
- [ ] **Create multiple referrals** (using Module 5 referral codes):
  - **User A creates account** (referrer)
  - **User B uses User A's code** (referred)
  - **User C uses User A's code** (referred)
  - **Return to admin analytics**
  - **Verify:** "Referrals Redeemed (7d)" shows 2 (Users B and C)
  - **Verify:** "Unique Referrers (7d)" shows 1 (only User A)
  - **Verify:** "Points Awarded 7d" shows 10 (5 points × 2 referrals)
- [ ] **Check event table** → Supabase SQL Editor
- [ ] Run: `SELECT event_type, COUNT(*) FROM events WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY event_type;`
- [ ] **Verify:** All event types are represented (signup, listing_created, message_sent, alert_created, schedule_images_uploaded, etc.)

---

## 🗺️ MVP Checklist

- [x] Email/password signup (only .edu emails accepted)
- [x] School auto-mapped via domain
- [x] User profile with Major and College Year
- [x] Create, search, view listings (Module 3)
- [x] In-app messaging between buyer and seller (Module 4)
- [x] Notify-Me bell (14-day expiry, in-app notifications) (Module 3)
- [x] Referral codes (auto-generate, points increment) (Module 5)
- [x] Schedule image uploads (Module 6A)
- [x] Admin courses management (Module 6B)
- [x] Analytics dashboard (Module 7)
- [x] All content scoped to user's school
- [x] CI/CD + Supabase migrations functional