import { PlatformStat, TestimonialItem } from '../types';

export const PLATFORM_STATS: PlatformStat[] = [
  {
    label: 'Active Speakers Today',
    value: '4,850+',
    subtext: 'Practicing right now across 6 continents',
    icon: 'Users'
  },
  {
    label: 'Speaking Minutes Logged',
    value: '3.2M+',
    subtext: 'Real spoken voice conversations',
    icon: 'Clock'
  },
  {
    label: 'Countries Represented',
    value: '138',
    subtext: 'Global community sharing cultures',
    icon: 'Globe'
  },
  {
    label: 'Average Fluency Gain',
    value: '+42%',
    subtext: 'Self-reported confidence in 30 days',
    icon: 'TrendingUp'
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Carlos Mendoza',
    country: 'Mexico',
    countryCode: 'MX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    quote: 'Before SpeakMate, I had studied grammar for 4 years but froze whenever an international colleague spoke to me. Joining 20-minute daily rooms gave me natural speaking reflexes.',
    levelProgress: 'Elementary → Upper Intermediate',
    minutesPracticed: 1840
  },
  {
    id: 'test-2',
    name: 'Yuki Tanaka',
    country: 'Japan',
    countryCode: 'JP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    quote: 'The topic-based rooms take all the awkward silence away. There are conversation questions ready to talk through, and everyone is genuinely encouraging.',
    levelProgress: 'Intermediate → Advanced',
    minutesPracticed: 3420
  },
  {
    id: 'test-3',
    name: 'Fatima Zahra',
    country: 'Morocco',
    countryCode: 'MA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    quote: 'I passed my IELTS Speaking test with Band 7.5 thanks to the dedicated IELTS preparation rooms on SpeakMate. It completely beat studying alone with textbooks.',
    levelProgress: 'Band 6.0 → Band 7.5',
    minutesPracticed: 2150
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Choose a Topic & Level',
    description: 'Pick from daily life conversations, career debates, IELTS questions, or create your own custom room based on your current level.'
  },
  {
    step: '02',
    title: 'Join with One Click',
    description: 'No complicated downloads or waiting queues. Simply jump into an active audio room or launch a room as host directly in your browser.'
  },
  {
    step: '03',
    title: 'Speak Naturally in Real-Time',
    description: 'Engage with peer learners around the globe using low-latency WebRTC voice. Mute/unmute effortlessly and take turns with speaking prompts.'
  },
  {
    step: '04',
    title: 'Track Streaks & Progress',
    description: 'Log your spoken minutes, track weekly consistency streaks, unlock fluency badges, and connect with favorite practice partners.'
  }
];

export const WHY_SPEAKMATE_POINTS = [
  {
    icon: 'Mic',
    title: 'Active Voice, Not Passive Drills',
    description: 'True fluency requires vocal production. Replace tapping flashcards with actual vocalization and organic conversational turn-taking.'
  },
  {
    icon: 'Globe2',
    title: 'Truly International Diversity',
    description: 'Hear accents from Tokyo to Berlin, São Paulo to Istanbul. Get comfortable with real-world English as it is spoken globally.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Safe, Moderated Community',
    description: 'Host moderation controls, instant reporting, participant kicking, and zero-tolerance policy against disrespect ensure a welcoming environment.'
  },
  {
    icon: 'Sparkles',
    title: 'Guided Conversation Questions',
    description: 'Never suffer through awkward silences. Every room has curated contextual conversation prompts to spark vibrant dialogues.'
  },
  {
    icon: 'Zap',
    title: 'Instant Browser Audio',
    description: 'Built on modern WebRTC. High fidelity voice, low-bandwidth optimization, and no phone numbers or apps required.'
  },
  {
    icon: 'BarChart3',
    title: 'Meaningful Progress Metrics',
    description: 'Track your speaking duration, consistency streaks, milestone badges, and session records to stay motivated every day.'
  }
];
