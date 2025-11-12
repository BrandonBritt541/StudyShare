'use client';

import Link from 'next/link';
import { MajorsManager } from '@/components/admin/majors-manager';

export default function AdminMajorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Manage Majors</h1>
            <p className="mt-2 text-gray-600">
              Add, edit, and manage the list of college majors available in StudyShare
            </p>
          </div>
        </div>

        <MajorsManager />
      </div>
    </div>
  );
}
