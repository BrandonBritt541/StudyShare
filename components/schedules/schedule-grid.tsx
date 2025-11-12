'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { deleteScheduleEntry } from '@/server/actions/schedules';
import { ScheduleDeleteModal } from './schedule-delete-modal';

interface ScheduleEntry {
  id: string;
  user_id: string;
  image_urls: string[];
  created_at: string;
}

interface ScheduleGridProps {
  schedules: ScheduleEntry[];
  onDelete?: () => void;
}

export function ScheduleGrid({ schedules, onDelete }: ScheduleGridProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (scheduleId: string) => {
    setIsDeleting(true);
    const result = await deleteScheduleEntry(scheduleId);

    if (result.success) {
      setSelectedSchedule(null);
      onDelete?.();
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
    setIsDeleting(false);
  };

  if (schedules.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-600">No schedules yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload your class schedules above to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Schedules</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map(schedule => (
            <div
              key={schedule.id}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              {/* Image Gallery */}
              <div className="space-y-2 p-4">
                {schedule.image_urls.length === 0 ? (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No images</span>
                  </div>
                ) : (
                  <>
                    {/* Primary Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={schedule.image_urls[0]}
                        alt="Schedule"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Thumbnail previews if multiple images */}
                    {schedule.image_urls.length > 1 && (
                      <div className="flex gap-2">
                        {schedule.image_urls.slice(1, 4).map((url, idx) => (
                          <div
                            key={idx}
                            className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100"
                          >
                            <Image
                              src={url}
                              alt={`Schedule ${idx + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {schedule.image_urls.length > 4 && (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-sm font-semibold text-gray-600">
                              +{schedule.image_urls.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-600">
                  {formatDistanceToNow(new Date(schedule.created_at), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {schedule.image_urls.length}{' '}
                  {schedule.image_urls.length === 1 ? 'image' : 'images'}
                </p>

                {/* Delete Button */}
                <button
                  onClick={() => setSelectedSchedule(schedule.id)}
                  className="mt-3 w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}
      {selectedSchedule && (
        <ScheduleDeleteModal
          isOpen={selectedSchedule !== null}
          isLoading={isDeleting}
          onConfirm={() => handleDelete(selectedSchedule)}
          onCancel={() => setSelectedSchedule(null)}
        />
      )}
    </>
  );
}
