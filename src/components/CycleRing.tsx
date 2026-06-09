'use client';

import { motion } from 'framer-motion';
import { LunarDay, getPhaseLabel, getPhaseEmoji, MoonPhase } from '@/lib/lunar';

interface CycleRingProps {
  lunar: LunarDay;
  size?: number;
}

const PHASES: { phase: MoonPhase; label: string; emoji: string; angle: number }[] = [
  { phase: 'new_moon', label: 'New', emoji: '🌑', angle: 0 },
  { phase: 'waxing_crescent', label: 'Wax ☽', emoji: '🌒', angle: 45 },
  { phase: 'first_quarter', label: '1st Qtr', emoji: '🌓', angle: 90 },
  { phase: 'waxing_gibbous', label: 'Wax ⊙', emoji: '🌔', angle: 135 },
  { phase: 'full_moon', label: 'Full', emoji: '🌕', angle: 180 },
  { phase: 'waning_gibbous', label: 'Wan ⊙', emoji: '🌖', angle: 225 },
  { phase: 'last_quarter', label: 'Last Qtr', emoji: '🌗', angle: 270 },
  { phase: 'waning_crescent', label: 'Wan ☽', emoji: '🌘', angle: 315 },
];

export default function CycleRing({ lunar, size = 280 }: CycleRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = size / 2 - 40;
  const markerR = size / 2 - 24;
  const labelR = size / 2 - 8;

  // Current position angle (0 = new moon = top)
  const progressAngle = (lunar.cyclePercent / 100) * 360 - 90; // -90 to start at top

  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  const pointOnCircle = (r: number, angleDeg: number) => ({
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  });

  // Arc path for progress
  const progressPct = lunar.cyclePercent / 100;
  const endAngle = progressPct * 360;
  const endRad = toRad(endAngle);
  const endX = cx + outerR * Math.cos(endRad);
  const endY = cy + outerR * Math.sin(endRad);
  const startX = cx + outerR * Math.cos(toRad(0));
  const startY = cy + outerR * Math.sin(toRad(0));
  const largeArc = endAngle > 180 ? 1 : 0;

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a2030" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8060e0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#40c0d8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8060e0" />
            <stop offset="100%" stopColor="#40c0d8" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR - 15}
          fill="none"
          stroke="rgba(200,216,240,0.06)"
          strokeWidth={28}
        />

        {/* Progress arc */}
        {progressPct > 0 && progressPct < 1 && (
          <path
            d={`M ${startX} ${startY} A ${outerR - 15} ${outerR - 15} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth={28}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(128,96,224,0.5))' }}
          />
        )}
        {progressPct >= 1 && (
          <circle
            cx={cx}
            cy={cy}
            r={outerR - 15}
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth={28}
          />
        )}

        {/* Phase markers */}
        {PHASES.map(({ phase, emoji, angle }) => {
          const isActive = phase === lunar.phase;
          const pos = pointOnCircle(markerR, angle);
          return (
            <g key={phase}>
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill="rgba(200,216,240,0.1)"
                  stroke="rgba(200,216,240,0.3)"
                  strokeWidth={1}
                />
              )}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isActive ? 16 : 13}
                style={{ userSelect: 'none' }}
              >
                {emoji}
              </text>
            </g>
          );
        })}

        {/* Current position indicator */}
        {(() => {
          const pos = pointOnCircle(outerR - 15, lunar.cyclePercent / 100 * 360);
          return (
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill="#e8f0ff"
              stroke="rgba(232,240,255,0.5)"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 8px rgba(232,240,255,0.8))' }}
              animate={{ scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })()}

        {/* Center info */}
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          fontSize={28}
          style={{ userSelect: 'none' }}
        >
          {getPhaseEmoji(lunar.phase)}
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fontSize={11}
          fill="rgba(200,216,240,0.8)"
          fontWeight={600}
        >
          {getPhaseLabel(lunar.phase)}
        </text>
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          fontSize={10}
          fill="rgba(200,216,240,0.4)"
        >
          Day {Math.round(lunar.age)} · {Math.round(lunar.cyclePercent)}%
        </text>
      </svg>
    </div>
  );
}
