import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">StudyShare</h1>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-3 text-sm text-gray-600">
            Sign up with your .edu email to join our campus marketplace
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
