import { TopicItem } from '../types';

export const MOCK_TOPICS: TopicItem[] = [
  {
    id: 'top-1',
    category: 'Daily Life',
    title: 'Morning Routines & Productivity',
    description: 'Discuss how you start your day, habits that keep you energised, and how you organize your mornings.',
    difficulty: 'Beginner',
    popularCount: 1420,
    questions: [
      'What is the very first thing you do when you wake up in the morning?',
      'Are you a morning person or a night owl, and why?',
      'What breakfast gives you the best focus for work or studying?'
    ]
  },
  {
    id: 'top-2',
    category: 'Travel',
    title: 'Unforgettable Journeys & Hidden Gems',
    description: 'Share stories of countries you have explored, dream vacation spots, and travel blunders.',
    difficulty: 'Intermediate',
    popularCount: 2310,
    questions: [
      'What was the most memorable place you have ever traveled to and why?',
      'Do you prefer solo trips, group travel with friends, or family holidays?',
      'If you could live in another country for one year, where would you choose?'
    ]
  },
  {
    id: 'top-3',
    category: 'Technology',
    title: 'AI, Smartphones & Digital Balance',
    description: 'How artificial intelligence and screen habits are reshaping daily communication and careers.',
    difficulty: 'Upper Intermediate',
    popularCount: 3105,
    questions: [
      'How has AI like ChatGPT or language apps changed how you study or work?',
      'Do you practice digital detoxing, or are you connected 24/7?',
      'Which technological invention from the last 20 years could you not live without?'
    ]
  },
  {
    id: 'top-4',
    category: 'Career',
    title: 'Workplace Cultures & Future Aspirations',
    description: 'Talk about remote work vs office, navigating interviews, and your long-term dream vocation.',
    difficulty: 'Intermediate',
    popularCount: 1890,
    questions: [
      'What qualities do you value most in a supportive manager or colleague?',
      'Do you prefer working fully remotely, hybrid, or in a physical office?',
      'What is an English phrase or idiom that you often hear in business environments?'
    ]
  },
  {
    id: 'top-5',
    category: 'Movies',
    title: 'Cinema, Series & Storytelling',
    description: 'Critique your favourite directors, memorable plot twists, and series you binge-watched recently.',
    difficulty: 'Beginner',
    popularCount: 1650,
    questions: [
      'What movie can you watch over and over without ever getting bored?',
      'Do you prefer watching English movies with subtitles or dubbing, and why?',
      'Who is an actor or actress whose performances always impress you?'
    ]
  },
  {
    id: 'top-6',
    category: 'IELTS',
    title: 'Speaking Part 2 & 3: Global Challenges',
    description: 'Structured academic speaking practice for IELTS candidates aiming for Band 7+ fluency.',
    difficulty: 'Advanced',
    popularCount: 2840,
    questions: [
      'Describe an environmental problem your country faces and suggest viable solutions.',
      'How has urbanisation influenced the traditional social structure of local communities?',
      'Do you think governments should invest more in space exploration or public health?'
    ]
  },
  {
    id: 'top-7',
    category: 'Food',
    title: 'Traditional Dishes & Street Food Culture',
    description: 'Describe the culinary heritage of your hometown and dishes everyone must taste once.',
    difficulty: 'Beginner',
    popularCount: 1980,
    questions: [
      'What is the signature dish of your culture and how is it traditionally cooked?',
      'Do you enjoy cooking for others, or do you prefer eating out?',
      'What is the weirdest or most surprising food you have ever tasted?'
    ]
  },
  {
    id: 'top-8',
    category: 'Culture',
    title: 'Traditions, Festivals & Social Etiquette',
    description: 'Compare cultural celebrations, hospitality rituals, and how friendships differ worldwide.',
    difficulty: 'Intermediate',
    popularCount: 2210,
    questions: [
      'What is the biggest festive holiday celebrated in your country?',
      'What is an unspoken social rule in your country that tourists might find surprising?',
      'How do people usually greet each other among family vs professional circles?'
    ]
  }
];
