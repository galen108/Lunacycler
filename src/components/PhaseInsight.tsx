'use client';

import { motion } from 'framer-motion';
import { Brain, Moon, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { LunarDay, getLunarSleepPrediction, getPhaseLabel, getPhaseEmoji, getNextFullMoon, getNextNewMoon } from '@/lib/lunar';
import { formatDistanceToNow, format } from 'date-fns';

interface PhaseInsightProps {
  lunar: LunarDay;
}

export default function PhaseInsight({ lunar }: PhaseInsightProps) {
  const prediction = getLunarSleepPrediction(lunar.age);
  const nextFull = getNextFullMoon(lunar.date);
  const nextNew = getNextNewMoon(lunar.date);

  const metricsConfig = [
    {
      icon: <Brain size={14} />,
      label: 'Predicted Quality',
      value: `${prediction.predictedQuality}/10`,
      sub: prediction.predictedQuality >= 7 ? 'Favorable' : prediction.predictedQuality >= 5 ? 'Moderate' : 'Disrupted',
      color: prediction.predictedQuality >= 7 ? '#40c0d8' : prediction.predictedQuality >= 5 ? '#e8a030' : '#e06080',
    },
    {
      icon: <Clock size={14} />,
      label: 'Sleep Latency',
      value: `~${prediction.predictedLatency}m`,
      sub: 'Time to fall asleep',
      color: prediction.predictedLatency < 15 ? '#40c0d8' : prediction.predictedLatency < 25 ? '#e8a030' : '#e06080',
    },
    {
      icon: <Zap size={14} />,
      label: 'REM Sleep',
      value: `~${prediction.predictedREM}%`,
      sub: 'Predicted REM fraction',
      color: prediction.predictedREM >= 25 ? '#40c0d8' : '#e8a030',
    },
    {
      icon: <Moon size={14} />,
      label: 'Illumination',
      value: `${Math.round(lunar.illumination * 100)}%`,
      sub: `Day ${Math.round(lunar.age)} of cycle`,
      color: '#8060e0',
    },
  ];

  const getPhaseDescription = () => {
    const descriptions: Record<string, string> = {
      new_moon: 'The new moon phase creates near-total darkness, reducing pineal gland suppression. Melatonin production is at its peak, making this the optimal window for deep, restorative sleep. The Lunacycler model predicts maximum slow-wave sleep density during this phase.',
      waxing_crescent: 'Lunar luminance is building but remains low. A favorable window for quality sleep as the circadian system adjusts to increasing photon pressure. Early bedtime sessions show enhanced REM architecture during this phase.',
      first_quarter: 'At the lunar quadrature, approximately 50% of the lunar disk is illuminated. The chronobiological model suggests a transitional sleep pattern — quality begins to decline but remains manageable with proper light hygiene.',
      waxing_gibbous: 'Increasing lunar brightness begins to suppress evening melatonin. The Lunacycler framework identifies this as a critical adaptation window. Blackout curtains and amber lighting can mitigate phase disruption.',
      full_moon: 'Peak lunar luminance. Multiple studies align with the Lunacycler model: REM sleep is reduced, sleep onset delayed by 5–12 minutes, and total sleep time decreases by approximately 20 minutes. Light management is essential.',
      waning_gibbous: 'Post-full phase recovery begins. The circadian system starts recalibrating as lunar luminance decreases. Sleep quality improves gradually, with most individuals reporting better rest within 2–3 nights.',
      last_quarter: 'The descending quadrature phase shows steadily improving sleep metrics. The chronobiological pressure from lunar illumination is waning, and melatonin onset timing normalizes.',
      waning_crescent: 'The final crescent phase approaches the rest-optimal new moon. This is an excellent phase for sleep debt recovery. The Lunacycler model predicts above-average slow-wave sleep density as lunar influence reaches its nadir.',
    };
    return descriptions[lunar.phase] ?? '';
  };

  return (
    <div className="space-y-4">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {metricsConfig.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="luna-card p-4"
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: 'rgba(200,216,240,0.5)' }}>
              {m.icon}
              <span className="text-xs">{m.label}</span>
            </div>
            <div className="text-xl font-semibold" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,216,240,0.4)' }}>
              {m.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="luna-card p-4"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: 'rgba(128,96,224,0.2)' }}>
            <TrendingUp size={14} style={{ color: '#8060e0' }} />
          </div>
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: '#8060e0' }}>
              Tonight's Recommendation
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,216,240,0.7)' }}>
              {prediction.recommendation}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Phase description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="luna-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{getPhaseEmoji(lunar.phase)}</span>
          <span className="text-sm font-semibold text-lunar-silver">{getPhaseLabel(lunar.phase)}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,216,240,0.6)' }}>
          {getPhaseDescription()}
        </p>
      </motion.div>

      {/* Upcoming events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="luna-card p-4"
      >
        <div className="text-xs font-semibold mb-3" style={{ color: 'rgba(200,216,240,0.5)' }}>
          Upcoming Phase Events
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(200,216,240,0.6)' }}>
              <span>🌕</span> Next Full Moon
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-lunar-silver">{format(nextFull, 'MMM d')}</div>
              <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>
                {formatDistanceToNow(nextFull)}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(200,216,240,0.6)' }}>
              <span>🌑</span> Next New Moon
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-lunar-silver">{format(nextNew, 'MMM d')}</div>
              <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>
                {formatDistanceToNow(nextNew)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
