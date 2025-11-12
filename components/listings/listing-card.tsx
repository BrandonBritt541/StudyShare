'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ListingCardProps {
  id: string;
  title: string;
  price_cents: number;
  images?: string[];
  quality: string;
  type: string;
  created_at: string;
  seller?: {
    first_name?: string;
    last_initial?: string;
    major?: string;
    college_year?: string;
  };
  course_code?: string;
}

export function ListingCard({ id, title, price_cents, images, quality, type, created_at, seller, course_code }: ListingCardProps) {
  const price = (price_cents / 100).toFixed(2);
  const createdDate = new Date(created_at);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeAgo = daysAgo === 0 ? 'today' : `${daysAgo}d ago`;

  const qualityColors = {
    new: 'bg-green-100 text-green-800',
    like_new: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
  };

  return (
    <Link href={`/listings/${id}`}>
      <div className="group rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {images && images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No image</div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-2 truncate text-sm font-semibold text-gray-900 group-hover:text-primary-600">
            {title}
          </h3>

          {/* Price */}
          <p className="mb-3 text-lg font-bold text-gray-900">${price}</p>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                qualityColors[quality as keyof typeof qualityColors] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {quality}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              {type.replace(/_/g, ' ')}
            </span>
            {course_code && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {course_code}
              </span>
            )}
          </div>

          {/* Seller & Time */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div>
              {seller?.first_name && (
                <p className="font-medium">
                  {seller.first_name} {seller.last_initial || ''}
                </p>
              )}
            </div>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
