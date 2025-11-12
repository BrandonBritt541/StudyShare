'use client';

import { useEffect, useState } from 'react';
import { getUserProfile, getUserSchool } from '@/server/actions/profile';
import Link from 'next/link';

interface ConfirmationCardProps {
  userId: string;
}

interface ProfileData {
  first_name: string | null;
  last_initial: string | null;
  major: string | null;
  college_year: string | null;
  referral_code: string;
  points_total: number;
}

interface SchoolData {
  name: string;
  domain: string;
  city: string;
  state: string;
}

export function ConfirmationCard({ userId }: ConfirmationCardProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch profile
        const profileResult = await getUserProfile(userId);
        if (profileResult.error) {
          setError(profileResult.error);
          setIsLoading(false);
          return;
        }

        setProfile(profileResult.data);

        // Fetch school
        const schoolResult = await getUserSchool(userId);
        if (!schoolResult.error && schoolResult.data && Array.isArray(schoolResult.data)) {
          setSchool(schoolResult.data[0] || null);
        } else if (!schoolResult.error) {
          setSchool(schoolResult.data as SchoolData | null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Failed to load profile: {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
        Profile not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-primary-50 to-blue-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {profile.first_name}!
        </h2>
        <p className="mt-2 text-gray-600">Your StudyShare account is all set up</p>
      </div>

      {/* School Info */}
      {school && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Your School</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">School</span>
              <span className="font-medium text-gray-900">{school.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium text-gray-900">
                {school.city}, {school.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Domain</span>
              <span className="font-medium text-gray-900">@{school.domain}</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Profile</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Name</span>
            <span className="font-medium text-gray-900">
              {profile.first_name} {profile.last_initial}
            </span>
          </div>
          {profile.major && (
            <div className="flex justify-between">
              <span className="text-gray-600">Major</span>
              <span className="font-medium text-gray-900">{profile.major}</span>
            </div>
          )}
          {profile.college_year && (
            <div className="flex justify-between">
              <span className="text-gray-600">Year</span>
              <span className="font-medium text-gray-900">{profile.college_year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Referral Code */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Referral Code</h3>
        <p className="mb-4 text-sm text-gray-600">
          Share this code with friends to earn points
        </p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border-2 border-primary-500 bg-primary-50 px-4 py-3">
            <p className="text-center font-mono text-2xl font-bold text-primary-600">
              {profile.referral_code}
            </p>
          </div>
          <button
            onClick={copyReferralCode}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Points */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Referral Points</p>
            <p className="text-3xl font-bold text-primary-600">{profile.points_total}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Earn points by referring friends</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href="/listings"
          className="flex-1 rounded-lg bg-primary-600 px-4 py-3 text-center font-medium text-white hover:bg-primary-700"
        >
          Browse Listings
        </Link>
        <Link
          href="/profile"
          className="flex-1 rounded-lg border-2 border-primary-600 px-4 py-3 text-center font-medium text-primary-600 hover:bg-blue-50"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
