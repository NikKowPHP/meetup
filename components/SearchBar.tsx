import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  placeholder = 'Search events...',
  className = ''
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  // Update search term when route changes
  useEffect(() => {
    if (router.query.q !== searchTerm) {
      setSearchTerm(router.query.q as string || '');
    }
  }, [router.query.q]);

  // Debounced search function
  const debouncedSearch = useDebouncedSearch((term: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, q: term }
    });
    setIsTyping(false);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsTyping(true);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {isTyping && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;