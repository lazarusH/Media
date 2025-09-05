import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import {
  ETHIOPIAN_MONTHS,
  EthiopianDateTime,
  getMinimumAllowedEthiopianDate
} from '@/utils/ethiopianDateInput';

interface EthiopianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EthiopianDateInput({ value, onChange, disabled }: EthiopianDateInputProps) {
  const [date, setDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Initialize with minimum allowed date
  useEffect(() => {
    const minDate = getMinimumAllowedEthiopianDate();
    setDate({
      day: minDate.day.toString(),
      month: minDate.month.toString(),
      year: minDate.year.toString()
    });
  }, []);

  // Update parent when local state changes
  useEffect(() => {
    if (date.day && date.month && date.year) {
      onChange(`${date.day} ${date.month} ${date.year}`);
    }
  }, [date, onChange]);

  const handleInputChange = (field: keyof typeof date) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // If changing the day, validate against the selected month
    if (field === 'day') {
      const selectedMonth = parseInt(date.month) || 1;
      const maxDays = selectedMonth === 13 ? 6 : 30; // Pagume has 5-6 days, we use 6 as max
      const dayValue = parseInt(newValue);
      
      if (dayValue > maxDays) {
        return; // Don't update if day exceeds maximum for the month
      }
    }
    
    setDate(prev => ({ ...prev, [field]: newValue }));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label htmlFor="day">ቀን</Label>
        <Input
          id="day"
          type="number"
          min="1"
          max={date.month === '13' ? '6' : '30'}
          value={date.day}
          onChange={handleInputChange('day')}
          disabled={disabled}
          placeholder="ቀን"
        />
      </div>
      <div>
        <Label htmlFor="month">ወር</Label>
        <Select
          value={date.month}
          onValueChange={(value) => {
            const selectedMonth = parseInt(value);
            const maxDays = selectedMonth === 13 ? 6 : 30;
            const currentDay = parseInt(date.day);
            
            setDate(prev => ({ 
              ...prev, 
              month: value,
              // If current day exceeds max days for new month, reset to 1
              day: currentDay > maxDays ? '1' : prev.day
            }));
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="ወር ይምረጡ" />
          </SelectTrigger>
          <SelectContent>
            {ETHIOPIAN_MONTHS.map((month, index) => (
              <SelectItem key={month.name} value={(index + 1).toString()}>
                {month.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="year">ዓ.ም</Label>
        <Input
          id="year"
          type="number"
          value={date.year}
          onChange={handleInputChange('year')}
          disabled={disabled}
          placeholder="ዓ.ም"
        />
      </div>
    </div>
  );
}
