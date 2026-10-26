import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_AVATARS,
  MAX_AVATAR_SIZE_BYTES,
  validateAvatarFile,
} from './avatar';

test('DEFAULT_AVATARS contains exactly one male and one female default image', () => {
  assert.equal(DEFAULT_AVATARS.length, 2);
  const male = DEFAULT_AVATARS.find((a) => a.id === 'male');
  const female = DEFAULT_AVATARS.find((a) => a.id === 'female');

  assert.ok(male, 'Male default avatar must exist');
  assert.ok(female, 'Female default avatar must exist');
  assert.equal(male.gender, 'male');
  assert.equal(female.gender, 'female');
  assert.ok(male.url.startsWith('https://images.unsplash.com/'));
  assert.ok(female.url.startsWith('https://images.unsplash.com/'));
});

test('MAX_AVATAR_SIZE_BYTES is exactly 100 KB', () => {
  assert.equal(MAX_AVATAR_SIZE_BYTES, 100 * 1024);
  assert.equal(MAX_AVATAR_SIZE_BYTES, 102400);
});

test('validateAvatarFile accepts valid image under 100 KB', () => {
  const result = validateAvatarFile({
    name: 'profile.jpg',
    type: 'image/jpeg',
    size: 45 * 1024, // 45 KB
  });

  assert.equal(result.valid, true);
  assert.equal(result.formattedSize, '45.0 KB');
  assert.equal(result.error, undefined);
});

test('validateAvatarFile rejects files >= 100 KB', () => {
  // Exactly 100 KB
  const exact100Kb = validateAvatarFile({
    name: 'large.png',
    type: 'image/png',
    size: 100 * 1024,
  });
  assert.equal(exact100Kb.valid, false);
  assert.ok(exact100Kb.error?.includes('smaller than 100 KB'));

  // 150 KB
  const over100Kb = validateAvatarFile({
    name: 'huge.jpg',
    type: 'image/jpeg',
    size: 150 * 1024,
  });
  assert.equal(over100Kb.valid, false);
  assert.ok(over100Kb.error?.includes('150.0 KB'));
});

test('validateAvatarFile rejects non-image files regardless of size', () => {
  const textFile = validateAvatarFile({
    name: 'data.json',
    type: 'application/json',
    size: 5 * 1024,
  });
  assert.equal(textFile.valid, false);
  assert.ok(textFile.error?.includes('valid image file'));
});
