export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Users</h3>
            <p className="text-gray-600">Manage users and permissions</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Listings</h3>
            <p className="text-gray-600">Review and moderate listings</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Reports</h3>
            <p className="text-gray-600">View user reports</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-gray-600">View platform analytics</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Schools</h3>
            <p className="text-gray-600">Manage school configurations</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Settings</h3>
            <p className="text-gray-600">Platform settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
