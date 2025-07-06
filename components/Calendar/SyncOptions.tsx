import React, { useState } from 'react';

function Button({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface SyncOptionsProps {
  eventIds: string[];
  className?: string;
}

const SyncOptions: React.FC<SyncOptionsProps> = ({ eventIds, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (type: 'ics' | 'google' | 'outlook') => {
    if (isLoading || eventIds.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (type === 'ics') {
        const response = await fetch('/api/calendar/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to export events');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meetup_events.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // TODO: Implement other calendar integrations
        alert(`${type} calendar integration coming soon!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-medium">Add to Calendar</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleExport('ics')}
          disabled={isLoading || eventIds.length === 0}
        >
          {isLoading ? 'Exporting...' : 'Download ICS File'}
        </Button>
        <Button
          onClick={() => handleExport('google')}
          disabled={true}
          variant="outline"
        >
          Google Calendar (Coming Soon)
        </Button>
        <Button
          onClick={() => handleExport('outlook')}
          disabled={true}
          variant="outline"
        >
          Outlook (Coming Soon)
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SyncOptions;