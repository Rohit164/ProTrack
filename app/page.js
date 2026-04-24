export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 ProTrack
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Successfully Deployed!
          </p>
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Your app is now live on Vercel
          </div>
          <p className="text-sm text-gray-500">
            Project management features will be added incrementally
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Build: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}