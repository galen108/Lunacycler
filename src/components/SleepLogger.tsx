'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Clock, Star, Save, X } from 'lucide-react';
import { getLunarDay, getPhaseLabel, getPhaseEmoji, formatHour, SleepEntry } from '@/lib/lunar';
import { format } from 'date-fns';

interface SleepLoggerProps {
  onSave: (entry: SleepEntry) => void;
  date?: Date;
}

export default function SleepLogger({ onSave, date = new Date() }: SleepLoggerProps) {
  const lunar = getLunarDay(date);
  const [bedtime, setBedtime] = useState(22.5);
  const [wakeTime, setWakeTime] = useState(6.5);
  const [quality, setQuality] = useState(7);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const duration = wakeTime > bedtime ? wakeTime - bedtime : (24 - bedtime) + wakeTime;

  const handleSave = () => {
    const entry: SleepEntry = {
      date: format(date, 'yyyy-MM-dd'),
      bedtime,
      wakeTime,
      duration: Math.round(duration * 10) / 10,
      quality,
      lunarPhase: lunar.phase,
      illumination: lunar.illumination,
      notes: notes || undefined,
    };
    onSave(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const qualityLabels = ['', 'Terrible', 'Very Poor', 'Poor', 'Below Avg', 'Average', 'Good', 'Very Good', 'Great', 'Excellent', 'Perfect'];
  const qualityColors = [
    '', '#e06080', '#e06080', '#e06080', '#e8a030', '#e8a030',
    '#8060e0', '#8060e0', '#40c0d8', '#40c0d8', '#40c0d8',
  ];

  return (
    <div className="luna-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-lunar-silver">Log Sleep</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(200,216,240,0.5)' }}>
            {format(date, 'EEEE, MMMM d')} · {getPhaseEmoji(lunar.phase)} {getPhaseLabel(lunar.phase)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light" style={{ color: 'rgba(200,216,240,0.8)' }}>
            {duration.toFixed(1)}h
          </div>
          <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>duration</div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Bedtime */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'rgba(200,216,240,0.6)' }}>
              <Moon size={12} />
              Bedtime
            </label>
            <span className="text-sm font-medium text-lunar-silver">{formatHour(bedtime)}</span>
          </div>
          <input
            type="range"
            min="20"
            max="27"
            step="0.25"
            value={bedtime}
            onChange={e => setBedtime(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(200,216,240,0.3)' }}>
            <span>8 PM</span>
            <span>3 AM</span>
          </div>
        </div>

        {/* Wake time */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'rgba(200,216,240,0.6)' }}>
              <Clock size={12} />
              Wake Time
            </label>
            <span className="text-sm font-medium text-lunar-silver">{formatHour(wakeTime % 24)}</span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            step="0.25"
            value={wakeTime}
            onChange={e => setWakeTime(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(200,216,240,0.3)' }}>
            <span>4 AM</span>
            <span>12 PM</span>
          </div>
        </div>

        {/* Quality */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'rgba(200,216,240,0.6)' }}>
              <Star size={12} />
              Sleep Quality
            </label>
            <span className="text-sm font-medium" style={{ color: qualityColors[quality] }}>
              {quality}/10 · {qualityLabels[quality]}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setQuality(n)}
                className="flex-1 h-6 rounded transition-all"
                style={{
                  background: n <= quality ? qualityColors[quality] : 'rgba(200,216,240,0.08)',
                  opacity: n <= quality ? 1 : 0.4,
                  transform: n === quality ? 'scaleY(1.3)' : 'scaleY(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(200,216,240,0.6)' }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Dreams, disturbances, how you feel..."
            rows={2}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none transition-all placeholder-lunar-dim"
            style={{
              background: 'rgba(200,216,240,0.05)',
              border: '1px solid rgba(200,216,240,0.1)',
              color: 'rgba(200,216,240,0.8)',
            }}
          />
        </div>

        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: saved
              ? 'rgba(64,192,216,0.2)'
              : 'linear-gradient(135deg, rgba(128,96,224,0.3), rgba(64,192,216,0.3))',
            border: saved
              ? '1px solid rgba(64,192,216,0.4)'
              : '1px solid rgba(128,96,224,0.3)',
            color: saved ? '#40c0d8' : '#c8d8f0',
          }}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                <Star size={14} fill="currentColor" /> Saved to cycle log
              </motion.span>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                <Save size={14} /> Log this night
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
