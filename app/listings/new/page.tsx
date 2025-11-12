import { ListingForm } from '@/components/listings/listing-form';

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Create New Listing</h1>
        <p className="mb-8 text-gray-600">Add a new item to sell on StudyShare</p>

        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <ListingForm />
        </div>
      </div>
    </div>
  );
}
