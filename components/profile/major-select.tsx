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

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setIsLoading(true);
        const result = await getMajors();

        if (result.error) {
          setError(result.error);
          return;
        }

        setMajors(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load majors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMajors();
  }, []);

  if (isLoading) {
    return (
      <select disabled className="w-full rounded border border-gray-300 px-3 py-2 text-gray-500">
        <option>Loading majors...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load majors: {error}
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      <option value="">Select a major</option>
      {majors.map((major) => (
        <option key={major} value={major}>
          {major}
        </option>
      ))}
    </select>
  );
}
