'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/server/actions/auth';
import { hasRedeemedReferral } from '@/server/actions/referrals';
import { ConfirmationCard } from '@/components/profile/confirmation-card';
import { ReferralModal } from '@/components/referrals/referral-modal';

export default function ConfirmationPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);

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

        // Check if user has already redeemed a referral
        const hasRedeemed = await hasRedeemedReferral();

        // Show modal only if user hasn't redeemed and hasn't skipped before
        const hasSkipped = localStorage.getItem('referral_modal_skipped');
        if (!hasRedeemed.data && !hasSkipped) {
          setShowReferralModal(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleCloseModal = () => {
    setShowReferralModal(false);
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
      <div className="mx-auto max-w-2xl">
        <ConfirmationCard userId={userId} />
      </div>
      <ReferralModal isOpen={showReferralModal} onClose={handleCloseModal} />
    </div>
  );
}
