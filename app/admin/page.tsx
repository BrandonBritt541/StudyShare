import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Users</h3>
            <p className="text-gray-600">Manage users and permissions</p>
          </Link>

          <Link
            href="/admin/listings"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Listings</h3>
            <p className="text-gray-600">Review and moderate listings</p>
          </Link>

          <Link
            href="/admin/reports"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Reports</h3>
            <p className="text-gray-600">View user reports</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-gray-600">View platform analytics</p>
          </Link>

          <Link
            href="/admin/schools"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Schools</h3>
            <p className="text-gray-600">Manage school configurations</p>
          </Link>

          <Link
            href="/admin/majors"
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">Majors</h3>
            <p className="text-gray-600">Add and manage college majors</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
