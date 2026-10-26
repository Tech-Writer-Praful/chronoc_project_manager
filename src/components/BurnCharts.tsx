import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Task, TeamSpace, RolePermissions } from '../types';
import { calculateProjectAnalytics, DailyDataPoint } from '../utils/analytics';

interface BurnChartsProps {
  tasks: Task[];
  currentSpace: TeamSpace;
  permissions: RolePermissions;
  onUpdateSpaceDates: (startDate: string, targetDate: string) => void;
}

export const BurnCharts: React.FC<BurnChartsProps> = ({
  tasks,
  currentSpace,
  permissions,
  onUpdateSpaceDates,
}) => {
  const [chartType, setChartType] = useState<'burndown' | 'burnup'>('burndown');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Space dates state for editing
  const [startDate, setStartDate] = useState(currentSpace.projectStartDate);
  const [targetDate, setTargetDate] = useState(currentSpace.projectTargetDate);
  const [isEditingDates, setIsEditingDates] = useState(false);

  const spaceTasks = tasks.filter((t) => t.spaceId === currentSpace.id);

  // Compute full analytics purely based on task estimates & completion dates
  const analytics = calculateProjectAnalytics(
    spaceTasks,
    currentSpace.projectStartDate,
    currentSpace.projectTargetDate
  );

  const {
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
  } = analytics;

  // SVG Chart dimensions & bounds
  const svgWidth = 840;
  const svgHeight = 320;
  const padding = { top: 30, right: 40, bottom: 40, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const maxYValue = Math.max(20, Math.ceil((totalScopeHours * 1.15) / 10) * 10);

  const getX = (index: number) => {
    if (dailyPoints.length <= 1) return padding.left;
    return padding.left + (index / (dailyPoints.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxYValue, val));
    return padding.top + graphHeight - (clamped / maxYValue) * graphHeight;
  };

  // Generate SVG path strings
  // Burndown paths:
  const idealBurndownPath = dailyPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.idealRemaining);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const actualBurndownPoints = dailyPoints.filter((pt) => pt.actualRemaining !== null);
  const actualBurndownPath = actualBurndownPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.actualRemaining!);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const forecastPoints = dailyPoints.filter((pt) => pt.forecastRemaining !== null && pt.dayIndex >= daysElapsed);
  const forecastBurndownPath = forecastPoints.reduce((acc, pt, idx) => {
    const x = getX(pt.dayIndex);
    const y = getY(pt.forecastRemaining!);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Burnup paths:
  const totalScopePath = dailyPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.totalScope);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const idealBurnupPath = dailyPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.idealBurnup);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const completedBurnupPoints = dailyPoints.filter((pt) => pt.completedScope !== null);
  const completedBurnupPath = completedBurnupPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.completedScope!);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Y-axis tick marks
  const yTicks = [0, maxYValue * 0.25, maxYValue * 0.5, maxYValue * 0.75, maxYValue].map((v) =>
    Math.round(v)
  );

  // X-axis tick marks (evenly distributed without collision)
  const step = Math.max(2, Math.floor(dailyPoints.length / 6));
  const rawTicks = dailyPoints.filter((_, i) => i % step === 0);
  const lastPoint = dailyPoints[dailyPoints.length - 1];
  if (lastPoint && rawTicks[rawTicks.length - 1]?.dayIndex !== lastPoint.dayIndex) {
    if (lastPoint.dayIndex - (rawTicks[rawTicks.length - 1]?.dayIndex || 0) < step * 0.65) {
      rawTicks.pop();
    }
    rawTicks.push(lastPoint);
  }
  const xTicks = rawTicks;

  const hoveredPoint: DailyDataPoint | null =
    hoveredPointIndex !== null && dailyPoints[hoveredPointIndex]
      ? dailyPoints[hoveredPointIndex]
      : null;

  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSpaceDates(startDate, targetDate);
    setIsEditingDates(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Duration Overview */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Project Timeline</span>
              <span className="text-xs text-zinc-300">•</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isOnTrack
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isOnTrack ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    On Track with Project Duration
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Pace Behind Ideal Burn Rate
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              {currentSpace.name} Duration Analytics
            </h2>
          </div>

          {/* Project Duration Range Details */}
          <div className="flex items-center gap-3">
            {!isEditingDates ? (
              <div className="flex items-center gap-2 text-xs font-mono bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-800 font-semibold">{currentSpace.projectStartDate}</span>
                <span className="text-zinc-400">→</span>
                <span className="text-zinc-800 font-semibold">{currentSpace.projectTargetDate}</span>
                {permissions.canManageSpaces && (
                  <button
                    onClick={() => setIsEditingDates(true)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 font-sans font-medium text-[11px]"
                  >
                    Edit Dates
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveDates} className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs bg-white border border-zinc-300 rounded-lg px-2 py-1 font-mono"
                  required
                />
                <span className="text-xs text-zinc-400">to</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="text-xs bg-white border border-zinc-300 rounded-lg px-2 py-1 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-zinc-900 text-white rounded-lg text-xs font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingDates(false)}
                  className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1">Total Project Duration</span>
            <div className="text-lg font-bold font-mono text-zinc-900">{totalDays} days</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Day {daysElapsed} of {totalDays} ({daysRemaining} left)
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1">Estimated Scope</span>
            <div className="text-lg font-bold font-mono text-zinc-900">{totalScopeHours}h</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Across {spaceTasks.length} tasks
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1">Completed Work</span>
            <div className="text-lg font-bold font-mono text-emerald-600">{completedScopeHours}h</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {completionRatePercent}% scope completed
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1">Remaining Scope</span>
            <div className="text-lg font-bold font-mono text-zinc-900">{remainingScopeHours}h</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              {spaceTasks.filter((t) => t.status !== 'done').length} tasks remaining
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block mb-1">Burn Velocity</span>
            <div className="text-lg font-bold font-mono text-zinc-900">
              {velocityPerHourPerDay}h <span className="text-xs font-normal text-zinc-400">/day</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              {projectedFinishDate ? `Est: ${projectedFinishDate}` : 'Calculating...'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
        {/* Chart View Toggle & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType('burndown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'burndown'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-zinc-700" />
              <span>Burn-down Chart (Work Remaining)</span>
            </button>

            <button
              onClick={() => setChartType('burnup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'burnup'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-zinc-700" />
              <span>Burn-up Chart (Scope vs Done)</span>
            </button>
          </div>

          {/* Interactive Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 flex-wrap">
            {chartType === 'burndown' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-900 inline-block rounded" />
                  <span>Actual Remaining Scope</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-400 border-b border-dashed border-zinc-400 inline-block" />
                  <span>Ideal Duration Burn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-500 inline-block border-b border-dotted border-indigo-500" />
                  <span>Velocity Forecast</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-900 inline-block rounded" />
                  <span>Total Scope Ceiling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded" />
                  <span>Completed Work</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-zinc-400 border-b border-dashed border-zinc-400 inline-block" />
                  <span>Ideal Pace</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SVG Canvas Container */}
        <div className="relative w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[380px] overflow-visible"
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            {/* Gridlines and Y-axis Labels */}
            {yTicks.map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#f4f4f5"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-zinc-400"
                  >
                    {val}h
                  </text>
                </g>
              );
            })}

            {/* X-axis ticks & date labels */}
            {xTicks.map((pt) => {
              const x = getX(pt.dayIndex);
              return (
                <g key={pt.date}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={svgHeight - padding.bottom}
                    stroke="#f4f4f5"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={svgHeight - padding.bottom + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-zinc-400"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}

            {/* Today indicator vertical dashed bar */}
            {daysElapsed >= 0 && daysElapsed <= totalDays && (
              <g>
                <line
                  x1={getX(daysElapsed)}
                  y1={padding.top}
                  x2={getX(daysElapsed)}
                  y2={svgHeight - padding.bottom}
                  stroke="#a1a1aa"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={getX(daysElapsed)}
                  y={padding.top - 10}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-semibold fill-zinc-700"
                >
                  TODAY
                </text>
              </g>
            )}

            {/* Render lines based on Chart Type */}
            {chartType === 'burndown' ? (
              <>
                {/* 1. Ideal Burndown Line */}
                <path
                  d={idealBurndownPath}
                  fill="none"
                  stroke="#d4d4d8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* 2. Forecast Dotted Line */}
                {forecastBurndownPath && (
                  <path
                    d={forecastBurndownPath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* 3. Actual Remaining Burndown Line */}
                <path
                  d={actualBurndownPath}
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {actualBurndownPoints.map((pt) => {
                  const x = getX(pt.dayIndex);
                  const y = getY(pt.actualRemaining!);
                  const isHovered = hoveredPointIndex === pt.dayIndex;
                  return (
                    <circle
                      key={pt.date}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      className={`transition-all ${
                        isHovered ? 'fill-zinc-900 stroke-white stroke-2' : 'fill-zinc-900'
                      }`}
                    />
                  );
                })}
              </>
            ) : (
              <>
                {/* Burn-up: 1. Total Scope Line */}
                <path
                  d={totalScopePath}
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Burn-up: 2. Ideal Pace Line */}
                <path
                  d={idealBurnupPath}
                  fill="none"
                  stroke="#d4d4d8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Burn-up: 3. Completed Scope Line */}
                <path
                  d={completedBurnupPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {completedBurnupPoints.map((pt) => {
                  const x = getX(pt.dayIndex);
                  const y = getY(pt.completedScope!);
                  const isHovered = hoveredPointIndex === pt.dayIndex;
                  return (
                    <circle
                      key={pt.date}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      className={`transition-all ${
                        isHovered ? 'fill-emerald-600 stroke-white stroke-2' : 'fill-emerald-600'
                      }`}
                    />
                  );
                })}
              </>
            )}

            {/* Invisible hover overlay columns */}
            {dailyPoints.map((pt, idx) => {
              const x = getX(idx);
              const colWidth = graphWidth / Math.max(1, dailyPoints.length);
              return (
                <rect
                  key={pt.date}
                  x={x - colWidth / 2}
                  y={padding.top}
                  width={colWidth}
                  height={graphHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                />
              );
            })}

            {/* Hover Crosshair vertical line */}
            {hoveredPointIndex !== null && (
              <line
                x1={getX(hoveredPointIndex)}
                y1={padding.top}
                x2={getX(hoveredPointIndex)}
                y2={svgHeight - padding.bottom}
                stroke="#71717a"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-zinc-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl z-20 transition-all duration-75"
              style={{
                left: `${Math.min(
                  80,
                  Math.max(15, (getX(hoveredPoint.dayIndex) / svgWidth) * 100)
                )}%`,
                top: '15px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-semibold text-zinc-200 border-b border-zinc-700 pb-1 mb-1 flex items-center justify-between gap-3">
                <span>{hoveredPoint.date} ({hoveredPoint.label})</span>
                <span className="font-mono text-[10px] text-zinc-400">Day {hoveredPoint.dayIndex}</span>
              </div>

              {chartType === 'burndown' ? (
                <div className="space-y-0.5 font-mono text-[11px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Actual Remaining Scope:</span>
                    <span className="font-bold text-white">
                      {hoveredPoint.actualRemaining !== null
                        ? `${hoveredPoint.actualRemaining}h`
                        : hoveredPoint.forecastRemaining !== null
                        ? `${hoveredPoint.forecastRemaining}h (forecast)`
                        : 'Future'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Ideal Remaining:</span>
                    <span className="text-zinc-300">{hoveredPoint.idealRemaining}h</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5 font-mono text-[11px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Total Scope:</span>
                    <span className="font-bold text-white">{hoveredPoint.totalScope}h</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-emerald-400">Completed Work:</span>
                    <span className="font-bold text-emerald-400">
                      {hoveredPoint.completedScope !== null ? `${hoveredPoint.completedScope}h` : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400">Ideal Pace:</span>
                    <span className="text-zinc-300">{hoveredPoint.idealBurnup}h</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informative Guidance Footer */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-start gap-2 text-xs text-zinc-500">
          <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-zinc-700">Continuous Duration Model:</strong> Progress is calculated continuously across your {totalDays}-day project duration. Tasks are marked done only when moved to the Done column on the Kanban board, burning down their estimated hours from the remaining project scope.
          </p>
        </div>
      </div>
    </div>
  );
};
