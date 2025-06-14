import Link from 'next/link';

export default function ErrorCard() {
  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Oops! Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-200">
          An error occurred while processing your request.
        </p>
      </div>

      <div className="space-y-5">
        <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg dark:shadow-lg dark:shadow-red-500/20 hover:dark:shadow-red-500/30 transition-all duration-300 animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed">
          <Link href="/sign-in" className="block w-full h-full">
            Go back to sign in
          </Link>
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Need help?{' '}
          <Link
            href="https://wa.me/+8801723139610"
            target="_blank"
            className="text-[var(--primary)] dark:text-[var(--secondary)] hover:underline transition-colors duration-200"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
