'use client';

import { useState } from 'react';
import { Course } from '@/server/actions/courses';
import { CourseDeleteModal } from './course-delete-modal';

interface CourseTableProps {
  courses: Course[];
  onEdit?: (course: Course) => void;
  onDelete?: () => void;
}

export function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteComplete = () => {
    setSelectedCourse(null);
    onDelete?.();
  };

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">No courses yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Create your first course using the form above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                Professors
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                Materials
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                  {course.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {course.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {course.professor_names.length > 0 ? (
                    <div className="space-y-1">
                      {course.professor_names.slice(0, 2).map((prof, idx) => (
                        <div key={idx} className="text-xs">
                          {prof}
                        </div>
                      ))}
                      {course.professor_names.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{course.professor_names.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {course.common_materials.length > 0 ? (
                    <div className="space-y-1">
                      {course.common_materials.slice(0, 2).map((mat, idx) => (
                        <div key={idx} className="text-xs">
                          {mat}
                        </div>
                      ))}
                      {course.common_materials.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{course.common_materials.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit?.(course)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedCourse(course.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {selectedCourse && (
        <CourseDeleteModal
          courseId={selectedCourse}
          isOpen={selectedCourse !== null}
          isLoading={isDeleting}
          onConfirm={async () => {
            setIsDeleting(true);
            handleDeleteComplete();
          }}
          onCancel={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
