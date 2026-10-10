/**
 * AI Topic Generator for SpeakMate
 * Generates engaging, spontaneous conversation prompts and questions for language practice.
 */

export interface GeneratedTopic {
  title: string;
  category: string;
  level: string;
  questions: string[];
}

export const AI_TOPIC_PRESETS: GeneratedTopic[] = [
  {
    title: 'AI in Daily Life: Friend or Competitor?',
    category: 'Technology',
    level: 'Intermediate',
    questions: [
      'How often do you use AI tools like ChatGPT or translation apps?',
      'Do you believe AI will replace your profession in the next 10 years?',
      'What is one human skill that AI will never be able to duplicate?'
    ]
  },
  {
    title: 'IELTS Speaking Part 2: A Decision That Changed Your Life',
    category: 'IELTS Prep',
    level: 'Advanced',
    questions: [
      'Describe a crucial choice you made in the past three years.',
      'Why was this decision so difficult to make at the time?',
      'How did your friends or family react to the outcome?'
    ]
  },
  {
    title: 'Cultural Shocks & Embarrassing Travel Moments',
    category: 'Travel & Culture',
    level: 'All Levels',
    questions: [
      'What was the strangest tradition you noticed when visiting another country?',
      'Have you ever made a language mistake that made locals laugh?',
      'If you had to move abroad tomorrow, which country would you choose?'
    ]
  },
  {
    title: 'Remote Work vs. Traditional Office: What Truly Works?',
    category: 'Career & Business',
    level: 'Intermediate',
    questions: [
      'Are people more productive working from home or in an office?',
      'How do you prevent burnout when your bedroom is also your workspace?',
      'What makes a company culture truly healthy and supportive?'
    ]
  },
  {
    title: 'Daily Coffee, Habits & Morning Routines',
    category: 'Casual Daily',
    level: 'Beginner',
    questions: [
      'Are you a morning person or a night owl, and why?',
      'What is the very first beverage or food you consume after waking up?',
      'What habit has improved your happiness the most recently?'
    ]
  },
  {
    title: 'IELTS Speaking Part 3: Social Media Impact on Youth',
    category: 'IELTS Prep',
    level: 'Advanced',
    questions: [
      'Do social networking platforms bring people closer or isolate them?',
      'Should governments enforce age restrictions on smartphone usage?',
      'How has online communication altered human friendships?'
    ]
  },
  {
    title: 'If You Could Live in Any Historical Era for 7 Days',
    category: 'Philosophy & Fun',
    level: 'All Levels',
    questions: [
      'Which decade or century in history fascinates you the most?',
      'Would you want to change any historical event, or just observe?',
      'What modern invention would you miss the most during those 7 days?'
    ]
  },
  {
    title: 'Mastering Spoken English: How to Overcome Shyness & Anxiety',
    category: 'Language Learning',
    level: 'Beginner',
    questions: [
      'What is your biggest fear when speaking English with native speakers?',
      'Do you think in your native language before translating to English?',
      'What speaking technique has helped your pronunciation the most?'
    ]
  },
  {
    title: 'Cinema, Streaming & The Best TV Series of the Decade',
    category: 'Pop Culture',
    level: 'All Levels',
    questions: [
      'What movie ending left you speechless or thinking for days?',
      'Do you prefer binge-watching an entire season or one episode per week?',
      'Which fictional character would you love to have dinner with in real life?'
    ]
  },
  {
    title: 'Climate Change, Green Tech & Individual Responsibility',
    category: 'Global Issues',
    level: 'Upper Intermediate',
    questions: [
      'Do individual actions like recycling make a real dent in global warming?',
      'Would you purchase an electric vehicle if charging stations were everywhere?',
      'What environmental change have you personally noticed in your hometown?'
    ]
  },
  {
    title: 'Culinary Battles: Traditional Street Food vs. Fine Dining',
    category: 'Food & Lifestyle',
    level: 'All Levels',
    questions: [
      'What is the national dish of your country that everyone must taste?',
      'Do you enjoy cooking at home or ordering takeout from local restaurants?',
      'What is the strangest or most exotic food you have ever eaten?'
    ]
  },
  {
    title: 'The Art of Negotiation & Dealing with Difficult People',
    category: 'Career & Business',
    level: 'Advanced',
    questions: [
      'How do you handle disagreement with someone who is stubborn?',
      'Have you ever successfully bargained for a salary raise or a discount?',
      'What body language signs indicate someone is confident versus arrogant?'
    ]
  }
];

let lastGeneratedIndex = -1;

export function generateRandomAITopic(category?: string): GeneratedTopic {
  let candidates = AI_TOPIC_PRESETS;
  if (category && category !== 'All' && category !== 'Surprise Me') {
    const filtered = AI_TOPIC_PRESETS.filter(
      (t) => t.category.toLowerCase().includes(category.toLowerCase())
    );
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  // Pick an index different from the previous one for fresh variety
  let newIndex = Math.floor(Math.random() * candidates.length);
  if (candidates.length > 1 && newIndex === lastGeneratedIndex) {
    newIndex = (newIndex + 1) % candidates.length;
  }
  lastGeneratedIndex = newIndex;

  return candidates[newIndex];
}
