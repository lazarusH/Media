// Utility function to check if a media request is expired
// A request is expired if the coverage date has passed and it's still pending

export function isRequestExpired(coverageDate: string, status: string): boolean {
  // Only check for pending requests
  if (status !== 'pending') {
    return false;
  }

  try {
    // Parse the coverage date (format: YYYY-MM-DD)
    const coverageDateTime = new Date(coverageDate);
    const now = new Date();
    
    // Set time to end of day for coverage date to be more accurate
    coverageDateTime.setHours(23, 59, 59, 999);
    
    // If coverage date is in the past, the request is expired
    return coverageDateTime < now;
  } catch (error) {
    console.error('Error checking if request is expired:', error);
    return false;
  }
}
