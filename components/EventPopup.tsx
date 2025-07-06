import React from 'react';
import { NormalizedEvent } from '../types/event';

function Button({
  children,
  variant = 'default',
  onClick,
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  onClick?: () => void;
  className?: string;
}) {
  const baseClasses = 'px-3 py-1 rounded-md font-medium transition-colors text-sm';
  const variantClasses = {
    default: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface EventPopupProps {
  event: NormalizedEvent;
  onJoin?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({
  event,
  onJoin,
  onSave,
  onShare,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-64">
      {event.imageUrl && (
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-32 object-cover rounded-t-lg"
        />
      )}
      <div className="p-3 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <h3 className="font-bold text-lg mb-1">{event.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(event.start)}
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location.address}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={onJoin}
            className="flex-1 py-1 text-sm"
          >
            Join
          </Button>
          <Button 
            variant="outline" 
            onClick={onSave}
            className="flex-1 py-1 text-sm"
          >
            Save
          </Button>
          <Button 
            variant="outline" 
            onClick={onShare}
            className="flex-1 py-1 text-sm"
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;