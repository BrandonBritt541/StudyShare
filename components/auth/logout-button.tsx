'use client';

import { useState } from 'react';
import { logout } from '@/server/actions/auth';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await logout();

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If no error, redirect happens automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log out');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="rounded-lg bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        {isLoading ? 'Logging out...' : 'Log Out'}
      </button>
    </div>
  );
}
