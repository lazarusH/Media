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
  // Extract Gregorian parts
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1; // JS months are 0-11
  const gDay = gregorianDate.getDate();

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

  return { year: ethYear, month: ethMonth, day: ethDay };
}

// Convert Ethiopian time using accurate algorithm
export function gregorianToEthiopianTime(gregorianDate: Date): { hour: number; minute: number } {
  const gHour = gregorianDate.getHours();
  const gMinute = gregorianDate.getMinutes();

  // Ethiopian TIME (6 hours behind standard time)
  // 6 AM = 12 ሰዓት (Ethiopian morning)
  // 12 PM = 6 ሰዓት (Ethiopian afternoon) 
  // 6 PM = 12 ሰዓት (Ethiopian evening)
  // 2 PM = 8 ሰዓት (Ethiopian afternoon)
  
  let ethHour = gHour - 6;
  if (ethHour <= 0) ethHour += 12;
  if (ethHour > 12) ethHour -= 12;

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
