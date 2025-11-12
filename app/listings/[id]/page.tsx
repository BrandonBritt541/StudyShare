export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Listing Detail</h1>
        {/* Listing detail view will go here */}
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <p className="text-gray-600">Loading listing {params.id}...</p>
        </div>
      </div>
    </div>
  );
}
