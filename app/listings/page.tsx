'use client';

import { useEffect, useState } from 'react';
import { searchListings } from '@/server/actions/listings';
import { createAlert } from '@/server/actions/alerts';
import { ListingCard } from '@/components/listings/listing-card';
import Link from 'next/link';

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasResults, setHasResults] = useState(true);
  const [showNotifyBell, setShowNotifyBell] = useState(false);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);

    const result = await searchListings({
      search: search || undefined,
      sortBy: 'newest',
      page: 1,
    });

    if (result.error) {
      setError(result.error);
      setListings([]);
      return;
    }

    const data = result.data?.listings || [];
    setListings(data);
    setHasResults(data.length > 0);
    setShowNotifyBell(!hasResults && search.length > 0);
  };

  useEffect(() => {
    const timer = setTimeout(fetchListings, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleNotifyMe = async () => {
    if (!search.trim()) return;

    setIsCreatingAlert(true);
    const result = await createAlert(search);

    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      alert(`Subscribed! You'll be notified when someone lists "${search}"`);
      setShowNotifyBell(false);
    }

    setIsCreatingAlert(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
            <p className="text-gray-600">Find textbooks and supplies from students at your school</p>
          </div>
          <Link
            href="/listings/new"
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
          >
            + Create Listing
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative flex gap-2">
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
            />
            {showNotifyBell && (
              <button
                onClick={handleNotifyMe}
                disabled={isCreatingAlert}
                className="rounded-lg bg-yellow-100 px-4 py-2 font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
              >
                🔔 Notify Me
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : !hasResults ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">No listings found. Try a different search.</p>
            {showNotifyBell && (
              <p className="mt-2 text-sm text-gray-500">
                Or subscribe to be notified when something matches your search.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price_cents={listing.price_cents}
                images={listing.images}
                quality={listing.quality}
                type={listing.type}
                created_at={listing.created_at}
                course_code={listing.course_code}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
