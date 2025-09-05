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
    hour: '12',
    minute: '00',
    period: 'ጥዋት' as keyof typeof TIME_PERIODS
  });

  // Update parent when local state changes
  useEffect(() => {
    if (time.hour && time.minute && time.period) {
      onChange(`${time.hour}:${time.minute} ${time.period}`);
    }
  }, [time, onChange]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hour = parseInt(e.target.value);
    if (isNaN(hour)) hour = 12;
    if (hour < 1) hour = 1;
    if (hour > 12) hour = 12;
    setTime(prev => ({ ...prev, hour: hour.toString() }));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let minute = parseInt(e.target.value);
    if (isNaN(minute)) minute = 0;
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
          placeholder="ሰዓት"
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
          placeholder="ደቂቃ"
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
