'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { login } from '@/server/actions/auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await login(data);

      if (result.error) {
        setServerError(result.error);
        setIsLoading(false);
        return;
      }

      // Redirect based on profile setup status
      if (result.data?.isProfileSetUp) {
        router.push('/listings');
      } else {
        router.push('/profile/setup');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="student@university.edu"
          {...register('email')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary-600 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
          Sign up
        </a>
      </p>
    </form>
  );
}
