'use client';

import { useEffect, useState } from 'react';
import { getAllMajors, createMajor, updateMajor, deleteMajor } from '@/server/actions/admin';

interface Major {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export function MajorsManager() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMajorName, setNewMajorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllMajors();

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

  useEffect(() => {
    fetchMajors();
  }, []);

  const handleAddMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!newMajorName.trim()) {
      setSubmitError('Major name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createMajor(newMajorName);

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      // Add new major to list
      if (result.data) {
        setMajors([...majors, result.data]);
        setNewMajorName('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMajor = async (majorId: string, currentStatus: boolean) => {
    try {
      const result = await updateMajor(majorId, !currentStatus);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Update local state
      setMajors(
        majors.map((m) => (m.id === majorId ? { ...m, is_active: !currentStatus } : m)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update major');
    }
  };

  const handleDeleteMajor = async (majorId: string) => {
    if (!confirm('Are you sure you want to delete this major?')) {
      return;
    }

    try {
      const result = await deleteMajor(majorId);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Remove from list
      setMajors(majors.filter((m) => m.id !== majorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete major');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-600">Loading majors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Add New Major Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Major</h3>
        <form onSubmit={handleAddMajor} className="flex gap-3">
          <input
            type="text"
            value={newMajorName}
            onChange={(e) => setNewMajorName(e.target.value)}
            placeholder="e.g., Data Science"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </form>
        {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
      </div>

      {/* Majors List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          All Majors ({majors.length})
        </h3>

        {majors.length === 0 ? (
          <p className="text-gray-600">No majors yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Major Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {majors.map((major) => (
                  <tr key={major.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{major.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          major.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {major.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(major.created_at).toLocaleDateString()}
                    </td>
                    <td className="space-x-2 px-4 py-3 text-sm">
                      <button
                        onClick={() => handleToggleMajor(major.id, major.is_active)}
                        className={`rounded px-2 py-1 font-medium ${
                          major.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {major.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteMajor(major.id)}
                        className="rounded bg-red-100 px-2 py-1 font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
