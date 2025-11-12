'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getListing } from '@/server/actions/listings';

interface ListingData {
  id: string;
  title: string;
  description?: string;
  type: string;
  quality: string;
  price_cents: number;
  course_code?: string;
  course_title?: string;
  professor?: string;
  major?: string;
  images?: string[];
  created_at: string;
  profiles?: {
    first_name: string;
    last_initial?: string;
    major?: string;
    college_year?: string;
    referral_code?: string;
  };
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      const result = await getListing(params.id);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setListing(result.data);
      }
      setIsLoading(false);
    };

    fetchListing();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center text-gray-600">Loading listing...</div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-lg bg-red-50 p-4 text-red-700 mb-4">
            {error || 'Listing not found'}
          </div>
          <Link
            href="/listings"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const price = (listing.price_cents / 100).toFixed(2);
  const createdDate = new Date(listing.created_at);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeAgo = daysAgo === 0 ? 'today' : `${daysAgo}d ago`;

  const qualityLabels: { [key: string]: string } = {
    new: 'Like New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  };

  const typeLabels: { [key: string]: string } = {
    textbook: 'Textbook',
    notes: 'Notes',
    supplies: 'Supplies',
    other: 'Other',
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : ['/placeholder-image.png'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back button */}
        <Link
          href="/listings"
          className="mb-6 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Listings
        </Link>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Images and Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <img
                src={images[selectedImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="mb-8 flex gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Listing Details */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">{listing.title}</h1>

              {/* Price and Status */}
              <p className="mb-6 text-4xl font-bold text-primary-600">${price}</p>

              {/* Tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                  {qualityLabels[listing.quality] || listing.quality}
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">
                  {typeLabels[listing.type] || listing.type.replace(/_/g, ' ')}
                </span>
                {listing.course_code && (
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                    {listing.course_code}
                  </span>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-8 border-t border-gray-200 pt-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium text-gray-900">
                      {qualityLabels[listing.quality] || listing.quality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">
                      {typeLabels[listing.type] || listing.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {listing.course_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Code:</span>
                      <span className="font-medium text-gray-900">{listing.course_code}</span>
                    </div>
                  )}
                  {listing.course_title && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Title:</span>
                      <span className="font-medium text-gray-900">{listing.course_title}</span>
                    </div>
                  )}
                  {listing.professor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professor:</span>
                      <span className="font-medium text-gray-900">{listing.professor}</span>
                    </div>
                  )}
                  {listing.major && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Major:</span>
                      <span className="font-medium text-gray-900">{listing.major}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium text-gray-900">{timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">Seller Information</h2>

              {listing.profiles && (
                <div className="mb-6 space-y-4">
                  {/* Seller Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                      <span className="text-lg font-semibold text-primary-600">
                        {listing.profiles.first_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {listing.profiles.first_name} {listing.profiles.last_initial || ''}
                      </p>
                      {listing.profiles.college_year && (
                        <p className="text-sm text-gray-600">{listing.profiles.college_year}</p>
                      )}
                    </div>
                  </div>

                  {/* Seller Details */}
                  {listing.profiles.major && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">Major</p>
                      <p className="text-gray-900">{listing.profiles.major}</p>
                    </div>
                  )}

                  {/* Referral Code */}
                  {listing.profiles.referral_code && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">Referral Code</p>
                      <p className="font-mono text-sm font-bold text-gray-900">
                        {listing.profiles.referral_code}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => alert('Messaging feature coming soon!')}
                  className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  Message Seller
                </button>
                <button
                  onClick={() => alert('Contact admin for reports')}
                  className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Report Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
