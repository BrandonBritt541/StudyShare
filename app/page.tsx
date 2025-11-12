export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl px-6 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Welcome to StudyShare
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Buy and sell used textbooks and school supplies on your campus
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
          >
            Login
          </a>
          <a
            href="/signup"
            className="rounded-lg border-2 border-primary-600 px-6 py-3 font-semibold text-primary-600 hover:bg-blue-50"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
