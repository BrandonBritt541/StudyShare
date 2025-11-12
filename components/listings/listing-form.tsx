'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, type ListingInput } from '@/lib/validations';
import { createListing, updateListing } from '@/server/actions/listings';
import { uploadListingImage, deleteListingImage } from '@/lib/image-upload';
import { useRouter } from 'next/navigation';

interface ListingFormProps {
  initialData?: any;
  listingId?: string;
}

export function ListingForm({ initialData, listingId }: ListingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: initialData?.title,
      description: initialData?.description,
      type: initialData?.type,
      quality: initialData?.quality,
      priceCents: initialData?.price_cents,
      courseCode: initialData?.course_code,
      courseTitle: initialData?.course_title,
      professor: initialData?.professor,
      major: initialData?.major,
      imageUrls: initialData?.images || [],
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imageUrls.length + files.length > 6) {
      setServerError('Maximum 6 images allowed');
      return;
    }

    setUploadingImages(true);
    setServerError(null);

    for (const file of Array.from(files)) {
      const tempId = Math.random().toString(36).substring(7);
      const { url, error } = await uploadListingImage(file, tempId);

      if (error) {
        setServerError(error);
        setUploadingImages(false);
        return;
      }

      if (url) {
        setImageUrls([...imageUrls, url]);
      }
    }

    setUploadingImages(false);
  };

  const handleRemoveImage = async (url: string, index: number) => {
    const { success, error } = await deleteListingImage(url);

    if (error) {
      setServerError(error);
      return;
    }

    if (success) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: ListingInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = listingId
        ? await updateListing(listingId, { ...data, imageUrls })
        : await createListing({ ...data, imageUrls });

      if (result.error) {
        setServerError(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push(`/listings/${result.data?.id || listingId}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Organic Chemistry Textbook"
          {...register('title')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          placeholder="Condition, notes, etc."
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Type & Quality */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Item Type
          </label>
          <select {...register('type')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
            <option value="">Select type</option>
            <option value="textbook">Textbook</option>
            <option value="lab_supplies">Lab Supplies</option>
            <option value="calculator">Calculator</option>
            <option value="electronics">Electronics</option>
            <option value="notebook">Notebook</option>
            <option value="other">Other</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div>
          <label htmlFor="quality" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select {...register('quality')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2">
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
          {errors.quality && <p className="mt-1 text-sm text-red-600">{errors.quality.message}</p>}
        </div>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="priceCents" className="block text-sm font-medium text-gray-700">
          Price ($)
        </label>
        <input
          id="priceCents"
          type="number"
          placeholder="25.50"
          step="0.01"
          {...register('priceCents', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        {errors.priceCents && (
          <p className="mt-1 text-sm text-red-600">{errors.priceCents.message}</p>
        )}
      </div>

      {/* Course Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
            Course Code (Optional)
          </label>
          <input
            id="courseCode"
            type="text"
            placeholder="CHEM 201"
            {...register('courseCode')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="professor" className="block text-sm font-medium text-gray-700">
            Professor (Optional)
          </label>
          <input
            id="professor"
            type="text"
            placeholder="Dr. Smith"
            {...register('professor')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Images ({imageUrls.length}/6)
        </label>
        <div className="mt-2 space-y-4">
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <input
              id="images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImages || imageUrls.length >= 6}
              className="hidden"
            />
            <label htmlFor="images" className="cursor-pointer">
              <p className="text-sm text-gray-600">
                {uploadingImages ? 'Uploading...' : 'Click to upload images (JPG, PNG, WebP, max 5MB each)'}
              </p>
            </label>
          </div>

          {/* Image Preview */}
          {imageUrls.length > 0 && (
            <div className="grid gap-4 grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, idx) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="aspect-square rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url, idx)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.imageUrls && (
          <p className="mt-1 text-sm text-red-600">{errors.imageUrls.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary-600 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : listingId ? 'Update Listing' : 'Create Listing'}
      </button>
    </form>
  );
}
