export interface AvatarOption {
  id: 'male' | 'female';
  gender: 'male' | 'female';
  label: string;
  url: string;
}

export const DEFAULT_AVATARS: readonly [AvatarOption, AvatarOption] = [
  {
    id: 'male',
    gender: 'male',
    label: 'Male Default',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
  },
  {
    id: 'female',
    gender: 'female',
    label: 'Female Default',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  },
] as const;

export const AVATAR_OPTIONS = DEFAULT_AVATARS;

// Maximum allowed custom profile photo size: strictly < 100 KB
export const MAX_AVATAR_SIZE_BYTES = 100 * 1024; // 102,400 bytes

export interface ValidationResult {
  valid: boolean;
  error?: string;
  formattedSize?: string;
}

export function validateAvatarFile(file: { name?: string; type: string; size: number }): ValidationResult {
  if (!file.type || !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select a valid image file (PNG, JPG, WebP, GIF).',
    };
  }

  if (file.size >= MAX_AVATAR_SIZE_BYTES) {
    const sizeKb = (file.size / 1024).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeKb} KB). Image must be smaller than 100 KB.`,
      formattedSize: `${sizeKb} KB`,
    };
  }

  const sizeKb = (file.size / 1024).toFixed(1);
  return {
    valid: true,
    formattedSize: `${sizeKb} KB`,
  };
}
