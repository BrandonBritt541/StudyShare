export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mb-6 text-sm text-gray-600">
          Sign up with your .edu email to join StudyShare
        </p>
        {/* Signup form component will be added here */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
