import React, { useState } from 'react';

interface JoinButtonProps {
  eventId: string;
  initialJoined?: boolean;
  onJoin?: (eventId: string) => Promise<void>;
  className?: string;
}

const JoinButton: React.FC<JoinButtonProps> = ({
  eventId,
  initialJoined = false,
  onJoin,
  className = ''
}) => {
  const [joined, setJoined] = useState(initialJoined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (onJoin) {
        await onJoin(eventId);
      }
      setJoined(!joined);
    } catch (err) {
      setError('Failed to update attendance');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          joined 
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-primary hover:bg-primary/90 text-white'
        } ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          'Processing...'
        ) : joined ? (
          '✓ Joined'
        ) : (
          'Join Event'
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default JoinButton;