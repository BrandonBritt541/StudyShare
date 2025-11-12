'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { NotificationBell } from './notifications/notification-bell';

export function Header() {
  const { user, isLoading } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700">
          📚 StudyShare
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link href="/listings" className="text-gray-700 hover:text-primary-600 font-medium">
            Browse
          </Link>

          {user ? (
            <>
              <Link href="/profile" className="text-gray-700 hover:text-primary-600 font-medium">
                Profile
              </Link>
              <NotificationBell />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
