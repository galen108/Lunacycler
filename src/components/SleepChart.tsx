'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SleepEntry, getPhaseLabel } from '@/lib/lunar';
import { format, parseISO } from 'date-fns';

interface SleepChartProps {
  data: SleepEntry[];
  view?: 'quality' | 'duration' | 'correlation';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="luna-card p-3 text-xs" style={{ minWidth: 160 }}>
      <div className="text-lunar-silver font-medium mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span style={{ color: 'rgba(200,216,240,0.6)' }}>{p.name}</span>
          <span className="font-semibold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SleepChart({ data, view = 'quality' }: SleepChartProps) {
  const chartData = data.slice(-30).map(entry => ({
    date: format(parseISO(entry.date), 'MMM d'),
    quality: entry.quality,
    duration: entry.duration,
    illumination: Math.round(entry.illumination * 100),
    phase: getPhaseLabel(entry.lunarPhase),
    bedtime: entry.bedtime,
  }));

  if (view === 'quality') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8060e0" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8060e0" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="illumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#40c0d8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#40c0d8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,216,240,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 10]}
            tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: 'rgba(64,192,216,0.4)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine yAxisId="left" y={7} stroke="rgba(200,216,240,0.15)" strokeDasharray="4 4" />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="quality"
            stroke="#8060e0"
            strokeWidth={2}
            fill="url(#qualityGrad)"
            name="Sleep Quality"
            dot={false}
            activeDot={{ r: 4, fill: '#8060e0' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="illumination"
            stroke="#40c0d8"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
            name="Lunar Illumination %"
            activeDot={{ r: 3, fill: '#40c0d8' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (view === 'duration') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#40c0d8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#40c0d8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,216,240,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            domain={[4, 10]}
            tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}h`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={8} stroke="rgba(200,216,240,0.15)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="duration"
            stroke="#40c0d8"
            strokeWidth={2}
            fill="url(#durationGrad)"
            name="Duration (hrs)"
            dot={false}
            activeDot={{ r: 4, fill: '#40c0d8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Correlation view — scatter-like using bedtime vs illumination
  const corrData = data.map(e => ({
    illumination: Math.round(e.illumination * 100),
    quality: e.quality,
    date: format(parseISO(e.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,216,240,0.05)" />
        <XAxis
          dataKey="illumination"
          type="number"
          domain={[0, 100]}
          tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}%`}
          label={{ value: 'Lunar Illumination', position: 'insideBottom', fill: 'rgba(200,216,240,0.3)', fontSize: 10, offset: -2 }}
        />
        <YAxis
          dataKey="quality"
          domain={[0, 10]}
          tick={{ fill: 'rgba(200,216,240,0.4)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Quality', angle: -90, position: 'insideLeft', fill: 'rgba(200,216,240,0.3)', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="quality"
          stroke="#8060e0"
          strokeWidth={0}
          dot={{ fill: '#8060e0', r: 3, strokeWidth: 0, opacity: 0.7 }}
          name="Sleep Quality"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
