'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/Button';

export default function NotificationPreferences() {
  const { data: session, status } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session.user?.email) {
      checkSubscription();
      if (isSubscribed) {
        fetchKeywords();
      }
    }
  }, [status, session, isSubscribed]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/notifications/keywords');
      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    setKeywordsLoading(true);
    try {
      await fetch('/api/notifications/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: newKeyword }),
      });
      setNewKeyword('');
      fetchKeywords();
    } catch (error) {
      console.error('Error adding keyword:', error);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const handleDeleteKeyword = async (keyword: string) => {
    setKeywordsLoading(true);
    try {
      await fetch('/api/notifications/keywords', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });
      fetchKeywords();
    } catch (error) {
      console.error('Error deleting keyword:', error);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status !== 'authenticated') {
    return <div>Please sign in to manage notifications</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Preferences</h1>
      
      {isSubscribed ? (
        <div className="space-y-4">
          <p>You are currently subscribed to notifications</p>
          <Button 
            onClick={handleUnsubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Disable Notifications'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p>Enable push notifications to stay updated</p>
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Enable Notifications'}
          </Button>
        </div>
      )}
    </div>
  );
}