'use client';

import { useEffect, useState } from 'react';
import { getReferralInfo } from '@/server/actions/referrals';

interface ReferralData {
  referral_code: string;
  points_total: number;
  referral_count: number;
}

export function ReferralCard() {
  const [referralInfo, setReferralInfo] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchReferralInfo = async () => {
      const result = await getReferralInfo();
      if (result.error) {
        setError(result.error);
      } else {
        setReferralInfo(result.data);
      }
      setIsLoading(false);
    };

    fetchReferralInfo();
  }, []);

  const handleCopyCode = async () => {
    if (referralInfo?.referral_code) {
      await navigator.clipboard.writeText(referralInfo.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading referral info...</div>;
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  if (!referralInfo) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Referrals & Points</h2>

      {/* Points Total */}
      <div className="mb-6 rounded-lg bg-primary-50 p-4">
        <p className="text-sm text-gray-600">Your Points</p>
        <p className="text-3xl font-bold text-primary-600">{referralInfo.points_total}</p>
        <p className="mt-2 text-xs text-gray-600">
          Earn 5 points when someone joins using your referral code.
        </p>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-900">Your Referral Code</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
            <p className="font-mono text-lg font-bold text-gray-900">
              {referralInfo.referral_code}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {copiedCode ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Share this code with friends. They&apos;ll earn 5 points by using it on signup.
        </p>
      </div>

      {/* Referrals Made */}
      {referralInfo.referral_count > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Friends Who Joined</p>
          <p className="text-2xl font-bold text-gray-900">{referralInfo.referral_count}</p>
          <p className="mt-1 text-xs text-gray-600">
            {referralInfo.referral_count === 1 ? '1 person' : `${referralInfo.referral_count} people`} joined
            using your code
          </p>
        </div>
      )}
    </div>
  );
}
