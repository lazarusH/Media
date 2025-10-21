import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TIME_PERIODS } from '@/utils/ethiopianDateInput';

interface EthiopianTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EthiopianTimeInput({ value, onChange, disabled }: EthiopianTimeInputProps) {
  const [time, setTime] = useState({
    hour: '',
    minute: '',
    period: 'ጥዋት' as keyof typeof TIME_PERIODS
  });

  // Update parent when local state changes
  useEffect(() => {
    if (time.hour && time.minute && time.period) {
      onChange(`${time.hour}:${time.minute} ${time.period}`);
    } else {
      onChange(''); // Clear the value if not all fields are filled
    }
  }, [time, onChange]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTime(prev => ({ ...prev, hour: '' }));
      return;
    }
    let hour = parseInt(value);
    if (isNaN(hour)) return;
    if (hour < 1) hour = 1;
    if (hour > 12) hour = 12;
    setTime(prev => ({ ...prev, hour: hour.toString() }));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTime(prev => ({ ...prev, minute: '' }));
      return;
    }
    let minute = parseInt(value);
    if (isNaN(minute)) return;
    if (minute < 0) minute = 0;
    if (minute > 59) minute = 59;
    setTime(prev => ({ ...prev, minute: minute.toString().padStart(2, '0') }));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label htmlFor="hour">ሰዓት</Label>
        <Input
          id="hour"
          type="number"
          min="1"
          max="12"
          value={time.hour}
          onChange={handleHourChange}
          disabled={disabled}
          placeholder="ሰዓት (1-12)"
        />
      </div>
      <div>
        <Label htmlFor="minute">ደቂቃ</Label>
        <Input
          id="minute"
          type="number"
          min="0"
          max="59"
          value={time.minute}
          onChange={handleMinuteChange}
          disabled={disabled}
          placeholder="ደቂቃ (0-59)"
        />
      </div>
      <div>
        <Label htmlFor="period">ክፍለ ጊዜ</Label>
        <Select
          value={time.period}
          onValueChange={(value) => setTime(prev => ({ ...prev, period: value as keyof typeof TIME_PERIODS }))}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="ክፍለ ጊዜ ይምረጡ" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(TIME_PERIODS).map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
