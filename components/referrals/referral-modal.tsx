'use client';

import { useState } from 'react';
import { redeemReferral } from '@/server/actions/referrals';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await redeemReferral(code);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }

    setIsLoading(false);
  };

  const handleSkip = () => {
    // Mark that user skipped referral modal (stored in localStorage)
    localStorage.setItem('referral_modal_skipped', 'true');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 5 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setCode(value);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        {success ? (
          <div className="text-center">
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Thank you!</h2>
            <p className="text-gray-600">Your referral code has been applied successfully.</p>
            <p className="mt-2 text-sm text-primary-600">5 points awarded to your referrer!</p>
          </div>
        ) : (
          <>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Have a referral code?</h2>
            <p className="mb-6 text-gray-600">
              Enter your friend&apos;s 5-digit code to both get rewards!
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Referral Code (5 digits)
              </label>
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="12345"
                maxLength={5}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                You can find your friend&apos;s code in their Profile.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApply}
                disabled={isLoading || code.length !== 5}
                className="flex-1 rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Applying...' : 'Apply'}
              </button>
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
