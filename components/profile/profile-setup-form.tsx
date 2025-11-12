'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@/lib/validations';
import { updateProfile } from '@/server/actions/profile';
import { useRouter } from 'next/navigation';
import { MajorSelect } from './major-select';

interface ProfileSetupFormProps {
  userId: string;
}

export function ProfileSetupForm({ userId }: ProfileSetupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const major = watch('major');

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await updateProfile(userId, data);

      if (result.error) {
        setServerError(result.error);
        setIsLoading(false);
        return;
      }

      // Redirect to confirmation page
      router.push('/profile/confirmation');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="John"
            {...register('firstName')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastInitial" className="block text-sm font-medium text-gray-700">
            Last Initial
          </label>
          <input
            id="lastInitial"
            type="text"
            placeholder="D"
            maxLength={1}
            {...register('lastInitial')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.lastInitial && (
            <p className="mt-1 text-sm text-red-600">{errors.lastInitial.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-700">
          Major
        </label>
        <div className="mt-1">
          <MajorSelect value={major} onChange={(value) => setValue('major', value)} />
        </div>
        {errors.major && <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="collegeYear" className="block text-sm font-medium text-gray-700">
            College Year
          </label>
          <select
            id="collegeYear"
            {...register('collegeYear')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Select year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
          </select>
          {errors.collegeYear && (
            <p className="mt-1 text-sm text-red-600">{errors.collegeYear.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700">
            Graduation Year (Optional)
          </label>
          <input
            id="gradYear"
            type="number"
            placeholder="2025"
            {...register('gradYear', {
              valueAsNumber: true,
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.gradYear && (
            <p className="mt-1 text-sm text-red-600">{errors.gradYear.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary-600 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isLoading ? 'Setting up profile...' : 'Complete Profile Setup'}
      </button>
    </form>
  );
}
