export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[var(--page-bg)] dark:bg-[var(--page-bg)]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
