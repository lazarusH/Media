import { addDays } from 'date-fns';
import { gregorianToEthiopian } from './ethiopianCalendar';

// Ethiopian months have 30 days each, except Pagume which has 5 or 6 days
export const ETHIOPIAN_MONTHS = [
  { name: 'መስከረም', days: 30 },
  { name: 'ጥቅምት', days: 30 },
  { name: 'ኅዳር', days: 30 },
  { name: 'ታኅሳስ', days: 30 },
  { name: 'ጥር', days: 30 },
  { name: 'የካቲት', days: 30 },
  { name: 'መጋቢት', days: 30 },
  { name: 'ሚያዝያ', days: 30 },
  { name: 'ግንቦት', days: 30 },
  { name: 'ሰኔ', days: 30 },
  { name: 'ሐምሌ', days: 30 },
  { name: 'ነሐሴ', days: 30 },
  { name: 'ጳጉሜ', days: 6 } // 5 in non-leap years, 6 in leap years
];

// Ethiopian time periods
export const TIME_PERIODS = {
  'ጥዋት': { start: 0, end: 5 }, // 6 AM - 11 AM (Ethiopian 12 - 5)
  'ከሰዓት': { start: 6, end: 11 }, // 12 PM - 5 PM (Ethiopian 6 - 11)
  'ማታ': { start: 12, end: 17 } // 6 PM - 11 PM (Ethiopian 12 - 5)
};

export interface EthiopianDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  period: keyof typeof TIME_PERIODS;
}

// Convert Ethiopian date to Gregorian using the existing function
export function ethiopianToGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
  // Use the existing gregorianToEthiopian function in reverse
  // This is a simplified approach - for production, use a proper Ethiopian calendar library
  
  // Ethiopian calendar starts around September 11
  const baseYear = ethYear + 7; // Ethiopian year is ~7 years behind Gregorian
  const baseDate = new Date(baseYear, 8, 11); // September 11
  
  // Add months and days (simplified calculation)
  const daysToAdd = (ethMonth - 1) * 30 + (ethDay - 1);
  const result = addDays(baseDate, daysToAdd);
  
  return result;
}

// Accurate Ethiopian to Gregorian conversion (reverse of the provided function)
export function ethiopianToGregorianAccurate(ethYear: number, ethMonth: number, ethDay: number): Date {
  console.log('🔍 Debug: ethiopianToGregorianAccurate input:', { ethYear, ethMonth, ethDay });
  
  // Ethiopian months
  const ethMonths = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታህሳስ",
    "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ",
    "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
  ];

  // Ethiopian month start dates in Gregorian calendar
  // Index 0 = መስከረም (September), Index 11 = ነሐሴ (August)
  const ethMonthStart = [
    [9, 11], [10, 11], [11, 10], [12, 10], [1, 9], [2, 8],
    [3, 10], [4, 9], [5, 9], [6, 8], [7, 8], [8, 7], [9, 6] // [Gregorian month, day]
  ];

  // Calculate Gregorian year - Ethiopian year is 7-8 years behind
  // For 2017 Ethiopian, it should be 2024-2025 Gregorian
  // Use current year as reference to get the correct year
  const currentYear = new Date().getFullYear();
  const currentEthYear = gregorianToEthiopianAccurate(new Date()).year;
  const yearDiff = currentYear - currentEthYear;
  const gYear = ethYear + yearDiff;
  
  console.log('🔍 Debug: ethiopianToGregorianAccurate year calculation:', { currentYear, currentEthYear, yearDiff, gYear });

  // Get the starting Gregorian date for this Ethiopian month
  const [gMonth, gDay] = ethMonthStart[ethMonth - 1];
  const startDate = new Date(gYear, gMonth - 1, gDay);
  
  console.log('🔍 Debug: ethiopianToGregorianAccurate month start:', { gMonth, gDay, startDate });
  
  // Add the days - but we need to add one more day to get tomorrow
  const result = addDays(startDate, ethDay);
  
  console.log('🔍 Debug: ethiopianToGregorianAccurate result:', result);
  return result;
}

// Accurate Gregorian to Ethiopian conversion (using the provided function)
export function gregorianToEthiopianAccurate(gregorianDate = new Date()) {
  // Days of week (same for Gregorian & Ethiopian)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Ethiopian months
  const ethMonths = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታህሳስ",
    "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ",
    "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
  ];

  // Extract Gregorian parts
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1; // JS months are 0-11
  const gDay = gregorianDate.getDate();
  const gDayOfWeek = gregorianDate.getDay();
  const gHour = gregorianDate.getHours();
  const gMinute = gregorianDate.getMinutes();

  // -----------------------
  // Ethiopian YEAR
  let ethYear = (gMonth > 9 || (gMonth === 9 && gDay >= 11)) ? gYear - 7 : gYear - 8;

  // Ethiopian MONTH & DAY (approx. mapping)
  const ethMonthStart = [
    [9, 11], [10, 11], [11, 10], [12, 10], [1, 9], [2, 8],
    [3, 10], [4, 9], [5, 9], [6, 8], [7, 8], [8, 7], [9, 6] // [Gregorian month, day]
  ];

  let ethMonth = 1, ethDay = 1;
  for (let i = 0; i < 13; i++) {
    let [gm, gd] = ethMonthStart[i];
    let gTest = new Date(gYear, gm - 1, gd);
    if (gregorianDate >= gTest) {
      ethMonth = i + 1;
      // Days difference
      const diff = Math.floor((gregorianDate - gTest) / (1000 * 60 * 60 * 24));
      ethDay = diff + 1;
    }
  }

  // -----------------------
  // Ethiopian TIME
  let ethHour = (gHour - 6 + 12) % 12;
  if (ethHour === 0) ethHour = 12;
  const ethMinute = gMinute.toString().padStart(2, "0");

  // -----------------------
  // Return result
  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    hour: ethHour,
    minute: parseInt(ethMinute),
    date: `${ethYear} ${ethMonths[ethMonth - 1]} ${ethDay}`,
    dayOfWeek: days[gDayOfWeek],
    time: `${ethHour}:${ethMinute}`
  };
}

