import Link from 'next/link';

export default function ErrorCard() {
  return (
    <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
          Oops! Something went wrong!
        </h2>
        <p className="text-gray-600 text-center">
          An error occurred while processing your request.
        </p>
      </div>
      
      <div className="space-y-5">
        <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 animate-pulse">
          <Link href="/sign-in" className="block w-full h-full">
            Go back to sign in
          </Link>
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600">
          Need help?{' '}
          <Link href="https://wa.me/+8801723139610" target="_blank" className="text-purple-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}