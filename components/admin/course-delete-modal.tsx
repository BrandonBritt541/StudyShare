'use client';

import { deleteCourse } from '@/server/actions/courses';
import { useState } from 'react';

interface CourseDeleteModalProps {
  courseId: string;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
  onComplete?: () => void;
}

export function CourseDeleteModal({
  courseId,
  isOpen,
  isLoading: initialLoading,
  onConfirm,
  onCancel,
  onComplete,
}: CourseDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    const result = await deleteCourse(courseId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      onComplete?.();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Delete Course?</h2>
        <p className="mt-2 text-sm text-gray-600">
          This course will be permanently deleted. Listings associated with this course will not be affected.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading || initialLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || initialLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
