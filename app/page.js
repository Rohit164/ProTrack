import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await currentUser()
  
  if (user) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-lg">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 ProTrack
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Modern Project Management & Issue Tracking
          </p>
          <div className="space-y-4">
            <a 
              href="/sign-up" 
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </a>
            <a 
              href="/sign-in" 
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Project Management</p>
          <p>✅ Issue Tracking</p>
          <p>✅ Sprint Planning</p>
          <p>✅ Team Collaboration</p>
        </div>
      </div>
    </div>
  );
}