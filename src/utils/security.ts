// Security utilities for input sanitization and validation
import { SECURITY_CONFIG } from '@/config/security';

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitizes text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes office name input
 */
export function sanitizeOfficeName(input: string): string {
  return sanitizeText(input)
    .replace(/[<>\"'&]/g, '') // Only remove potentially dangerous characters, allow special characters
    .substring(0, SECURITY_CONFIG.INPUT_VALIDATION.MAX_OFFICE_NAME_LENGTH); // Limit length
}

/**
 * Validates and sanitizes location input
 */
export function sanitizeLocation(input: string): string {
  return sanitizeText(input)
    .replace(/[^a-zA-Z0-9\u1200-\u137F\s\-.,]/g, '') // Allow alphanumeric, Amharic, spaces, and basic punctuation
    .substring(0, SECURITY_CONFIG.INPUT_VALIDATION.MAX_LOCATION_LENGTH); // Limit length
}

/**
 * Validates and sanitizes agenda input
 */
export function sanitizeAgenda(input: string): string {
  return sanitizeText(input)
    .replace(/[^a-zA-Z0-9\u1200-\u137F\s\-.,!?]/g, '') // Allow alphanumeric, Amharic, spaces, and basic punctuation
    .substring(0, SECURITY_CONFIG.INPUT_VALIDATION.MAX_AGENDA_LENGTH); // Limit length
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < SECURITY_CONFIG.INPUT_VALIDATION.MIN_PASSWORD_LENGTH) {
    return { isValid: false, message: 'የይለፍ ቃል ቢያንስ 8 ቁምፊ መሆን አለበት' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'የይለፍ ቃል ቢያንስ አንድ ትልቅ ፊደል መሆን አለበት' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'የይለፍ ቃል ቢያንስ አንድ ትንሽ ፊደል መሆን አለበት' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'የይለፍ ቃል ቢያንስ አንድ ቁጥር መሆን አለበት' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * Rate limiting utility
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS, windowMs: number = SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    
    const now = Date.now();
    return Math.max(0, attempt.resetTime - now);
  }
}

// Export the rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}