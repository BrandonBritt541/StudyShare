'use client';

interface ScheduleDeleteModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ScheduleDeleteModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: ScheduleDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Delete Schedule?</h2>
        <p className="mt-2 text-sm text-gray-600">
          This will permanently delete this schedule entry and remove all images from storage.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