// Convert Ethiopian time to 24-hour format
export function ethiopianTimeTo24Hour(hour: number, minute: number, period: keyof typeof TIME_PERIODS): string {
  console.log('🔍 Debug: ethiopianTimeTo24Hour input:', { hour, minute, period });
  
  let adjustedHour = hour;
  
  // Ethiopian time is 6 hours behind standard time
  // Morning (ጥዋት): 12 AM - 11 AM Ethiopian = 6 AM - 5 PM Standard
  // Afternoon (ከሰዓት): 12 PM - 11 PM Ethiopian = 6 PM - 5 AM Standard
  // Evening (ማታ): Same as Afternoon
  
  if (period === 'ጥዋት') {
    adjustedHour = (hour === 12 ? 6 : hour + 6);
  } else if (period === 'ከሰዓት' || period === 'ማታ') {
    adjustedHour = (hour === 12 ? 18 : hour + 18);
    if (adjustedHour >= 24) adjustedHour -= 24;
  }
  
  console.log('🔍 Debug: ethiopianTimeTo24Hour adjustedHour:', adjustedHour);
  
  // Format as HH:MM:00 for PostgreSQL time format
  const result = `${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  console.log('🔍 Debug: ethiopianTimeTo24Hour result:', result);
  
  return result;
}

// Format Ethiopian date for display
export function formatEthiopianDateForDisplay(date: EthiopianDateTime): string {
  const month = ETHIOPIAN_MONTHS[date.month - 1];
  return `${date.day} ${month.name} ${date.year} ዓ.ም`;
}

// Format Ethiopian time for display
export function formatEthiopianTimeForDisplay(date: EthiopianDateTime): string {
  return `${date.hour}:${date.minute.toString().padStart(2, '0')} ${date.period}`;
}

// Parse Ethiopian date string
export function parseEthiopianDate(dateStr: string): EthiopianDateTime | null {
  console.log('🔍 Debug: parseEthiopianDate input:', dateStr);
  
  // Expected format: "DD MM YYYY" where MM is month number (1-13)
  const parts = dateStr.split(' ').map(Number);
  console.log('🔍 Debug: parseEthiopianDate parts:', parts);
  
  if (parts.length !== 3) {
    console.log('❌ Error: parseEthiopianDate - wrong number of parts');
    return null;
  }

  const [day, month, year] = parts;
  
  // Validate parts
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.log('❌ Error: parseEthiopianDate - NaN values');
    return null;
  }
  if (month < 1 || month > 13) {
    console.log('❌ Error: parseEthiopianDate - invalid month:', month);
    return null;
  }
  if (day < 1 || day > ETHIOPIAN_MONTHS[month - 1].days) {
    console.log('❌ Error: parseEthiopianDate - invalid day:', day, 'for month:', month);
    return null;
  }

  const result = {
    year,
    month,
    day,
    hour: 12,
    minute: 0,
    period: 'ጥዋት' as const
  };
  
  console.log('🔍 Debug: parseEthiopianDate result:', result);
  return result;
}

// Parse Ethiopian time string
export function parseEthiopianTime(timeStr: string): Partial<EthiopianDateTime> | null {
  console.log('🔍 Debug: parseEthiopianTime input:', timeStr);
  
  try {
    // Expected format: "HH:MM PERIOD"
    const [time, period] = timeStr.trim().split(' ');
    console.log('🔍 Debug: parseEthiopianTime time:', time, 'period:', period);
    
    if (!time || !period || !TIME_PERIODS[period as keyof typeof TIME_PERIODS]) {
      console.error('❌ Error: Invalid time format or period:', { timeStr, time, period });
      return null;
    }

    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    console.log('🔍 Debug: parseEthiopianTime hourStr:', hourStr, 'minuteStr:', minuteStr);
    console.log('🔍 Debug: parseEthiopianTime parsed hour:', hour, 'minute:', minute);

    if (isNaN(hour) || isNaN(minute)) {
      console.error('❌ Error: Invalid hour or minute:', { hour, minute });
      return null;
    }

    if (hour < 1 || hour > 12) {
      console.error('❌ Error: Hour out of range (1-12):', hour);
      return null;
    }

    if (minute < 0 || minute > 59) {
      console.error('❌ Error: Minute out of range (0-59):', minute);
      return null;
    }

    const result = {
      hour,
      minute,
      period: period as keyof typeof TIME_PERIODS
    };
    
    console.log('🔍 Debug: parseEthiopianTime result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error: parseEthiopianTime exception:', error);
    return null;
  }
}

// Get minimum allowed Ethiopian date (tomorrow or day after tomorrow based on current time)
export function getMinimumAllowedEthiopianDate(): EthiopianDateTime {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const dayAfterTomorrow = addDays(now, 2);
  
  // If it's past 2 PM (8 ሰዓት), minimum date is day after tomorrow
  const isPastCutoff = now.getHours() >= 14;
  const baseDate = isPastCutoff ? dayAfterTomorrow : tomorrow;
  
  // Convert to Ethiopian calendar
  const ethDate = gregorianToEthiopian(baseDate);
  
  return {
    ...ethDate,
    hour: 12,
    minute: 0,
    period: 'ጥዋት'
  };
}
