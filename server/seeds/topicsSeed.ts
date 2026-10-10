import { Db } from 'mongodb';

export interface TopicSeedItem {
  title: string;
  slug: string;
  description: string;
  category:
    | 'Daily Life'
    | 'Travel'
    | 'Technology'
    | 'Movies'
    | 'Sports'
    | 'Education'
    | 'Career'
    | 'Food'
    | 'Culture'
    | 'Hobbies'
    | 'Programming'
    | 'IELTS';
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';
  questions: string[];
  createdAt: Date;
}

export const SEED_TOPICS: TopicSeedItem[] = [
  // 1. Daily Life
  {
    title: 'Daily Routines and Morning Habits',
    slug: 'daily-routines-and-morning-habits',
    description: 'Talk about your everyday schedule, morning rituals, and how you boost your energy.',
    category: 'Daily Life',
    difficulty: 'Beginner',
    questions: [
      'What is the very first thing you do right after waking up?',
      'Do you consider yourself an early bird or a night owl, and why?',
      'How does your morning routine differ on weekends compared to weekdays?',
      'What is one small habit that makes your day much more productive?'
    ],
    createdAt: new Date('2026-01-01')
  },
  {
    title: 'Work-Life Balance and Stress Management',
    slug: 'work-life-balance-and-stress-management',
    description: 'Discuss how you disconnect from responsibilities, unwind, and maintain mental clarity.',
    category: 'Daily Life',
    difficulty: 'Intermediate',
    questions: [
      'How do you draw a line between work or studies and personal time?',
      'What activities or hobbies help you release tension after a stressful week?',
      'Have you ever experienced burnout, and what helped you recover?',
      'Do you believe standard 8-hour workdays are still effective in the modern era?'
    ],
    createdAt: new Date('2026-01-02')
  },
  {
    title: 'Shopping Habits and Mindful Consumerism',
    slug: 'shopping-habits-and-mindful-consumerism',
    description: 'Compare online vs in-store shopping, impulse buying, and budgeting practices.',
    category: 'Daily Life',
    difficulty: 'Elementary',
    questions: [
      'Do you prefer shopping online or visiting physical retail stores, and why?',
      'What was the most rewarding purchase you made in the past year?',
      'How do you avoid making impulsive purchases when shopping online?',
      'Is thrifting or buying second-hand items common in your hometown?'
    ],
    createdAt: new Date('2026-01-03')
  },

  // 2. Travel
  {
    title: 'Memorable Journeys and Unexplored Places',
    slug: 'memorable-journeys-and-unexplored-places',
    description: 'Share stories of places you have visited, surprising discoveries, and travel mishaps.',
    category: 'Travel',
    difficulty: 'Intermediate',
    questions: [
      'What is the most memorable travel experience you have ever had?',
      'Do you prefer spontaneous travel or carefully planned itineraries?',
      'What was a cultural surprise you encountered while visiting a different region?',
      'If you could take a one-month trip anywhere in the world tomorrow, where would you go?'
    ],
    createdAt: new Date('2026-01-04')
  },
  {
    title: 'Solo Travel vs Group Adventures',
    slug: 'solo-travel-vs-group-adventures',
    description: 'Debate the freedom of travelling alone versus the joy of shared group memories.',
    category: 'Travel',
    difficulty: 'Upper Intermediate',
    questions: [
      'Have you ever traveled completely on your own, and what did you learn about yourself?',
      'What are the biggest advantages and disadvantages of solo traveling?',
      'How do you deal with disagreements when traveling with friends or family?',
      'What essential safety rules should every traveler know before embarking on a trip?'
    ],
    createdAt: new Date('2026-01-05')
  },
  {
    title: 'Sustainable Tourism and Eco Travel',
    slug: 'sustainable-tourism-and-eco-travel',
    description: 'Discuss overtourism, carbon footprints, and protecting local natural heritage.',
    category: 'Travel',
    difficulty: 'Advanced',
    questions: [
      'In what ways has mass tourism impacted famous tourist landmarks around the world?',
      'How can travelers minimize their ecological impact while exploring distant countries?',
      'Should governments limit the number of visitors allowed in fragile ecological zones?',
      'Do you support eco-friendly tourism even if it costs significantly more?'
    ],
    createdAt: new Date('2026-01-06')
  },

  // 3. Technology
  {
    title: 'Artificial Intelligence in Everyday Life',
    slug: 'artificial-intelligence-in-everyday-life',
    description: 'Explore how generative AI and automation are changing learning, work, and creativity.',
    category: 'Technology',
    difficulty: 'Intermediate',
    questions: [
      'How often do you use AI tools like ChatGPT or Gemini in your daily routine?',
      'Do you think AI makes people more creative or more dependent on technology?',
      'What jobs or industries do you think will change the most due to AI in the next 5 years?',
      'What ethical concerns do you have regarding autonomous artificial intelligence?'
    ],
    createdAt: new Date('2026-01-07')
  },
  {
    title: 'Smartphones and Digital Detox',
    slug: 'smartphones-and-digital-detox',
    description: 'Reflect on screen time habits, notification overload, and unplugging from the web.',
    category: 'Technology',
    difficulty: 'Elementary',
    questions: [
      'Approximately how many hours per day do you spend on your mobile device?',
      'Which app on your phone takes up the majority of your attention?',
      'Have you ever attempted a 24-hour digital detox? How did it feel?',
      'Do you think children under 12 should have access to smartphones?'
    ],
    createdAt: new Date('2026-01-08')
  },
  {
    title: 'The Future of Renewable Energy and Electric Vehicles',
    slug: 'future-of-renewable-energy-and-evs',
    description: 'Discuss clean technologies, solar grids, electric mobility, and energy transition.',
    category: 'Technology',
    difficulty: 'Upper Intermediate',
    questions: [
      'Are electric cars becoming common in your country? What are their main drawbacks?',
      'What renewable energy sources (solar, wind, hydro) are most prevalent in your region?',
      'Do you believe the world can transition 100% away from fossil fuels by 2050?',
      'What role should individuals play in adopting greener tech solutions?'
    ],
    createdAt: new Date('2026-01-09')
  },

  // 4. Movies
  {
    title: 'Cinema, Storytelling, and Favorite Films',
    slug: 'cinema-storytelling-and-favorite-films',
    description: 'Discuss the movies that influenced you, cinema genres, and what makes a great plot.',
    category: 'Movies',
    difficulty: 'Beginner',
    questions: [
      'What is your all-time favorite movie and why has it stayed with you?',
      'Do you prefer watching movies at a cinema theatre or streaming at home on your sofa?',
      'What movie genre do you enjoy the most: sci-fi, comedy, thriller, or drama?',
      'Who is an actor or director whose work you will always watch without hesitation?'
    ],
    createdAt: new Date('2026-01-10')
  },
  {
    title: 'The Golden Age of TV Streaming Series',
    slug: 'golden-age-of-tv-streaming-series',
    description: 'Critique modern television, episodic narrative arcs, and binge-watching culture.',
    category: 'Movies',
    difficulty: 'Intermediate',
    questions: [
      'What is the last television or streaming show you binge-watched in a single weekend?',
      'Do you prefer cliffhanger episodes or self-contained episodic stories?',
      'What classic show had an ending that deeply satisfied or disappointed you?',
      'Are streaming services producing too much content at the expense of storytelling depth?'
    ],
    createdAt: new Date('2026-01-11')
  },
  {
    title: 'Documentaries and True Story Adaptations',
    slug: 'documentaries-and-true-story-adaptations',
    description: 'Analyze how factual events are adapted to cinema and the ethics of biographical films.',
    category: 'Movies',
    difficulty: 'Upper Intermediate',
    questions: [
      'What documentary made you rethink a subject you previously knew little about?',
      'Do biographical films have a responsibility to remain strictly accurate to real history?',
      'Why do you think true crime documentaries have become overwhelmingly popular?',
      'What real-life historical event or personality deserves a high-budget film adaptation?'
    ],
    createdAt: new Date('2026-01-12')
  },

  // 5. Sports
  {
    title: 'Fitness Habits and Staying Active',
    slug: 'fitness-habits-and-staying-active',
    description: 'Talk about working out, jogging, team sports, and personal motivation.',
    category: 'Sports',
    difficulty: 'Beginner',
    questions: [
      'What type of physical exercise or sport do you enjoy doing regularly?',
      'How do you motivate yourself to work out when you feel tired or unmotivated?',
      'Do you prefer team sports like soccer and basketball, or individual sports like swimming?',
      'What fitness goal are you currently trying to achieve?'
    ],
    createdAt: new Date('2026-01-13')
  },
  {
    title: 'The Global Culture of Football and Major Tournaments',
    slug: 'global-culture-of-football-and-major-tournaments',
    description: 'Examine the passion behind the World Cup, Champions League, and international rivalries.',
    category: 'Sports',
    difficulty: 'Intermediate',
    questions: [
      'What is the most popular sport to watch and follow in your home country?',
      'How does the atmosphere in your city change during major sports events like the World Cup?',
      'Do you support a specific sports team, and how did you become a fan?',
      'Should huge international sports tournaments be awarded to countries based on human rights records?'
    ],
    createdAt: new Date('2026-01-14')
  },
  {
    title: 'Esports vs Traditional Athletics',
    slug: 'esports-vs-traditional-athletics',
    description: 'Debate competitive video gaming, physical vs mental endurance, and Olympic status.',
    category: 'Sports',
    difficulty: 'Upper Intermediate',
    questions: [
      'Do you consider competitive gaming (esports) a genuine sport? Why or why not?',
      'What qualities do pro esports players and Olympic athletes share?',
      'Why are competitive video game tournaments attracting stadiums full of young spectators?',
      'Should esports be officially included in the Olympic Games in the near future?'
    ],
    createdAt: new Date('2026-01-15')
  },

  // 6. Education
  {
    title: 'Language Learning Strategies and Accent Confidence',
    slug: 'language-learning-strategies-and-accent-confidence',
    description: 'Exchange tips on memorizing vocabulary, overcoming fear of speaking, and pronunciation.',
    category: 'Education',
    difficulty: 'Intermediate',
    questions: [
      'What was the biggest obstacle you faced when you started speaking English?',
      'How do you expand your vocabulary without forgetting new words after a week?',
      'Do you care about having a native-like accent, or is clear communication your priority?',
      'What advice would you give to a friend who is terrified of making mistakes when speaking?'
    ],
    createdAt: new Date('2026-01-16')
  },
  {
    title: 'Online Learning vs Traditional Classrooms',
    slug: 'online-learning-vs-traditional-classrooms',
    description: 'Compare self-paced digital courses with interactive campus education.',
    category: 'Education',
    difficulty: 'Elementary',
    questions: [
      'Have you ever completed a full course or certification online?',
      'What do you miss most about traditional classrooms when studying on your laptop?',
      'Can an online degree offer the same networking value as an on-campus university degree?',
      'What subject do you think is hardest to learn without an in-person tutor?'
    ],
    createdAt: new Date('2026-01-17')
  },
  {
    title: 'Reinventing School Curriculums for the 21st Century',
    slug: 'reinventing-school-curriculums',
    description: 'Discuss financial literacy, emotional intelligence, and critical thinking in schools.',
    category: 'Education',
    difficulty: 'Advanced',
    questions: [
      'What essential life skills should be mandatory in high school curriculums?',
      'Does standard rote memorization and standardized testing kill student curiosity?',
      'How can schools best prepare young students for jobs that do not exist yet?',
      'Should university education be completely tuition-free for all citizens?'
    ],
    createdAt: new Date('2026-01-18')
  },

  // 7. Career
  {
    title: 'Navigating Job Interviews with Confidence',
    slug: 'navigating-job-interviews-with-confidence',
    description: 'Share tips on answering behavioral questions, salary negotiation, and interview etiquette.',
    category: 'Career',
    difficulty: 'Intermediate',
    questions: [
      'How do you prepare when you have an important job interview scheduled?',
      'What is the hardest question an interviewer has ever asked you?',
      'How do you naturally highlight your strengths without sounding arrogant?',
      'What questions do you always make sure to ask the hiring manager at the end?'
    ],
    createdAt: new Date('2026-01-19')
  },
  {
    title: 'Remote Work, Hybrid Models, and Office Culture',
    slug: 'remote-work-hybrid-models-and-office-culture',
    description: 'Discuss working from home, collaboration tools, watercooler chats, and productivity.',
    category: 'Career',
    difficulty: 'Intermediate',
    questions: [
      'If you could choose your ideal schedule, would you work 100% remotely, hybrid, or in-office?',
      'How do remote teams build genuine trust and friendship without seeing each other in person?',
      'What makes someone a great remote collaborator in Slack, Teams, or email?',
      'Do you feel people work longer hours when their office is in their own living room?'
    ],
    createdAt: new Date('2026-01-20')
  },
  {
    title: 'Leadership, Mentorship, and Career Transitions',
    slug: 'leadership-mentorship-and-career-transitions',
    description: 'Explore pivoting to a new profession, leadership styles, and finding great mentors.',
    category: 'Career',
    difficulty: 'Upper Intermediate',
    questions: [
      'What is the difference between a boss who manages and a leader who inspires?',
      'Have you ever made or considered making a radical career transition to another industry?',
      'How important has having a professional mentor been in your personal growth?',
      'What advice would you give to someone taking on their first managerial position?'
    ],
    createdAt: new Date('2026-01-21')
  },

  // 8. Food
  {
    title: 'Culinary Traditions, Comfort Foods, and Street Eats',
    slug: 'culinary-traditions-comfort-foods-and-street-eats',
    description: 'Describe national delicacies, favorite street food memories, and childhood tastes.',
    category: 'Food',
    difficulty: 'Beginner',
    questions: [
      'What is the national dish of your country, and what ingredients make it unique?',
      'When you are having a tiring day, what comfort food immediately makes you feel better?',
      'Do you enjoy spicy cuisine, and what is the spiciest thing you have ever eaten?',
      'What is your favorite street food snack to buy when you are walking around a market?'
    ],
    createdAt: new Date('2026-01-22')
  },
  {
    title: 'Cooking at Home vs Dining Out',
    slug: 'cooking-at-home-vs-dining-out',
    description: 'Compare cooking as a therapeutic craft with the convenience of restaurants.',
    category: 'Food',
    difficulty: 'Elementary',
    questions: [
      'Do you enjoy cooking your own meals, or do you prefer eating out or ordering delivery?',
      'What is your signature dish that you can cook perfectly without looking at a recipe?',
      'What cooking mistake did you make when you first tried to cook as an independent adult?',
      'If you had to eat only one cuisine (e.g., Italian, Mexican, Japanese) for an entire month, which one would you pick?'
    ],
    createdAt: new Date('2026-01-23')
  },
  {
    title: 'Plant-Based Diets and the Future of Food',
    slug: 'plant-based-diets-and-future-of-food',
    description: 'Examine vegetarianism, lab-grown meats, food waste, and agricultural ethics.',
    category: 'Food',
    difficulty: 'Upper Intermediate',
    questions: [
      'Are plant-based or vegan diets popular where you live? What is public perception of them?',
      'Would you be open to eating lab-grown meat if it tasted identical to real meat?',
      'How does food waste affect our environment, and how can ordinary households reduce it?',
      'Do you think food production will undergo a revolutionary shift over the next three decades?'
    ],
    createdAt: new Date('2026-01-24')
  },

  // 9. Culture
  {
    title: 'Cultural Festivals, Celebrations, and Holidays',
    slug: 'cultural-festivals-celebrations-and-holidays',
    description: 'Share how major holidays, fireworks, and seasonal festivities are celebrated back home.',
    category: 'Culture',
    difficulty: 'Beginner',
    questions: [
      'What is the most joyful holiday or celebration in your country?',
      'What special customs, clothing, or greetings are associated with that festival?',
      'How do families in your country usually spend New Year’s Eve?',
      'Have you ever attended a festival in another country that surprised you?'
    ],
    createdAt: new Date('2026-01-25')
  },
  {
    title: 'Social Etiquette and Unwritten Polite Rules',
    slug: 'social-etiquette-and-unwritten-polite-rules',
    description: 'Compare greetings, tipping habits, punctuality, and cultural taboos around the world.',
    category: 'Culture',
    difficulty: 'Intermediate',
    questions: [
      'How do people typically greet each other in formal and informal situations in your culture?',
      'What is the attitude towards punctuality in your country? Is being 15 minutes late acceptable?',
      'What is a common gesture in your country that might be considered rude or strange elsewhere?',
      'What are the expectations around tipping servers in restaurants where you live?'
    ],
    createdAt: new Date('2026-01-26')
  },
  {
    title: 'Globalization vs Preserving Local Heritage',
    slug: 'globalization-vs-preserving-local-heritage',
    description: 'Discuss how global entertainment, brands, and languages affect regional traditions.',
    category: 'Culture',
    difficulty: 'Advanced',
    questions: [
      'Is globalization eroding local languages and traditional customs in your country?',
      'Can a society embrace modern international trends while vigorously protecting its heritage?',
      'Why do certain ancient arts, crafts, and musical instruments struggle to survive today?',
      'What cultural artifact or tradition from your country are you most proud of?'
    ],
    createdAt: new Date('2026-01-27')
  },

  // 10. Hobbies
  {
    title: 'Creative Outlets and Lifelong Passions',
    slug: 'creative-outlets-and-lifelong-passions',
    description: 'Talk about drawing, photography, musical instruments, writing, and crafts.',
    category: 'Hobbies',
    difficulty: 'Beginner',
    questions: [
      'What creative hobby do you practice, or what would you love to learn if you had unlimited time?',
      'Can you play any musical instruments, or which one do you find most soulful?',
      'Do you take photos purely for memories, or do you view photography as an artistic craft?',
      'Why is it important for adults to have hobbies that have nothing to do with earning money?'
    ],
    createdAt: new Date('2026-01-28')
  },
  {
    title: 'Books, Literature, and Reading Habits',
    slug: 'books-literature-and-reading-habits',
    description: 'Discuss fiction vs non-fiction, physical books vs Kindles, and favorite authors.',
    category: 'Hobbies',
    difficulty: 'Intermediate',
    questions: [
      'Do you prefer holding physical paper books or reading on digital screens like an e-reader?',
      'What book has had the deepest impact on your mindset or outlook on life?',
      'Do you prefer fiction that transports you to other worlds or non-fiction that teaches actionable skills?',
      'How do you manage to read consistently with so many smartphone distractions around?'
    ],
    createdAt: new Date('2026-01-29')
  },
  {
    title: 'Board Games, Puzzles, and Social Gaming',
    slug: 'board-games-puzzles-and-social-gaming',
    description: 'Explore tabletop strategy, chess, escape rooms, and gathering friends without screens.',
    category: 'Hobbies',
    difficulty: 'Elementary',
    questions: [
      'What board games or card games did you play with family while growing up?',
      'Do you enjoy complex strategy games like Chess or Catan, or lighter party games?',
      'Have you ever visited an escape room or solved an intricate puzzle mystery?',
      'Why do you think tabletop board games are enjoying a worldwide resurgence among adults?'
    ],
    createdAt: new Date('2026-01-30')
  },

  // 11. Programming
  {
    title: 'Learning to Code and Building Software',
    slug: 'learning-to-code-and-building-software',
    description: 'Exchange experiences learning your first language, debugging bugs, and project ideas.',
    category: 'Programming',
    difficulty: 'Intermediate',
    questions: [
      'What was the first programming language you learned, and why did you pick it?',
      'What is your personal strategy when you encounter a stubborn bug that takes hours to solve?',
      'Do you prefer frontend UI development, backend distributed systems, or mobile apps?',
      'What is a side project you built or dream of building in your free time?'
    ],
    createdAt: new Date('2026-01-31')
  },
  {
    title: 'Developer Tools, Clean Code, and Best Practices',
    slug: 'developer-tools-clean-code-and-best-practices',
    description: 'Discuss IDEs, Git workflows, automated testing, code reviews, and technical debt.',
    category: 'Programming',
    difficulty: 'Upper Intermediate',
    questions: [
      'What developer tools, shortcuts, or extensions can you not code without?',
      'In your opinion, what distinguishes readable "clean code" from messy "spaghetti code"?',
      'How does your team handle code reviews? What makes a code review constructive?',
      'How do you strike a pragmatic balance between shipping fast and avoiding technical debt?'
    ],
    createdAt: new Date('2026-02-01')
  },
  {
    title: 'AI Coding Assistants and the Future of Software Engineering',
    slug: 'ai-coding-assistants-and-future-of-software',
    description: 'Analyze Copilot, Cursor, LLMs generating code, and what future developers will do.',
    category: 'Programming',
    difficulty: 'Advanced',
    questions: [
      'How has using AI code completion changed your daily programming velocity and focus?',
      'Do you worry that junior developers might rely too heavily on AI without understanding the fundamentals?',
      'Will natural language completely replace syntax-based coding within the next decade?',
      'What human software skills (architecture, security, domain intuition) will remain irreplaceable?'
    ],
    createdAt: new Date('2026-02-02')
  },

  // 12. IELTS
  {
    title: 'IELTS Speaking Part 1: Home, Work, and Hometown',
    slug: 'ielts-speaking-part-1-home-work-hometown',
    description: 'Simulate official Part 1 questions with rapid, fluent responses and varied vocabulary.',
    category: 'IELTS',
    difficulty: 'Intermediate',
    questions: [
      'Can you describe the town or city where you currently reside?',
      'What do you like most about the area surrounding your neighborhood?',
      'Do you think you will continue living there for a long time, and why?',
      'Do you work or are you a student? What are your daily duties?'
    ],
    createdAt: new Date('2026-02-03')
  },
  {
    title: 'IELTS Speaking Part 2: Long Turn Cue Cards',
    slug: 'ielts-speaking-part-2-long-turn-cue-cards',
    description: 'Practice speaking uninterrupted for 2 minutes with structured notes and storytelling.',
    category: 'IELTS',
    difficulty: 'Upper Intermediate',
    questions: [
      'Describe a person who has had a powerful positive influence on your life: who they are, how you met, and why you admire them.',
      'Describe an ambitious goal that you achieved after facing substantial hurdles.',
      'Describe a piece of technology you purchased that made your daily life significantly easier.',
      'Describe an ancient historical building or monument you visited and found breathtaking.'
    ],
    createdAt: new Date('2026-02-04')
  },
  {
    title: 'IELTS Speaking Part 3: Abstract Analysis and Debate',
    slug: 'ielts-speaking-part-3-abstract-analysis',
    description: 'Tackle high-level analytical questions on social shifts, technology, and governance.',
    category: 'IELTS',
    difficulty: 'Advanced',
    questions: [
      'How has consumerism altered the way people perceive success in contemporary society?',
      'To what extent should governments intervene to preserve endangered historical architecture?',
      'Will virtual reality replace the need for physical tourism in the distant future?',
      'Why is it challenging for older and younger generations to agree on cultural priorities?'
    ],
    createdAt: new Date('2026-02-05')
  }
];

export async function seedTopics(db: Db): Promise<number> {
  const collection = db.collection('topics');
  const count = await collection.countDocuments();
  if (count >= 30) {
    console.log(`[MongoDB Topics] Collection already has ${count} topics. Skipping seed.`);
    return count;
  }

  console.log(`[MongoDB Topics] Seeding ${SEED_TOPICS.length} topics into collection...`);
  for (const topic of SEED_TOPICS) {
    await collection.updateOne(
      { slug: topic.slug },
      { $set: topic },
      { upsert: true }
    );
  }

  const finalCount = await collection.countDocuments();
  console.log(`[MongoDB Topics] Seed complete. Total topics: ${finalCount}`);
  return finalCount;
}
