export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Login</h1>
        <p className="mb-6 text-sm text-gray-600">
          Sign in with your .edu email to access StudyShare
        </p>
        {/* Login form component will be added here */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
