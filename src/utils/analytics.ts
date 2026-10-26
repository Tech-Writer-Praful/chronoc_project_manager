import { Task, Member } from '../types';

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  dayIndex: number;
  label: string; // "Oct 12"
  idealRemaining: number;
  actualRemaining: number | null; // null for future dates
  forecastRemaining?: number | null;
  totalScope: number;
  completedScope: number | null; // null for future dates
  idealBurnup: number;
}

export interface ProjectAnalytics {
  startDate: string;
  targetDate: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  totalScopeHours: number;
  completedScopeHours: number;
  remainingScopeHours: number;
  completionRatePercent: number;
  velocityPerHourPerDay: number; // completed estimated hours per day elapsed
  projectedFinishDate: string | null;
  isOnTrack: boolean;
  dailyPoints: DailyDataPoint[];
}

export interface MemberWorkload {
  memberId: string;
  name: string;
  avatar: string;
  role: string;
  assignedTasksCount: number;
  completedTasksCount: number;
  totalEstimatedHours: number;
  completedEstimatedHours: number;
  completionRatePercent: number;
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(dateA: string, dateB: string): number {
  const a = parseDate(dateA).getTime();
  const b = parseDate(dateB).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Computes project duration analytics purely based on individual task estimations
 * and completion status (marked done when moved to 'done').
 */
export function calculateProjectAnalytics(
  tasks: Task[],
  projectStartDate: string,
  projectTargetDate: string,
  referenceDateStr?: string
): ProjectAnalytics {
  const todayStr = referenceDateStr || formatDate(new Date());

  let startDate = projectStartDate;
  let targetDate = projectTargetDate;

  if (diffDays(startDate, targetDate) < 1) {
    targetDate = addDays(startDate, 14);
  }

  const totalDays = Math.max(1, diffDays(startDate, targetDate));
  const rawDaysElapsed = diffDays(startDate, todayStr);
  const daysElapsed = Math.max(0, Math.min(totalDays, rawDaysElapsed));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  // Scope metrics based purely on individual task estimations
  const totalScopeHours = tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const completedScopeHours = completedTasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
  const remainingScopeHours = Math.max(0, totalScopeHours - completedScopeHours);

  const completionRatePercent = totalScopeHours > 0
    ? Math.round((completedScopeHours / totalScopeHours) * 100)
    : 0;

  // Velocity: estimated hours burned per day elapsed
  const effectiveElapsedDays = Math.max(1, daysElapsed);
  const velocityPerHourPerDay = Number((completedScopeHours / effectiveElapsedDays).toFixed(2));

  // Projected finish date based on remaining estimated scope and burn rate
  let projectedFinishDate: string | null = null;
  if (remainingScopeHours === 0) {
    projectedFinishDate = todayStr;
  } else if (velocityPerHourPerDay > 0) {
    const daysNeeded = Math.ceil(remainingScopeHours / velocityPerHourPerDay);
    projectedFinishDate = addDays(todayStr, daysNeeded);
  }

  const dailyPoints: DailyDataPoint[] = [];

  for (let i = 0; i <= totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const isPastOrToday = diffDays(currentDate, todayStr) >= 0;

    const progressFraction = i / totalDays;
    const idealRemaining = Number((totalScopeHours * (1 - progressFraction)).toFixed(1));
    const idealBurnup = Number((totalScopeHours * progressFraction).toFixed(1));

    // Tasks completed on or before this day (status must be 'done')
    const completedUpToDate = tasks.filter((t) => {
      if (t.status !== 'done') return false;
      const compDate = t.completedAt ? t.completedAt.substring(0, 10) : todayStr;
      return diffDays(compDate, currentDate) >= 0;
    });

    const dayCompletedScope = completedUpToDate.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);

    let actualRemaining: number | null = null;
    let completedScope: number | null = null;

    if (isPastOrToday) {
      completedScope = dayCompletedScope;
      actualRemaining = Math.max(0, Number((totalScopeHours - dayCompletedScope).toFixed(1)));
    }

    // Forecast remaining for future dates based on velocity
    let forecastRemaining: number | null = null;
    if (!isPastOrToday && velocityPerHourPerDay > 0) {
      const daysFromToday = diffDays(todayStr, currentDate);
      const forecastedCompleted = completedScopeHours + (velocityPerHourPerDay * daysFromToday);
      forecastRemaining = Math.max(0, Number((totalScopeHours - forecastedCompleted).toFixed(1)));
    } else if (isPastOrToday) {
      forecastRemaining = actualRemaining;
    }

    dailyPoints.push({
      date: currentDate,
      dayIndex: i,
      label: formatShortDate(currentDate),
      idealRemaining,
      actualRemaining,
      forecastRemaining,
      totalScope: totalScopeHours,
      completedScope,
      idealBurnup,
    });
  }

  const todayPoint = dailyPoints[Math.min(dailyPoints.length - 1, daysElapsed)];
  const isOnTrack = !todayPoint || (todayPoint.actualRemaining !== null && todayPoint.actualRemaining <= todayPoint.idealRemaining);

  return {
    startDate,
    targetDate,
    totalDays,
    daysElapsed,
    daysRemaining,
    totalScopeHours,
    completedScopeHours,
    remainingScopeHours,
    completionRatePercent,
    velocityPerHourPerDay,
    projectedFinishDate,
    isOnTrack,
    dailyPoints,
  };
}

/**
 * Calculates member workloads and completion rates based on task estimations.
 */
export function calculateMemberWorkloads(
  members: Member[],
  tasks: Task[]
): MemberWorkload[] {
  return members.map((member) => {
    const assignedTasks = tasks.filter((t) => t.assigneeId === member.id);
    const completedTasks = assignedTasks.filter((t) => t.status === 'done');
    const totalEstimated = assignedTasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
    const completedEstimated = completedTasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
    const completionRate = totalEstimated > 0 ? Math.round((completedEstimated / totalEstimated) * 100) : 0;

    return {
      memberId: member.id,
      name: member.name,
      avatar: member.avatar,
      role: member.role,
      assignedTasksCount: assignedTasks.length,
      completedTasksCount: completedTasks.length,
      totalEstimatedHours: totalEstimated,
      completedEstimatedHours: completedEstimated,
      completionRatePercent: completionRate,
    };
  });
}
