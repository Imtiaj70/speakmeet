export interface CreateRoomInput {
  name: string;
  description?: string;
  topicId: string;
  englishLevel: string;
  language?: string;
  maxParticipants: number;
  visibility: 'public' | 'private';
  hostName?: string;
  hostUsername?: string;
  hostAvatar?: string;
  hostCountry?: string;
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
  topicId?: string;
  englishLevel?: string;
  language?: string;
  maxParticipants?: number;
  visibility?: 'public' | 'private';
  status?: 'waiting' | 'active' | 'closed';
}

const VALID_LEVELS = [
  'All Levels',
  'Any Level',
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
  'Fluent',
];

const VALID_VISIBILITIES = ['public', 'private'];

export function validateCreateRoom(body: any): { valid: boolean; errors: string[]; data?: CreateRoomInput } {
  const errors: string[] = [];

  if (!body) {
    return { valid: false, errors: ['Request body is required'] };
  }

  // Name validation: 3-80 characters
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length < 3 || name.length > 80) {
    errors.push('Room name must be between 3 and 80 characters');
  }

  // Description validation: optional, max 500 chars
  let description = '';
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push('Room description must be a string');
    } else if (body.description.length > 500) {
      errors.push('Room description cannot exceed 500 characters');
    } else {
      description = body.description.trim();
    }
  }

  // Topic validation
  const topicId = typeof body.topicId === 'string' ? body.topicId.trim() : '';
  if (!topicId) {
    errors.push('Topic ID is required');
  }

  // English level validation
  const englishLevel = body.englishLevel;
  if (!VALID_LEVELS.includes(englishLevel)) {
    errors.push(`English level must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  // Max participants: 2-20
  const maxParticipants = Number(body.maxParticipants);
  if (isNaN(maxParticipants) || maxParticipants < 2 || maxParticipants > 20) {
    errors.push('Maximum participants must be a number between 2 and 20');
  }

  // Visibility: public or private
  const visibility = body.visibility || 'public';
  if (!VALID_VISIBILITIES.includes(visibility)) {
    errors.push('Visibility must be either "public" or "private"');
  }

  const language = typeof body.language === 'string' && body.language.trim() ? body.language.trim() : 'English';

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name,
      description,
      topicId,
      englishLevel,
      language,
      maxParticipants,
      visibility,
      hostName: typeof body.hostName === 'string' && body.hostName.trim() ? body.hostName.trim() : undefined,
      hostUsername: typeof body.hostUsername === 'string' && body.hostUsername.trim() ? body.hostUsername.trim() : undefined,
      hostAvatar: typeof body.hostAvatar === 'string' && body.hostAvatar.trim() ? body.hostAvatar.trim() : undefined,
      hostCountry: typeof body.hostCountry === 'string' && body.hostCountry.trim() ? body.hostCountry.trim() : undefined,
    },
  };
}
