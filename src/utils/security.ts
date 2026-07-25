/**
 * Security & Anti-XSS Protection Library
 * Handles input sanitization, dangerous URL filtering, anti-XSS stripping,
 * client-side rate limiting, CSRF protection, and security audit logging.
 */

// 1. Anti-XSS Input Sanitizer
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    // Convert dangerous HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

// 2. Strip dangerous script tags, event handlers, and active content from rich text / markdown
export function sanitizeRichContent(content: string): string {
  if (!content) return '';

  return content
    // Remove inline scripts and tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/<object\b[^<]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove inline JS event attributes (e.g., onload=, onerror=, onclick=)
    .replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Filter out pseudo protocols in attributes
    .replace(/href\s*=\s*["']?\s*javascript:[^"'>]+/gi, 'href="#"')
    .replace(/src\s*=\s*["']?\s*javascript:[^"'>]+/gi, 'src=""')
    .replace(/data:[^;]+;base64/gi, '');
}

// 3. Safe URL Validation
export function sanitizeUrl(url: string, fallback = '#'): string {
  if (!url) return fallback;
  const trimmed = url.trim();

  // Allow anchor links and relative paths
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Ensure standard protocol
  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // If not a valid URL
    return fallback;
  }

  return fallback;
}

// 4. Rate Limiter (Token Bucket / Sliding Window in localStorage)
interface RateLimitRecord {
  timestamps: number[];
}

export function checkRateLimit(
  actionKey: string,
  limit = 5,
  windowMs = 60000
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const storageKey = `jmg_sec_rl_${actionKey}`;
  
  let record: RateLimitRecord = { timestamps: [] };
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      record = JSON.parse(saved);
    }
  } catch {
    record = { timestamps: [] };
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
    };
  }

  // Record action
  record.timestamps.push(now);
  try {
    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch {
    // Fallback if quota exceeded
  }

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
  };
}

// 5. Password Strength Validator
export interface PasswordStrength {
  score: number; // 0 to 4
  feedback: string[];
  isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters required');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include at least one uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Include at least one special character (!@#$%^&*)');

  return {
    score,
    feedback,
    isStrong: score >= 3,
  };
}

// 6. Anti-CSRF Token Manager
export function getCSRFToken(): string {
  let token = localStorage.getItem('jmg_csrf_token');
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('jmg_csrf_token', token);
  }
  return token;
}

export function verifyCSRFToken(token: string): boolean {
  const stored = localStorage.getItem('jmg_csrf_token');
  return stored !== null && stored === token;
}

// 7. Security Audit Log
export interface SecurityLog {
  id: string;
  type: 'XSS_PREVENTED' | 'RATE_LIMIT_BLOCKED' | 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'SUSPICIOUS_INPUT';
  message: string;
  timestamp: string;
  details?: string;
}

export function logSecurityEvent(
  type: SecurityLog['type'],
  message: string,
  details?: string
) {
  const logsKey = 'jmg_security_logs';
  let logs: SecurityLog[] = [];
  
  try {
    const saved = localStorage.getItem(logsKey);
    if (saved) logs = JSON.parse(saved);
  } catch {
    logs = [];
  }

  const newLog: SecurityLog = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    details,
  };

  logs.unshift(newLog);
  // Keep last 50 logs
  if (logs.length > 50) logs = logs.slice(0, 50);

  try {
    localStorage.setItem(logsKey, JSON.stringify(logs));
  } catch {
    // Ignore storage errors
  }
}

export function getSecurityLogs(): SecurityLog[] {
  try {
    const saved = localStorage.getItem('jmg_security_logs');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
