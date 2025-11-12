import { ChangePasswordForm } from '@/components/auth/change-password-form';

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Change Password</h1>
        <p className="mb-8 text-gray-600">
          Update your account password to keep your account secure
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
