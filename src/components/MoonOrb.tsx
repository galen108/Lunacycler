'use client';

import { MoonPhase, getIllumination } from '@/lib/lunar';

interface MoonOrbProps {
  phase: MoonPhase;
  illumination: number;
  age: number;
  size?: number;
  animate?: boolean;
  showLabel?: boolean;
}

export default function MoonOrb({
  phase,
  illumination,
  age,
  size = 120,
  animate = true,
  showLabel = false,
}: MoonOrbProps) {
  const isWaning = age > 14.77;
  const terminator = illumination;

  // Shadow sweep position — 0=fully dark (new), 1=fully lit (full)
  const litFraction = illumination;
  const shadowX = isWaning
    ? `${(1 - litFraction * 2) * 50}%`
    : `${(litFraction * 2 - 1) * 50}%`;

  const r = size / 2;

  // Build SVG moon shape
  const buildMoonPath = () => {
    if (illumination < 0.02) {
      // New moon — nearly invisible disk
      return `M ${r},${r} m -${r * 0.95},0 a ${r * 0.95},${r * 0.95} 0 1,0 ${r * 1.9},0 a ${r * 0.95},${r * 0.95} 0 1,0 -${r * 1.9},0`;
    }
    if (illumination > 0.98) {
      // Full moon — complete circle
      return null;
    }
    return null;
  };

  const glowIntensity = Math.round(illumination * 60);
  const glowColor = `rgba(232, 240, 255, ${0.15 + illumination * 0.5})`;
  const coreGlow = `rgba(200, 216, 240, ${0.3 + illumination * 0.5})`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={animate ? 'moon-glow orbit-float' : ''}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="moonBase" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e8f0ff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#c8d8f0" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#8aa0c0" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4060a0" stopOpacity="0.7" />
            </radialGradient>

            <radialGradient id="moonShadow" cx={isWaning ? '25%' : '75%'} cy="50%" r="55%">
              <stop offset="0%" stopColor="#020408" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020408" stopOpacity="0.0" />
            </radialGradient>

            <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={glowIntensity * 0.3} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <clipPath id="moonClip">
              <circle cx={r} cy={r} r={r * 0.92} />
            </clipPath>

            {/* Crescent shadow mask */}
            <mask id="crescentMask">
              <circle cx={r} cy={r} r={r * 0.92} fill="white" />
              {illumination < 0.5 && !isWaning && (
                <ellipse
                  cx={r + (0.5 - illumination) * r * 1.8}
                  cy={r}
                  rx={r * 0.92}
                  ry={r * 0.92}
                  fill="black"
                />
              )}
              {illumination < 0.5 && isWaning && (
                <ellipse
                  cx={r - (0.5 - illumination) * r * 1.8}
                  cy={r}
                  rx={r * 0.92}
                  ry={r * 0.92}
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Outer atmospheric glow */}
          {illumination > 0.3 && (
            <circle
              cx={r}
              cy={r}
              r={r * 1.15}
              fill={`rgba(200,216,255,${illumination * 0.08})`}
            />
          )}
          {illumination > 0.6 && (
            <circle
              cx={r}
              cy={r}
              r={r * 1.35}
              fill={`rgba(200,216,255,${illumination * 0.04})`}
            />
          )}

          {/* Moon base disk */}
          <circle
            cx={r}
            cy={r}
            r={r * 0.92}
            fill="url(#moonBase)"
            style={{ filter: illumination > 0.05 ? `drop-shadow(0 0 ${glowIntensity * 0.4}px ${coreGlow})` : 'none' }}
          />

          {/* Crater texture overlay */}
          <g clipPath="url(#moonClip)" opacity={0.15 + illumination * 0.15}>
            <circle cx={r * 0.6} cy={r * 0.55} r={r * 0.08} fill="#8090b0" opacity="0.4" />
            <circle cx={r * 0.6} cy={r * 0.55} r={r * 0.07} fill="none" stroke="#a0b0d0" strokeWidth="1" opacity="0.3" />
            <circle cx={r * 1.25} cy={r * 0.7} r={r * 0.06} fill="#8090b0" opacity="0.3" />
            <circle cx={r * 0.8} cy={r * 1.3} r={r * 0.09} fill="#7080a0" opacity="0.35" />
            <circle cx={r * 0.8} cy={r * 1.3} r={r * 0.08} fill="none" stroke="#9090c0" strokeWidth="0.5" opacity="0.25" />
            <circle cx={r * 1.1} cy={r * 1.15} r={r * 0.05} fill="#8090b0" opacity="0.3" />
            <circle cx={r * 0.5} cy={r * 1.0} r={r * 0.04} fill="#6080a0" opacity="0.25" />
            <ellipse cx={r * 0.75} cy={r * 0.85} rx={r * 0.15} ry={r * 0.08} fill="#5060a0" opacity="0.12" />
          </g>

          {/* Phase shadow — the terminator */}
          {illumination > 0.02 && illumination < 0.98 && (
            <g mask="url(#crescentMask)">
              {/* Shadow side */}
              {isWaning ? (
                <circle cx={r} cy={r} r={r * 0.92} fill="url(#moonShadow)" opacity={0.92} />
              ) : (
                <circle cx={r} cy={r} r={r * 0.92} fill="url(#moonShadow)" opacity={0.92} />
              )}
            </g>
          )}

          {/* New moon — barely visible dark disk */}
          {illumination <= 0.02 && (
            <circle
              cx={r}
              cy={r}
              r={r * 0.92}
              fill="#1a2030"
              stroke="rgba(64,96,160,0.3)"
              strokeWidth="1"
            />
          )}

          {/* Limb highlight */}
          <circle
            cx={r}
            cy={r}
            r={r * 0.92}
            fill="none"
            stroke={`rgba(200,216,255,${illumination * 0.4})`}
            strokeWidth="1"
          />
        </svg>
      </div>

      {showLabel && (
        <div className="text-center">
          <div className="text-xs font-medium" style={{ color: 'rgba(200,216,240,0.7)' }}>
            {Math.round(illumination * 100)}% illuminated
          </div>
        </div>
      )}
    </div>
  );
}
