'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/server/actions/auth';
import {
  getScheduleImages,
  type ScheduleEntry,
} from '@/server/actions/schedules';
import { ScheduleUploadZone } from '@/components/schedules/schedule-upload-zone';
import { ScheduleGrid } from '@/components/schedules/schedule-grid';

export default function SchedulesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
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

        // Fetch schedules
        const result = await getScheduleImages();
        if (result.error) {
          setError(result.error);
        } else {
          setSchedules(result.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleUploadSuccess = async () => {
    // Refresh schedules
    const result = await getScheduleImages();
    if (result.data) {
      setSchedules(result.data);
    }
  };

  const handleDelete = async () => {
    // Refresh schedules
    const result = await getScheduleImages();
    if (result.data) {
      setSchedules(result.data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Back to Profile
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Class Schedules
          </h1>
          <p className="mt-2 text-gray-600">
            Upload and manage your class schedules for quick reference
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-12 rounded-lg border border-gray-200 bg-white p-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Upload Schedules
          </h2>
          <ScheduleUploadZone onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Schedules Grid */}
        <ScheduleGrid schedules={schedules} onDelete={handleDelete} />
      </div>
    </div>
  );
}
