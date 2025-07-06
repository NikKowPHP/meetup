import React, { useState } from 'react';

interface DateFilterProps {
  minDate?: Date;
  maxDate?: Date;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  minDate,
  maxDate,
  onChange
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setStartDate(date);
    onChange({ start: date, end: endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setEndDate(date);
    onChange({ start: startDate, end: date });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">From:</label>
        <input
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          min={minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          className="px-3 py-1 border rounded-md text-sm"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">To:</label>
        <input
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          min={startDate ? formatDateForInput(startDate) : minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          className="px-3 py-1 border rounded-md text-sm"
        />
      </div>
    </div>
  );
};

export default DateFilter;