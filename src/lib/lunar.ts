export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface LunarDay {
  date: Date;
  phase: MoonPhase;
  illumination: number; // 0–1
  age: number; // days since new moon
  cyclePercent: number; // 0–100
}

export interface SleepEntry {
  date: string; // ISO date
  bedtime: number; // hour decimal e.g. 22.5
  wakeTime: number;
  duration: number;
  quality: number; // 1–10
  lunarPhase: MoonPhase;
  illumination: number;
  notes?: string;
}

const SYNODIC_MONTH = 29.53058770576; // days
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime(); // J2000 reference

export function getLunarAge(date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const elapsed = date.getTime() - KNOWN_NEW_MOON;
  const daysElapsed = elapsed / msPerDay;
  return ((daysElapsed % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function getIllumination(age: number): number {
  const phase = (age / SYNODIC_MONTH) * 2 * Math.PI;
  return (1 - Math.cos(phase)) / 2;
}

export function getMoonPhase(age: number): MoonPhase {
  const pct = (age / SYNODIC_MONTH) * 100;
  if (pct < 1.85 || pct >= 98.15) return 'new_moon';
  if (pct < 25) return 'waxing_crescent';
  if (pct < 26.85) return 'first_quarter';
  if (pct < 48.15) return 'waxing_gibbous';
  if (pct < 51.85) return 'full_moon';
  if (pct < 75) return 'waning_gibbous';
  if (pct < 76.85) return 'last_quarter';
  return 'waning_crescent';
}

export function getLunarDay(date: Date): LunarDay {
  const age = getLunarAge(date);
  const illumination = getIllumination(age);
  const phase = getMoonPhase(age);
  const cyclePercent = (age / SYNODIC_MONTH) * 100;
  return { date, phase, illumination, age, cyclePercent };
}

export function getPhaseLabel(phase: MoonPhase): string {
  const labels: Record<MoonPhase, string> = {
    new_moon: 'New Moon',
    waxing_crescent: 'Waxing Crescent',
    first_quarter: 'First Quarter',
    waxing_gibbous: 'Waxing Gibbous',
    full_moon: 'Full Moon',
    waning_gibbous: 'Waning Gibbous',
    last_quarter: 'Last Quarter',
    waning_crescent: 'Waning Crescent',
  };
  return labels[phase];
}

export function getPhaseEmoji(phase: MoonPhase): string {
  const emojis: Record<MoonPhase, string> = {
    new_moon: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full_moon: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  };
  return emojis[phase];
}

export function getPhaseColor(phase: MoonPhase): string {
  const colors: Record<MoonPhase, string> = {
    new_moon: '#1a2030',
    waxing_crescent: '#3050a0',
    first_quarter: '#4878c8',
    waxing_gibbous: '#80a8e0',
    full_moon: '#e8f0ff',
    waning_gibbous: '#a0c0e8',
    last_quarter: '#6090d0',
    waning_crescent: '#3868b8',
  };
  return colors[phase];
}

export function getNextFullMoon(from: Date): Date {
  const age = getLunarAge(from);
  const daysToFull = age < SYNODIC_MONTH / 2
    ? SYNODIC_MONTH / 2 - age
    : SYNODIC_MONTH - age + SYNODIC_MONTH / 2;
  return new Date(from.getTime() + daysToFull * 24 * 60 * 60 * 1000);
}

export function getNextNewMoon(from: Date): Date {
  const age = getLunarAge(from);
  const daysToNew = SYNODIC_MONTH - age;
  return new Date(from.getTime() + daysToNew * 24 * 60 * 60 * 1000);
}

export function getLunarCalendar(year: number, month: number): LunarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return getLunarDay(date);
  });
}

// Sleep quality model based on lunar-entrainment research
export function getLunarSleepPrediction(age: number): {
  predictedQuality: number;
  predictedLatency: number; // minutes to fall asleep
  predictedREM: number; // percent
  recommendation: string;
} {
  const illumination = getIllumination(age);
  const phase = getMoonPhase(age);

  // Based on Lunacycler model: full moon disrupts REM, new moon enhances deep sleep
  const baseQuality = 7.5;
  const lunarPenalty = illumination * 2.2; // up to -2.2 around full moon
  const newMoonBonus = phase === 'new_moon' ? 0.8 : 0;
  const crescentBonus = (phase === 'waxing_crescent' || phase === 'waning_crescent') ? 0.4 : 0;

  const predictedQuality = Math.min(10, Math.max(1,
    baseQuality - lunarPenalty + newMoonBonus + crescentBonus
  ));

  const predictedLatency = Math.round(8 + illumination * 22); // 8–30 min
  const predictedREM = Math.round(18 + (1 - illumination) * 12); // 18–30%

  const recommendations: Partial<Record<MoonPhase, string>> = {
    new_moon: 'Optimal for deep, restorative sleep. Consider an earlier bedtime.',
    waxing_crescent: 'Good sleep window. Begin winding down 90 min before bed.',
    first_quarter: 'Moderate lunar influence. Limit blue light after 9 PM.',
    waxing_gibbous: 'Increasing lunar activity. Use blackout curtains tonight.',
    full_moon: 'Peak lunar luminance. Melatonin may be suppressed — dim all lights.',
    waning_gibbous: 'Sleep improving. Avoid stimulants after noon.',
    last_quarter: 'Transitioning phase. Gentle evening routine recommended.',
    waning_crescent: 'Rest cycle deepening. Ideal for sleep debt recovery.',
  };

  return {
    predictedQuality: Math.round(predictedQuality * 10) / 10,
    predictedLatency,
    predictedREM,
    recommendation: recommendations[phase] ?? 'Maintain consistent sleep schedule.',
  };
}

export function generateSampleData(days: number = 60): SleepEntry[] {
  const entries: SleepEntry[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const lunar = getLunarDay(date);
    const prediction = getLunarSleepPrediction(lunar.age);

    // Simulate realistic data with lunar influence + noise
    const noise = (Math.random() - 0.5) * 1.5;
    const quality = Math.min(10, Math.max(1, prediction.predictedQuality + noise));

    const baseBedtime = 22.5 + lunar.illumination * 0.8 + (Math.random() - 0.5) * 0.5;
    const baseDuration = 7.2 + (1 - lunar.illumination) * 0.8 + (Math.random() - 0.5) * 0.8;

    entries.push({
      date: date.toISOString().split('T')[0],
      bedtime: Math.round(baseBedtime * 4) / 4,
      wakeTime: Math.round((baseBedtime + baseDuration) * 4) / 4,
      duration: Math.round(baseDuration * 4) / 4,
      quality: Math.round(quality * 10) / 10,
      lunarPhase: lunar.phase,
      illumination: lunar.illumination,
    });
  }

  return entries;
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour % 1) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getPhaseGradient(phase: MoonPhase): string {
  const gradients: Record<MoonPhase, string> = {
    new_moon: 'from-slate-950 to-slate-900',
    waxing_crescent: 'from-blue-950 to-slate-900',
    first_quarter: 'from-blue-900 to-slate-800',
    waxing_gibbous: 'from-blue-800 to-blue-900',
    full_moon: 'from-blue-200 to-slate-200',
    waning_gibbous: 'from-blue-800 to-blue-900',
    last_quarter: 'from-blue-900 to-slate-800',
    waning_crescent: 'from-blue-950 to-slate-900',
  };
  return gradients[phase];
}
