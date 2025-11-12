'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/server/actions/auth';
import { getUserProfile } from '@/server/actions/profile';
import { getCourses, Course } from '@/server/actions/courses';
import { CourseForm } from '@/components/admin/course-form';
import { CourseTable } from '@/components/admin/course-table';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

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

        // Get user profile and check role
        const profileResult = await getUserProfile(user.id);

        if (profileResult.error || !profileResult.data || !profileResult.data.role || !['admin', 'moderator'].includes(profileResult.data.role)) {
          router.push('/');
          return;
        }

        setIsAdmin(true);

        // Fetch courses
        const result = await getCourses();
        if (result.error) {
          setError(result.error);
        } else {
          setCourses(result.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleFormSuccess = async () => {
    // Refresh courses
    const result = await getCourses();
    if (result.data) {
      setCourses(result.data);
    }
    setShowForm(false);
    setSelectedCourse(null);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowForm(true);
  };

  const handleDelete = async () => {
    // Refresh courses
    const result = await getCourses();
    if (result.data) {
      setCourses(result.data);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCourse(null);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to Admin
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="mt-2 text-gray-600">
            Create and manage courses for your school
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              {selectedCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <CourseForm
              course={selectedCourse}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Create Button (if not showing form) */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => {
                setSelectedCourse(null);
                setShowForm(true);
              }}
              className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
            >
              + New Course
            </button>
          </div>
        )}

        {/* Courses Table */}
        <CourseTable
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
