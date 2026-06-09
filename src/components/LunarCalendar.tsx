'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getLunarCalendar,
  getPhaseEmoji,
  getMoonPhase,
  getIllumination,
  getLunarAge,
  getPhaseLabel,
  LunarDay,
} from '@/lib/lunar';
import { format, startOfMonth, getDay } from 'date-fns';

interface LunarCalendarProps {
  onSelectDate?: (day: LunarDay) => void;
  selectedDate?: string;
  sleepData?: Record<string, number>; // date -> quality
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LunarCalendar({ onSelectDate, selectedDate, sleepData }: LunarCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const days = getLunarCalendar(viewYear, viewMonth);
  const firstDayOfMonth = getDay(startOfMonth(new Date(viewYear, viewMonth, 1)));

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getIllumColor = (ill: number) => {
    if (ill < 0.1) return 'rgba(26,32,48,0.9)';
    if (ill < 0.3) return 'rgba(48,80,160,0.8)';
    if (ill < 0.5) return 'rgba(72,120,200,0.8)';
    if (ill < 0.7) return 'rgba(120,170,220,0.85)';
    if (ill < 0.9) return 'rgba(180,210,240,0.9)';
    return 'rgba(232,240,255,0.95)';
  };

  const getQualityColor = (q: number) => {
    if (q >= 8) return '#40c0d8';
    if (q >= 6) return '#8060e0';
    if (q >= 4) return '#e8a030';
    return '#e06080';
  };

  return (
    <div className="luna-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prev}
          className="p-2 rounded-lg glass glass-hover text-lunar-dim hover:text-lunar-silver transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <h3 className="text-base font-semibold text-lunar-silver">
            {format(new Date(viewYear, viewMonth, 1), 'MMMM yyyy')}
          </h3>
        </div>
        <button
          onClick={next}
          className="p-2 rounded-lg glass glass-hover text-lunar-dim hover:text-lunar-silver transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'rgba(200,216,240,0.4)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day, idx) => {
          const dateStr = format(day.date, 'yyyy-MM-dd');
          const isToday = dateStr === format(today, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          const quality = sleepData?.[dateStr];
          const isSpecialPhase =
            day.phase === 'new_moon' ||
            day.phase === 'full_moon' ||
            day.phase === 'first_quarter' ||
            day.phase === 'last_quarter';

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate?.(day)}
              className="relative flex flex-col items-center justify-center rounded-lg p-1 transition-all"
              style={{
                aspectRatio: '1',
                background: isSelected
                  ? 'rgba(64,96,160,0.4)'
                  : isToday
                  ? 'rgba(64,96,160,0.2)'
                  : 'transparent',
                border: isSelected
                  ? '1px solid rgba(200,216,240,0.4)'
                  : isToday
                  ? '1px solid rgba(200,216,240,0.2)'
                  : '1px solid transparent',
              }}
            >
              {/* Moon phase dot */}
              <div
                className="rounded-full mb-0.5"
                style={{
                  width: 14,
                  height: 14,
                  background: getIllumColor(day.illumination),
                  border: `1px solid rgba(200,216,240,${0.1 + day.illumination * 0.3})`,
                  boxShadow: day.illumination > 0.8
                    ? '0 0 6px rgba(232,240,255,0.5)'
                    : 'none',
                }}
              />

              {/* Date number */}
              <span
                className="text-xs font-medium leading-none"
                style={{
                  color: isToday
                    ? '#e8f0ff'
                    : isSelected
                    ? '#c8d8f0'
                    : 'rgba(200,216,240,0.6)',
                  fontSize: '10px',
                }}
              >
                {day.date.getDate()}
              </span>

              {/* Sleep quality dot */}
              {quality !== undefined && (
                <div
                  className="absolute bottom-0.5 right-0.5 rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    background: getQualityColor(quality),
                  }}
                />
              )}

              {/* Phase label for key phases */}
              {isSpecialPhase && (
                <div
                  className="absolute -top-1 -right-1 text-xs leading-none"
                  style={{ fontSize: '8px' }}
                  title={getPhaseLabel(day.phase)}
                >
                  {day.phase === 'new_moon' ? '🌑' :
                   day.phase === 'full_moon' ? '🌕' :
                   day.phase === 'first_quarter' ? '🌓' : '🌗'}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(64,192,216,0.8)' }} />
          Great sleep (8+)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(128,96,224,0.8)' }} />
          Good (6–8)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(224,96,128,0.8)' }} />
          Poor (&lt;6)
        </div>
      </div>
    </div>
  );
}
