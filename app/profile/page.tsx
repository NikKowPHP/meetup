import { useSession } from '../../hooks/useSession'

export default function ProfilePage() {
  const { session, isAuthenticated, isLoading } = useSession()

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
        {/* TODO: Add profile update form */}
      </div>
    </div>
  )
}