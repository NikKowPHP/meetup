import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface Plan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  interval: string;
  features: string[];
}

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'EventFlow Pro Monthly',
      price: '$9.99',
      priceId: 'price_monthly_123', // Replace with actual Stripe price ID
      interval: 'month',
      features: ['All Pro features', 'Cancel anytime', 'Priority support']
    },
    {
      id: 'annual',
      name: 'EventFlow Pro Annual',
      price: '$99.99',
      priceId: 'price_annual_456', // Replace with actual Stripe price ID
      interval: 'year',
      features: [
        'All Pro features',
        '2 months free',
        'Priority support',
        'Exclusive annual perks'
      ]
    }
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId
        })
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      const data = await response.json();
      router.push('/profile');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Upgrade to EventFlow Pro</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-6 ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-2xl font-bold my-2">{plan.price}</p>
            <p className="text-sm text-gray-500 mb-4">per {plan.interval}</p>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button
              variant={selectedPlan === plan.id ? 'default' : 'outline'}
              onClick={() => setSelectedPlan(plan.id)}
              className="w-full"
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select'}
            </Button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </div>
      )}
    </div>
  );
}