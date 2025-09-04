// Ethiopian Calendar Utilities
// Ethiopian calendar is 7-8 years behind Gregorian and has 13 months
// Each of the first 12 months has 30 days, and the 13th month (Pagume) has 5 or 6 days

const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

const ETHIOPIAN_WEEKDAYS = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'
];

interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;
}

// Convert Gregorian date to Ethiopian calendar
export function gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1; // 0-based to 1-based
  const day = gregorianDate.getDate();
  
  // Ethiopian New Year starts on September 11 (or 12 in leap years)
  const ethiopianYear = year - 7; // Ethiopian calendar is ~7-8 years behind
  
  // Simple approximation - in production, you'd use a proper conversion algorithm
  // For now, just adjust the year and keep similar month/day structure
  let ethMonth = month - 8; // September (9) becomes month 1 (Meskerem)
  let ethDay = day;
  let ethYear = ethiopianYear;
  
  if (ethMonth <= 0) {
    ethMonth += 12;
    ethYear -= 1;
  }
  
  // Ensure month is within bounds (1-13)
  if (ethMonth > 13) {
    ethMonth = 13;
  }
  
  // Ensure day is within bounds for Ethiopian months
  if (ethMonth <= 12 && ethDay > 30) {
    ethDay = 30;
  } else if (ethMonth === 13 && ethDay > 6) {
    ethDay = 6;
  }
  
  return { year: ethYear, month: ethMonth, day: ethDay };
}

// Format Ethiopian date as readable text
export function formatEthiopianDate(date: Date | string): string {
  const gregorianDate = typeof date === 'string' ? new Date(date) : date;
  const ethDate = gregorianToEthiopian(gregorianDate);
  
  const monthName = ETHIOPIAN_MONTHS[ethDate.month - 1] || 'ጳጉሜ';
  
  return `${ethDate.day} ${monthName} ${ethDate.year} ዓ.ም`;
}

// Format Ethiopian time with periods (morning, afternoon, evening)
export function formatEthiopianTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Ethiopian time system: day starts at 6 AM
  // 6 AM = 12 (Ethiopian morning), 12 PM = 6 (Ethiopian afternoon), 6 PM = 12 (Ethiopian evening)
  let ethHour = hours - 6;
  if (ethHour <= 0) ethHour += 12;
  if (ethHour > 12) ethHour -= 12;
  
  let period: string;
  if (hours >= 6 && hours < 12) {
    period = 'ጥዋት'; // Morning
  } else if (hours >= 12 && hours < 18) {
    period = 'ከሰዓት'; // Afternoon
  } else {
    period = 'ማታ'; // Evening/Night
  }
  
  return `${ethHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get Ethiopian weekday name
export function getEthiopianWeekday(date: Date | string): string {
  const gregorianDate = typeof date === 'string' ? new Date(date) : date;
  const dayIndex = gregorianDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return ETHIOPIAN_WEEKDAYS[dayIndex];
}

// Format complete Ethiopian date with weekday
export function formatCompleteEthiopianDate(date: Date | string): string {
  const weekday = getEthiopianWeekday(date);
  const formattedDate = formatEthiopianDate(date);
  return `${weekday}፣ ${formattedDate}`;
}
