import { useState } from 'react';
import { useSession } from '../../../hooks/useSession';
import { supabase } from '../../../lib/auth/supabaseClient';

interface UserSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DataPrivacySettings() {
  const { session } = useSession() as { session: UserSession };
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDataDeletion = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to delete your data');
      return;
    }

    if (!window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', session.user.id);

      if (error) throw error;

      setSuccess('Your data has been successfully deleted.');
      // TODO: Trigger logout and redirect
    } catch (err) {
      console.error('Data deletion error:', err);
      setError('Failed to delete your data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Data Privacy Settings</h2>
      
      <div className="border rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Delete All Data</h3>
        <p className="text-red-600 mb-4">
          Warning: This will permanently remove all your account data and cannot be undone.
        </p>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <button
          onClick={handleDataDeletion}
          disabled={isDeleting || !session?.user?.id}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-300"
        >
          {isDeleting ? 'Deleting...' : 'Delete All My Data'}
        </button>
      </div>
    </div>
  );
}