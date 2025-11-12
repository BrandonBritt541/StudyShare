'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/server/actions/auth';
import { getUserProfile, updateProfile } from '@/server/actions/profile';
import { LogoutButton } from '@/components/auth/logout-button';
import { ProfileSetupForm } from '@/components/profile/profile-setup-form';
import { ReferralCard } from '@/components/referrals/referral-card';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const user = await getCurrentUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Error: {error}
          </div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 w-full rounded-lg bg-primary-600 py-2 font-semibold text-white hover:bg-primary-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Profile
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Profile Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Edit Profile Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Edit Profile Information</h2>
            <ProfileSetupForm userId={userId} />
          </div>

          {/* Referrals & Points Section */}
          <ReferralCard />

          {/* Security Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Security</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage your account security and password
              </p>
              <Link
                href="/profile/change-password"
                className="inline-block rounded-lg bg-primary-100 px-4 py-2 font-medium text-primary-600 hover:bg-primary-200"
              >
                Change Password
              </Link>
            </div>
          </div>

          {/* Logout Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Session</h2>
            <p className="mb-4 text-sm text-gray-600">
              Log out from your StudyShare account
            </p>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
