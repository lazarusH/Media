// Security configuration for the application

export const SECURITY_CONFIG = {
  // Rate limiting settings
  RATE_LIMITING: {
    ENABLED: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
    MAX_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_MINUTE || '10'),
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  
  // CSRF protection
  CSRF: {
    ENABLED: import.meta.env.VITE_CSRF_ENABLED !== 'false',
    TOKEN_LENGTH: 64,
  },
  
  // Input validation
  INPUT_VALIDATION: {
    MAX_OFFICE_NAME_LENGTH: 100,
    MAX_LOCATION_LENGTH: 200,
    MAX_AGENDA_LENGTH: 1000,
    MIN_PASSWORD_LENGTH: 8,
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  },
  
  // Content Security Policy
  CSP: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://unhhxjrflgovwsnczynh.supabase.co",
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src': "'self' https://fonts.gstatic.com",
    'img-src': "'self' data: https:",
    'connect-src': "'self' https://unhhxjrflgovwsnczynh.supabase.co",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
  },
  
  // Debug settings
  DEBUG: {
    ENABLE_LOGS: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
  },
} as const;

// Helper function to get CSP header string
export function getCSPHeader(): string {
  return Object.entries(SECURITY_CONFIG.CSP)
    .map(([key, value]) => `${key} ${value}`)
    .join('; ');
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof typeof SECURITY_CONFIG): boolean {
  return SECURITY_CONFIG[feature]?.ENABLED !== false;
}
