export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required.' };
  }
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be between 3 and 20 characters.' };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true };
}

export function sanitizeUserProfileInput(data: Record<string, any>): Record<string, any> {
  const allowedFields = [
    'name',
    'username',
    'avatar',
    'country',
    'countryCode',
    'nativeLanguage',
    'englishLevel',
    'learningGoals',
    'interests',
    'bio',
  ];

  const sanitized: Record<string, any> = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string') {
        sanitized[field] = data[field].trim();
      } else if (Array.isArray(data[field])) {
        sanitized[field] = data[field].map((item: any) =>
          typeof item === 'string' ? item.trim() : item
        );
      } else {
        sanitized[field] = data[field];
      }
    }
  }

  // Strictly sanitize username if provided
  if (sanitized.username) {
    sanitized.username = sanitized.username.toLowerCase();
  }

  // Never allow role modification or stat manipulation through profile edits
  delete sanitized.role;
  delete sanitized.firebaseUid;
  delete sanitized.speakingMinutes;
  delete sanitized.speakingSessions;
  delete sanitized.currentStreak;
  delete sanitized.longestStreak;

  return sanitized;
}
