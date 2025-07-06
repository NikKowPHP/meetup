import React, { useState } from 'react';

type PriceType = 'free' | 'paid' | 'all';

interface PriceFilterProps {
  onChange: (priceType: PriceType) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ onChange }) => {
  const [priceType, setPriceType] = useState<PriceType>('all');

  const handleToggle = (type: PriceType) => {
    setPriceType(type);
    onChange(type);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Price:</label>
      <div className="flex space-x-2">
        {(['all', 'free', 'paid'] as PriceType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              priceType === type
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type === 'free' ? 'Free' : 'Paid'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceFilter;