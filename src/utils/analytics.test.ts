import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  addDays,
  diffDays,
  calculateProjectAnalytics,
  calculateMemberWorkloads,
} from './analytics';
import { Task, Member } from '../types';

test('date math functions work accurately', () => {
  assert.equal(diffDays('2026-10-01', '2026-10-10'), 9);
  assert.equal(addDays('2026-10-01', 5), '2026-10-06');
  assert.equal(formatDate(new Date(2026, 9, 15)), '2026-10-15');
});

test('calculateProjectAnalytics computes estimation-based duration burndown correctly', () => {
  const dummyTasks: Task[] = [
    {
      id: 'task-1',
      spaceId: 'space-1',
      title: 'Setup Architecture',
      description: 'Setup monorepo and packages',
      status: 'done',
      priority: 'high',
      estimatedHours: 8,
      createdAt: '2026-10-01T10:00:00Z',
      completedAt: '2026-10-05T12:00:00Z',
      tags: ['core'],
    },
    {
      id: 'task-2',
      spaceId: 'space-1',
      title: 'Build API layer',
      description: 'REST and WebSocket endpoints',
      status: 'in_progress',
      priority: 'medium',
      estimatedHours: 12,
      createdAt: '2026-10-02T10:00:00Z',
      tags: ['backend'],
    },
    {
      id: 'task-3',
      spaceId: 'space-1',
      title: 'Design System',
      description: 'Tokens and primitives',
      status: 'todo',
      priority: 'low',
      estimatedHours: 10,
      createdAt: '2026-10-03T10:00:00Z',
      tags: ['ui'],
    },
  ];

  // Reference date: 2026-10-10
  const result = calculateProjectAnalytics(
    dummyTasks,
    '2026-10-01',
    '2026-10-21',
    '2026-10-10'
  );

  assert.equal(result.totalScopeHours, 30); // 8 + 12 + 10
  assert.equal(result.completedScopeHours, 8); // task-1 is done
  assert.equal(result.remainingScopeHours, 22); // 30 - 8 = 22
  assert.equal(result.totalDays, 20); // 2026-10-01 to 2026-10-21
  assert.equal(result.daysElapsed, 9);
  assert.equal(result.daysRemaining, 11);

  // Check daily points exist
  assert.equal(result.dailyPoints.length, 21);
  const day0 = result.dailyPoints[0];
  assert.equal(day0.date, '2026-10-01');
  assert.equal(day0.idealRemaining, 30);
  assert.equal(day0.actualRemaining, 30); // starts at total scope
  assert.equal(day0.idealBurnup, 0);

  // Day 5: task-1 completed, so remaining burned down to 22h
  const day4 = result.dailyPoints[4]; // 2026-10-05
  assert.equal(day4.actualRemaining, 22);
  assert.equal(day4.completedScope, 8);
});

test('calculateMemberWorkloads aggregates purely by task estimates', () => {
  const members: Member[] = [
    { id: 'm-1', name: 'Alice', email: 'alice@test.com', avatar: 'A', role: 'admin', title: 'Tech Lead' },
    { id: 'm-2', name: 'Bob', email: 'bob@test.com', avatar: 'B', role: 'member', title: 'Engineer' },
  ];

  const tasks: Task[] = [
    {
      id: 't-1',
      spaceId: 's-1',
      title: 'T1',
      description: '',
      status: 'done',
      priority: 'medium',
      estimatedHours: 6,
      assigneeId: 'm-1',
      createdAt: '2026-10-01',
      tags: [],
    },
    {
      id: 't-2',
      spaceId: 's-1',
      title: 'T2',
      description: '',
      status: 'todo',
      priority: 'medium',
      estimatedHours: 4,
      assigneeId: 'm-1',
      createdAt: '2026-10-01',
      tags: [],
    },
  ];

  const workloads = calculateMemberWorkloads(members, tasks);
  assert.equal(workloads.length, 2);
  const alice = workloads.find((w) => w.memberId === 'm-1')!;
  assert.equal(alice.assignedTasksCount, 2);
  assert.equal(alice.completedTasksCount, 1);
  assert.equal(alice.totalEstimatedHours, 10);
  assert.equal(alice.completedEstimatedHours, 6);
  assert.equal(alice.completionRatePercent, 60);

  const bob = workloads.find((w) => w.memberId === 'm-2')!;
  assert.equal(bob.assignedTasksCount, 0);
  assert.equal(bob.totalEstimatedHours, 0);
});
