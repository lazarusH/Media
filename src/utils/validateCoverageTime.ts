import { addDays, format, parse, isAfter, isBefore, set } from 'date-fns';
import { gregorianToEthiopianTime } from './ethiopianCalendar';

export function isValidCoverageTime(coverageDate: string, coverageTime: string): { isValid: boolean; message: string } {
  try {
    // Parse the input date and time
    const selectedDate = parse(coverageDate, 'yyyy-MM-dd', new Date());
    const selectedTime = parse(coverageTime, 'HH:mm', new Date());
    
    // Get current time
    const now = new Date();
    
    // Calculate tomorrow's date
    const tomorrow = addDays(now, 1);
    tomorrow.setHours(0, 0, 0, 0);

    // If selected date is tomorrow
    if (format(selectedDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      // Simple check: if current time is past 1 PM (13:00), block tomorrow requests
      if (now.getHours() >= 13) {
        return {
          isValid: false,
          message: 'ለነገ የሚሆን የሚድያ ሽፋን ጥያቄ ከ1:00 PM በፊት መቅረብ አለበት። አሁን ሰዓቱ ካለፈ እባክዎ ከነገ ወዲያ ላለው ቀን ያስገቡ።'
        };
      }
    }
    
    // If selected date is before tomorrow
    if (isBefore(selectedDate, tomorrow)) {
      return {
        isValid: false,
        message: 'የሚድያ ሽፋን ጥያቄ የሚቀርብበት ሰአት ስላለፈ ጥያቄዎ ተቀባይነት አላገኘም። ከይቅርታ ጋር!'
      };
    }
    
    return { isValid: true, message: '' };
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false, message: 'የተሳሳተ የቀን ወይም ሰዓት ቅርጸት።' };
  }
}
