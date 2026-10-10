export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: 'all', name: 'All Languages', nativeName: 'Global', flag: '🌐' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Mandarin)', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
];

export const CREATABLE_LANGUAGES: LanguageOption[] = POPULAR_LANGUAGES.filter(
  (l) => l.code !== 'all'
);

export function getLanguageFlag(langName?: string): string {
  if (!langName) return '🌐';
  const clean = langName.trim().toLowerCase();
  if (clean === 'all' || clean === 'all languages' || clean === 'any') return '🌐';
  const found = POPULAR_LANGUAGES.find(
    (l) =>
      l.name.toLowerCase() === clean ||
      l.code.toLowerCase() === clean ||
      l.nativeName.toLowerCase() === clean
  );
  if (found) return found.flag;

  // Common fallbacks
  if (clean.includes('english')) return '🇬🇧';
  if (clean.includes('spanish') || clean.includes('espanol')) return '🇪🇸';
  if (clean.includes('french') || clean.includes('francais')) return '🇫🇷';
  if (clean.includes('german') || clean.includes('deutsch')) return '🇩🇪';
  if (clean.includes('arabic')) return '🇸🇦';
  if (clean.includes('bengali') || clean.includes('bangla')) return '🇧🇩';
  if (clean.includes('hindi')) return '🇮🇳';
  if (clean.includes('japanese')) return '🇯🇵';
  if (clean.includes('korean')) return '🇰🇷';
  if (clean.includes('chinese') || clean.includes('mandarin')) return '🇨🇳';
  if (clean.includes('russian')) return '🇷🇺';
  if (clean.includes('portuguese')) return '🇧🇷';
  if (clean.includes('italian')) return '🇮🇹';
  if (clean.includes('turkish')) return '🇹🇷';
  if (clean.includes('urdu')) return '🇵🇰';

  return '🗣️';
}

export function getLanguageName(langName?: string): string {
  if (!langName || langName.toLowerCase() === 'all') return 'All Languages';
  const clean = langName.trim().toLowerCase();
  const found = POPULAR_LANGUAGES.find(
    (l) =>
      l.name.toLowerCase() === clean ||
      l.code.toLowerCase() === clean ||
      l.nativeName.toLowerCase() === clean
  );
  return found ? found.name : langName;
}
