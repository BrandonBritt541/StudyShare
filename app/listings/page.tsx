export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Browse Listings</h1>
        {/* Search and filters will go here */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">Loading listings...</p>
        </div>
      </div>
    </div>
  );
}
