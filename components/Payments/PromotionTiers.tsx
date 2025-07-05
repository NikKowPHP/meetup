import { useState } from 'react';

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

interface Tier {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export default function PromotionTiers() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers: Tier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$5',
      features: ['Standard listing', 'Basic visibility']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$15',
      features: ['Featured listing', 'Priority placement', 'Enhanced visibility'],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$30',
      features: ['Top placement', 'Maximum visibility', 'Premium badge']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`border rounded-lg p-6 ${tier.recommended ? 'border-primary ring-2 ring-primary' : 'border-gray-200'} ${selectedTier === tier.id ? 'bg-primary/10' : ''}`}
          >
            {tier.recommended && (
              <div className="text-xs font-semibold text-primary mb-2">
                RECOMMENDED
              </div>
            )}
            <h3 className="text-lg font-bold">{tier.name}</h3>
            <p className="text-2xl font-bold my-2">{tier.price}</p>
            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={selectedTier === tier.id ? 'default' : 'outline'}
              onClick={() => setSelectedTier(tier.id)}
              className="w-full"
            >
              {selectedTier === tier.id ? 'Selected' : 'Select'}
            </Button>
          </div>
        ))}
      </div>
      {selectedTier && (
        <div className="flex justify-end">
          <Button>Continue to Payment</Button>
        </div>
      )}
    </div>
  );
}