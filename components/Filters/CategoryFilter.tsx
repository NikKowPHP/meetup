import React, { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  initialSelected?: string[];
  onChange: (selected: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  initialSelected = [],
  onChange
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const handleToggle = (category: string) => {
    const newSelected = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category];
    
    setSelected(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => handleToggle(category)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selected.includes(category)
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;