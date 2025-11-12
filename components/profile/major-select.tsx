'use client';

import { useEffect, useState } from 'react';
import { getMajors } from '@/server/actions/profile';

interface MajorSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MajorSelect({ value, onChange, disabled }: MajorSelectProps) {
  const [majors, setMajors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMajors();

      if (result.error) {
        setError(result.error);
        setMajors([]);
        return;
      }

      const majorsList = result.data || [];
      setMajors(majorsList);

      // If no majors found, set a helpful message
      if (majorsList.length === 0) {
        setError('No majors available. An admin needs to add some.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load majors';
      setError(message);
      setMajors([]);
    } finally {
      setIsLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    fetchMajors();
  };

  if (isLoading) {
    return (
      <select disabled className="w-full rounded border border-gray-300 px-3 py-2 text-gray-500">
        <option>Loading majors...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
          {error}
        </div>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || majors.length === 0}
      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-gray-100"
    >
      <option value="">{majors.length === 0 ? 'No majors available' : 'Select a major'}</option>
      {majors.map((major) => (
        <option key={major} value={major}>
          {major}
        </option>
      ))}
    </select>
  );
}
