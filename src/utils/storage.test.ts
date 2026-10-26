import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultAppData, getFreshBlankAppData, importAppDataFromJson } from './storage';

test('getDefaultAppData produces clean tutorial-focused workspace', () => {
  const data = getDefaultAppData();
  assert.equal(data.version, 3);
  assert.equal(data.spaces.length, 1);
  assert.equal(data.members.length, 1);
  assert.equal(data.hasDismissedTutorial, false);
  assert.equal(data.tasks.length, 3);
});

test('getFreshBlankAppData produces completely blank workspace', () => {
  const data = getFreshBlankAppData();
  assert.equal(data.tasks.length, 0);
  assert.equal(data.spaces.length, 1);
});

test('importAppDataFromJson validates and parses backups', () => {
  const defaultData = getDefaultAppData();
  const jsonStr = JSON.stringify(defaultData);
  const result = importAppDataFromJson(jsonStr);

  assert.equal(result.success, true);
  assert.ok(result.data);
  assert.equal(result.data?.spaces.length, defaultData.spaces.length);
});

test('importAppDataFromJson rejects corrupted inputs', () => {
  const result = importAppDataFromJson('{"invalid": true}');
  assert.equal(result.success, false);
  assert.ok(result.error);
});
