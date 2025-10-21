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

// Convert Gregorian date to Ethiopian calendar using accurate algorithm
export function gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();

  let ethYear = gYear - 7;
  if (gMonth < 9 || (gMonth === 9 && gDay < 11)) {
    ethYear = gYear - 8;
  }

  const ethNewYear = new Date(gYear, 8, 11);
  const daysSinceNewYear = Math.floor((gregorianDate.getTime() - ethNewYear.getTime()) / (1000 * 60 * 60 * 24));
  
  let remainingDays;
  if (daysSinceNewYear < 0) {
    ethYear = gYear - 8;
    const prevEthNewYear = new Date(gYear - 1, 8, 11);
    remainingDays = Math.floor((gregorianDate.getTime() - prevEthNewYear.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    remainingDays = daysSinceNewYear;
  }
  
  let ethMonth = 1;
  let ethDay = 1;
  for (let month = 1; month <= 13; month++) {
    const daysInMonth = (month === 13) ? 6 : 30;
    if (remainingDays < daysInMonth) {
      ethMonth = month;
      ethDay = remainingDays + 1;
      break;
    }
    remainingDays -= daysInMonth;
  }
  return { year: ethYear, month: ethMonth, day: ethDay };
}

// Convert Ethiopian time using accurate algorithm
export function gregorianToEthiopianTime(gregorianDate: Date): { hour: number; minute: number } {
  const gHour = gregorianDate.getHours();
  const gMinute = gregorianDate.getMinutes();

  // Ethiopian TIME conversion from 24-hour to 12-hour format
  // 6 AM - 5 PM (6-17) = 1-12 Ethiopian morning
  // 6 PM - 5 AM (18-23, 0-5) = 1-12 Ethiopian afternoon/evening
  
  let ethHour: number;
  if (gHour >= 6 && gHour < 18) {
    // Morning period: 6 AM - 5 PM = 1-12 Ethiopian
    ethHour = gHour - 5; // 6 becomes 1, 17 becomes 12
  } else {
    // Afternoon/Evening period: 6 PM - 5 AM = 1-12 Ethiopian
    ethHour = gHour + 7; // 18 becomes 1, 5 becomes 12
    if (ethHour > 12) ethHour -= 12;
  }

  return { hour: ethHour, minute: gMinute };
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
