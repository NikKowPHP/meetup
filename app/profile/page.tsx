import { useState } from 'react'
import { useSession } from '../../hooks/useSession'
import { useProfileStore } from '../../store/profile'
import { Button } from '../../components/Button'

export default function ProfilePage() {
  const { session, isAuthenticated, isLoading } = useSession()
  const { updateProfile } = useProfileStore()
  const [name, setName] = useState(session?.user?.name || '')

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in to view this page</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <p className="mt-1">{session?.user?.name || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <p className="mt-1">{session?.user?.email || 'Not provided'}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateProfile({ full_name: name })
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Update Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>
          <Button
            onClick={async () => {
              const response = await fetch('/api/user/manage-subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              const { url } = await response.json();
              window.location.href = url;
            }}
          >
            Manage Subscription
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">My Events</h2>
          <a href="/profile/my-events" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            View Attended Events
          </a>
        </div>
      </div>
    </div>
  )
}