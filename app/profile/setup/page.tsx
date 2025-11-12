'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/server/actions/auth';
import { isProfileSetUp } from '@/server/actions/profile';
import { ProfileSetupForm } from '@/components/profile/profile-setup-form';

export default function ProfileSetupPage() {
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

        // Check if profile is already set up
        const alreadySetUp = await isProfileSetUp(user.id);

        if (alreadySetUp) {
          router.push('/listings');
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help us learn more about you so we can improve your StudyShare experience
          </p>
        </div>

        <ProfileSetupForm userId={userId} />
      </div>
    </div>
  );
}
