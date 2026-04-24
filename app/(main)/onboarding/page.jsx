import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ProTrack!
          </h1>
          <p className="text-gray-600">
            Hello {user.firstName || user.emailAddresses[0].emailAddress}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Getting Started</h3>
            <p className="text-blue-700 text-sm">
              Your ProTrack workspace is being set up. Project management features are coming soon!
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✅ What&apos;s Next</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Create your first project</li>
              <li>• Set up your team</li>
              <li>• Start tracking issues</li>
              <li>• Plan your sprints</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            More features will be added incrementally
          </p>
        </div>
      </div>
    </div>
  )
}