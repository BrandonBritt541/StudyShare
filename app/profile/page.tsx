export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Profile</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            {/* Profile sidebar with tabs will go here */}
            <nav className="space-y-1 rounded-lg border border-gray-200 bg-white p-4">
              <a href="/profile" className="block rounded px-3 py-2 text-primary-600">
                Profile Info
              </a>
              <a href="/profile/listings" className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-50">
                My Listings
              </a>
              <a href="/profile/alerts" className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-50">
                Alerts
              </a>
              <a href="/profile/schedules" className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-50">
                Schedules
              </a>
            </nav>
          </div>
          <div className="md:col-span-2">
            {/* Profile content will go here */}
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <p className="text-gray-600">Profile content coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
