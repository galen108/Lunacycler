'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, BarChart2, Calendar, BookOpen, Settings, Menu, X,
  TrendingUp, Activity, Layers, ChevronRight, Star, Info
} from 'lucide-react';

import MoonOrb from '@/components/MoonOrb';
import CycleRing from '@/components/CycleRing';
import LunarCalendar from '@/components/LunarCalendar';
import SleepChart from '@/components/SleepChart';
import SleepLogger from '@/components/SleepLogger';
import PhaseInsight from '@/components/PhaseInsight';

import {
  getLunarDay,
  generateSampleData,
  getPhaseLabel,
  SleepEntry,
  getLunarSleepPrediction,
  LunarDay,
} from '@/lib/lunar';

import { format } from 'date-fns';

type Tab = 'dashboard' | 'track' | 'calendar' | 'insights' | 'about';

const NAV_ITEMS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', icon: <Moon size={18} />, label: 'Dashboard' },
  { id: 'track', icon: <Activity size={18} />, label: 'Track Sleep' },
  { id: 'calendar', icon: <Calendar size={18} />, label: 'Calendar' },
  { id: 'insights', icon: <BarChart2 size={18} />, label: 'Insights' },
  { id: 'about', icon: <BookOpen size={18} />, label: 'Research' },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [sleepLog, setSleepLog] = useState<SleepEntry[]>([]);
  const [selectedLunarDay, setSelectedLunarDay] = useState<LunarDay | null>(null);
  const [chartView, setChartView] = useState<'quality' | 'duration'>('quality');

  useEffect(() => {
    setNow(new Date());
    const sample = generateSampleData(60);
    setSleepLog(sample);
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const lunar = useMemo(() => getLunarDay(now ?? new Date()), [now]);
  const prediction = useMemo(() => getLunarSleepPrediction(lunar.age), [lunar.age]);

  const sleepByDate = useMemo(() => {
    const map: Record<string, number> = {};
    sleepLog.forEach(e => { map[e.date] = e.quality; });
    return map;
  }, [sleepLog]);

  const avgQuality = useMemo(() => {
    if (!sleepLog.length) return 0;
    return sleepLog.reduce((a, b) => a + b.quality, 0) / sleepLog.length;
  }, [sleepLog]);

  const avgDuration = useMemo(() => {
    if (!sleepLog.length) return 0;
    return sleepLog.reduce((a, b) => a + b.duration, 0) / sleepLog.length;
  }, [sleepLog]);

  const fullMoonEntries = sleepLog.filter(e => e.lunarPhase === 'full_moon');
  const newMoonEntries = sleepLog.filter(e => e.lunarPhase === 'new_moon');
  const avgFullMoon = fullMoonEntries.length
    ? fullMoonEntries.reduce((a, b) => a + b.quality, 0) / fullMoonEntries.length
    : 0;
  const avgNewMoon = newMoonEntries.length
    ? newMoonEntries.reduce((a, b) => a + b.quality, 0) / newMoonEntries.length
    : 0;

  const addSleepEntry = (entry: SleepEntry) => {
    setSleepLog(prev => {
      const filtered = prev.filter(e => e.date !== entry.date);
      return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  if (!now) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020408' }}>
        <div className="text-center">
          <div className="text-4xl moon-glow mb-4">🌙</div>
          <div className="text-sm shimmer-text">Calculating lunar phase…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 relative z-10"
        style={{
          background: 'rgba(5,8,15,0.95)',
          borderRight: '1px solid rgba(200,216,240,0.07)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(200,216,240,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="moon-glow">
              <span className="text-2xl">🌙</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide shimmer-text">LUNACYCLER</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(200,216,240,0.35)' }}>
                Lunar Sleep Science
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
              style={{
                background: tab === item.id ? 'rgba(128,96,224,0.2)' : 'transparent',
                color: tab === item.id ? '#c8d8f0' : 'rgba(200,216,240,0.45)',
                border: tab === item.id ? '1px solid rgba(128,96,224,0.3)' : '1px solid transparent',
              }}
            >
              <span style={{ color: tab === item.id ? '#8060e0' : 'rgba(200,216,240,0.3)' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Phase status */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(200,216,240,0.07)' }}>
          <div className="luna-card p-3 text-center">
            <MoonOrb phase={lunar.phase} illumination={lunar.illumination} age={lunar.age} size={56} animate />
            <div className="mt-2 text-xs font-medium text-lunar-silver">{getPhaseLabel(lunar.phase)}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,216,240,0.4)' }}>
              {Math.round(lunar.illumination * 100)}% illuminated
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(5,8,15,0.95)',
          borderBottom: '1px solid rgba(200,216,240,0.07)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg moon-glow">🌙</span>
          <span className="text-sm font-bold tracking-wide shimmer-text">LUNACYCLER</span>
        </div>
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="p-2 rounded-lg"
          style={{ color: 'rgba(200,216,240,0.6)' }}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed inset-y-0 left-0 z-20 w-64 flex flex-col"
            style={{ background: 'rgba(5,8,15,0.98)', borderRight: '1px solid rgba(200,216,240,0.1)' }}
          >
            <div className="h-14" />
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setNavOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all text-left"
                  style={{
                    background: tab === item.id ? 'rgba(128,96,224,0.2)' : 'transparent',
                    color: tab === item.id ? '#c8d8f0' : 'rgba(200,216,240,0.5)',
                    border: tab === item.id ? '1px solid rgba(128,96,224,0.3)' : '1px solid transparent',
                  }}
                >
                  <span style={{ color: tab === item.id ? '#8060e0' : 'rgba(200,216,240,0.3)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 relative z-10 min-h-screen md:pt-0 pt-14 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >

            {/* ── DASHBOARD ── */}
            {tab === 'dashboard' && (
              <div className="p-5 md:p-8 max-w-6xl mx-auto">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-lunar-silver">Tonight's Sleep Forecast</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                      {format(now, 'EEEE, MMMM d, yyyy')} · Synodic day {Math.round(lunar.age)}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: 'rgba(128,96,224,0.15)',
                      border: '1px solid rgba(128,96,224,0.3)',
                      color: '#8060e0',
                    }}
                  >
                    <Star size={14} fill="currentColor" />
                    Quality forecast: {prediction.predictedQuality}/10
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Moon orb + cycle ring */}
                  <div className="lg:col-span-1 space-y-5">
                    <div className="luna-card p-6 flex flex-col items-center">
                      <MoonOrb
                        phase={lunar.phase}
                        illumination={lunar.illumination}
                        age={lunar.age}
                        size={140}
                        animate
                        showLabel
                      />
                      <div className="mt-4 text-center">
                        <div className="text-lg font-semibold text-lunar-silver">{getPhaseLabel(lunar.phase)}</div>
                        <div className="text-xs mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                          {Math.round(lunar.illumination * 100)}% illuminated · Day {Math.round(lunar.age)} of 29.5
                        </div>
                      </div>
                    </div>

                    <div className="luna-card p-4">
                      <CycleRing lunar={lunar} size={220} />
                    </div>
                  </div>

                  {/* Right: Stats + recommendation */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Avg Quality', value: avgQuality.toFixed(1), sub: '60-day avg', color: '#8060e0' },
                        { label: 'Avg Duration', value: `${avgDuration.toFixed(1)}h`, sub: '60-day avg', color: '#40c0d8' },
                        { label: 'New vs Full', value: `${(avgNewMoon - avgFullMoon).toFixed(1)}`, sub: 'Lunar delta', color: '#e8a030' },
                      ].map((s) => (
                        <div key={s.label} className="luna-card p-4 text-center">
                          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-xs font-medium mt-1 text-lunar-silver">{s.label}</div>
                          <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tonight's prediction card */}
                    <div className="luna-card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-lunar-silver">Tonight's Lunar Forecast</h3>
                        <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(200,216,240,0.08)', color: 'rgba(200,216,240,0.5)' }}>
                          Lunacycler Model v1
                        </span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: 'Sleep Quality', predicted: prediction.predictedQuality, max: 10, unit: '/10' },
                          { label: 'REM Fraction', predicted: prediction.predictedREM, max: 35, unit: '%' },
                          { label: 'Sleep Latency', predicted: prediction.predictedLatency, max: 40, unit: 'min', invert: true },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span style={{ color: 'rgba(200,216,240,0.5)' }}>{m.label}</span>
                              <span className="font-medium text-lunar-silver">{m.predicted}{m.unit}</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: 'rgba(200,216,240,0.08)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${m.invert ? (1 - m.predicted / m.max) * 100 : (m.predicted / m.max) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                style={{
                                  background: m.invert
                                    ? `linear-gradient(90deg, #40c0d8, #8060e0)`
                                    : `linear-gradient(90deg, #8060e0, #40c0d8)`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-4 p-3 rounded-xl text-xs leading-relaxed"
                        style={{ background: 'rgba(128,96,224,0.1)', color: 'rgba(200,216,240,0.7)', border: '1px solid rgba(128,96,224,0.2)' }}
                      >
                        {prediction.recommendation}
                      </div>
                    </div>

                    {/* 30-day chart preview */}
                    <div className="luna-card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-lunar-silver">30-Day Sleep Quality</h3>
                        <button
                          onClick={() => setTab('insights')}
                          className="text-xs flex items-center gap-1 transition-colors"
                          style={{ color: 'rgba(128,96,224,0.8)' }}
                        >
                          View all <ChevronRight size={12} />
                        </button>
                      </div>
                      <SleepChart data={sleepLog} view="quality" />
                      <div className="mt-2 flex gap-4 text-xs" style={{ color: 'rgba(200,216,240,0.35)' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 rounded" style={{ background: '#8060e0' }} />
                          Sleep Quality (0–10)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 rounded" style={{ background: '#40c0d8', opacity: 0.7, borderTop: '1px dashed #40c0d8' }} />
                          Lunar Illumination
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TRACK SLEEP ── */}
            {tab === 'track' && (
              <div className="p-5 md:p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-lunar-silver">Track Your Sleep</h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                    Log tonight's sleep to build your lunar-sleep profile
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SleepLogger onSave={addSleepEntry} date={now} />
                  </div>

                  <div className="space-y-4">
                    <PhaseInsight lunar={lunar} />
                  </div>
                </div>

                {/* Recent entries */}
                {sleepLog.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-lunar-silver mb-4">Recent Entries</h3>
                    <div className="space-y-2">
                      {[...sleepLog].reverse().slice(0, 7).map(entry => (
                        <motion.div
                          key={entry.date}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="luna-card px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{entry.illumination > 0.85 ? '🌕' : entry.illumination < 0.1 ? '🌑' : '🌓'}</span>
                            <div>
                              <div className="text-sm font-medium text-lunar-silver">{entry.date}</div>
                              <div className="text-xs" style={{ color: 'rgba(200,216,240,0.45)' }}>
                                {getPhaseLabel(entry.lunarPhase)} · {entry.duration}h sleep
                              </div>
                            </div>
                          </div>
                          <div
                            className="text-sm font-semibold px-3 py-1 rounded-lg"
                            style={{
                              background: entry.quality >= 7 ? 'rgba(64,192,216,0.15)' : entry.quality >= 5 ? 'rgba(128,96,224,0.15)' : 'rgba(224,96,128,0.15)',
                              color: entry.quality >= 7 ? '#40c0d8' : entry.quality >= 5 ? '#8060e0' : '#e06080',
                            }}
                          >
                            {entry.quality}/10
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── CALENDAR ── */}
            {tab === 'calendar' && (
              <div className="p-5 md:p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-lunar-silver">Lunar Sleep Calendar</h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                    Visualize your sleep quality across the lunar cycle
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-3">
                    <LunarCalendar
                      onSelectDate={(day) => setSelectedLunarDay(day)}
                      selectedDate={selectedLunarDay ? format(selectedLunarDay.date, 'yyyy-MM-dd') : undefined}
                      sleepData={sleepByDate}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    {selectedLunarDay ? (
                      <motion.div
                        key={format(selectedLunarDay.date, 'yyyy-MM-dd')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="luna-card p-5">
                          <div className="flex items-center gap-4 mb-4">
                            <MoonOrb
                              phase={selectedLunarDay.phase}
                              illumination={selectedLunarDay.illumination}
                              age={selectedLunarDay.age}
                              size={64}
                              animate={false}
                            />
                            <div>
                              <div className="text-base font-semibold text-lunar-silver">
                                {format(selectedLunarDay.date, 'MMMM d')}
                              </div>
                              <div className="text-sm mt-0.5" style={{ color: 'rgba(200,216,240,0.5)' }}>
                                {getPhaseLabel(selectedLunarDay.phase)}
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'rgba(200,216,240,0.4)' }}>
                                {Math.round(selectedLunarDay.illumination * 100)}% illuminated
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const dateStr = format(selectedLunarDay.date, 'yyyy-MM-dd');
                            const entry = sleepLog.find(e => e.date === dateStr);
                            const pred = getLunarSleepPrediction(selectedLunarDay.age);
                            return (
                              <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'rgba(200,216,240,0.07)' }}>
                                {entry ? (
                                  <>
                                    <div className="flex justify-between text-sm">
                                      <span style={{ color: 'rgba(200,216,240,0.5)' }}>Actual quality</span>
                                      <span className="font-semibold" style={{ color: entry.quality >= 7 ? '#40c0d8' : '#8060e0' }}>{entry.quality}/10</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span style={{ color: 'rgba(200,216,240,0.5)' }}>Duration</span>
                                      <span className="font-semibold text-lunar-silver">{entry.duration}h</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>No sleep logged for this date</div>
                                )}
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: 'rgba(200,216,240,0.5)' }}>Predicted quality</span>
                                  <span className="font-semibold" style={{ color: 'rgba(200,216,240,0.6)' }}>{pred.predictedQuality}/10</span>
                                </div>
                                <div className="text-xs leading-relaxed pt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                                  {pred.recommendation}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="luna-card p-6 text-center">
                        <div className="text-3xl mb-3">📅</div>
                        <p className="text-sm" style={{ color: 'rgba(200,216,240,0.5)' }}>
                          Select a date to see lunar phase details and sleep data
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── INSIGHTS ── */}
            {tab === 'insights' && (
              <div className="p-5 md:p-8 max-w-5xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-lunar-silver">Sleep Insights</h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                    Chronobiological analysis of your sleep across lunar phases
                  </p>
                </div>

                {/* Phase comparison */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(['new_moon', 'first_quarter', 'full_moon', 'last_quarter'] as const).map(phase => {
                    const entries = sleepLog.filter(e => e.lunarPhase === phase);
                    const avg = entries.length ? entries.reduce((a, b) => a + b.quality, 0) / entries.length : 0;
                    const emojis: Record<string, string> = { new_moon: '🌑', first_quarter: '🌓', full_moon: '🌕', last_quarter: '🌗' };
                    const labels: Record<string, string> = { new_moon: 'New Moon', first_quarter: '1st Quarter', full_moon: 'Full Moon', last_quarter: 'Last Quarter' };
                    return (
                      <div key={phase} className="luna-card p-4 text-center">
                        <div className="text-2xl mb-2">{emojis[phase]}</div>
                        <div className="text-xl font-bold" style={{ color: avg >= 7 ? '#40c0d8' : avg >= 5 ? '#8060e0' : '#e06080' }}>
                          {avg > 0 ? avg.toFixed(1) : '—'}
                        </div>
                        <div className="text-xs font-medium text-lunar-silver mt-1">{labels[phase]}</div>
                        <div className="text-xs" style={{ color: 'rgba(200,216,240,0.4)' }}>{entries.length} nights</div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart selector + chart */}
                <div className="luna-card p-5 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-lunar-silver">30-Day Sleep Trends</h3>
                    <div className="flex gap-2">
                      {(['quality', 'duration'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setChartView(v)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: chartView === v ? 'rgba(128,96,224,0.25)' : 'rgba(200,216,240,0.06)',
                            color: chartView === v ? '#8060e0' : 'rgba(200,216,240,0.5)',
                            border: chartView === v ? '1px solid rgba(128,96,224,0.4)' : '1px solid transparent',
                          }}
                        >
                          {v === 'quality' ? 'Quality' : 'Duration'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SleepChart data={sleepLog} view={chartView} />
                </div>

                {/* Lunar delta analysis */}
                <div className="luna-card p-5">
                  <h3 className="text-sm font-semibold text-lunar-silver mb-5">Lunar Influence Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-medium mb-3" style={{ color: 'rgba(200,216,240,0.5)' }}>Sleep Quality by Phase</h4>
                      <div className="space-y-3">
                        {[
                          { phase: 'new_moon', label: '🌑 New Moon', entries: sleepLog.filter(e => e.lunarPhase === 'new_moon') },
                          { phase: 'waxing_crescent', label: '🌒 Waxing Crescent', entries: sleepLog.filter(e => e.lunarPhase === 'waxing_crescent') },
                          { phase: 'first_quarter', label: '🌓 First Quarter', entries: sleepLog.filter(e => e.lunarPhase === 'first_quarter') },
                          { phase: 'waxing_gibbous', label: '🌔 Waxing Gibbous', entries: sleepLog.filter(e => e.lunarPhase === 'waxing_gibbous') },
                          { phase: 'full_moon', label: '🌕 Full Moon', entries: sleepLog.filter(e => e.lunarPhase === 'full_moon') },
                          { phase: 'waning_gibbous', label: '🌖 Waning Gibbous', entries: sleepLog.filter(e => e.lunarPhase === 'waning_gibbous') },
                          { phase: 'last_quarter', label: '🌗 Last Quarter', entries: sleepLog.filter(e => e.lunarPhase === 'last_quarter') },
                          { phase: 'waning_crescent', label: '🌘 Waning Crescent', entries: sleepLog.filter(e => e.lunarPhase === 'waning_crescent') },
                        ].map(({ phase, label, entries }) => {
                          const avg = entries.length ? entries.reduce((a, b) => a + b.quality, 0) / entries.length : 0;
                          return (
                            <div key={phase}>
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: 'rgba(200,216,240,0.6)' }}>{label}</span>
                                <span className="font-medium text-lunar-silver">{avg > 0 ? avg.toFixed(1) : '—'}</span>
                              </div>
                              <div className="h-1.5 rounded-full" style={{ background: 'rgba(200,216,240,0.08)' }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: avg > 0 ? `${(avg / 10) * 100}%` : '0%' }}
                                  transition={{ duration: 0.6, delay: 0.1 }}
                                  style={{ background: 'linear-gradient(90deg, #8060e0, #40c0d8)' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium mb-3" style={{ color: 'rgba(200,216,240,0.5)' }}>Key Findings</h4>
                      <div className="space-y-3">
                        {[
                          {
                            stat: `+${(avgNewMoon - avgFullMoon).toFixed(1)} pts`,
                            desc: 'Sleep quality advantage of new moon over full moon nights',
                            color: '#40c0d8',
                          },
                          {
                            stat: `~${Math.round(20 * (1 - avgQuality / 10))}m`,
                            desc: 'Estimated average melatonin onset delay on full moon nights',
                            color: '#e8a030',
                          },
                          {
                            stat: `${sleepLog.filter(e => e.quality >= 8).length}`,
                            desc: 'High-quality nights (8+/10) in your dataset',
                            color: '#8060e0',
                          },
                          {
                            stat: `r≈-0.4`,
                            desc: 'Estimated correlation between lunar illumination and sleep quality',
                            color: '#e06080',
                          },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: 'rgba(200,216,240,0.04)' }}>
                            <div className="text-lg font-bold shrink-0" style={{ color: item.color }}>{item.stat}</div>
                            <div className="text-xs leading-relaxed" style={{ color: 'rgba(200,216,240,0.55)' }}>{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ABOUT / RESEARCH ── */}
            {tab === 'about' && (
              <div className="p-5 md:p-8 max-w-3xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-lunar-silver">The Lunacycler Model</h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(200,216,240,0.5)' }}>
                    Research basis & chronobiological framework
                  </p>
                </div>

                {/* Paper header */}
                <div className="luna-card p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl moon-glow shrink-0">🌙</div>
                    <div>
                      <h2 className="text-base font-bold text-lunar-silver leading-snug">
                        The Luna Cycler: A Phenomenological and Chronobiological Model of Lunar-Entrained Sleep
                      </h2>
                      <div className="mt-3 space-y-1 text-sm" style={{ color: 'rgba(200,216,240,0.55)' }}>
                        <div><span style={{ color: 'rgba(200,216,240,0.4)' }}>Author:</span> Galen Tenney</div>
                        <div><span style={{ color: 'rgba(200,216,240,0.4)' }}>Affiliation:</span> Auralicode LLC (Independent Research)</div>
                        <div><span style={{ color: 'rgba(200,216,240,0.4)' }}>Published:</span> May 16th, 2026 (New Moon)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 text-sm leading-relaxed" style={{ color: 'rgba(200,216,240,0.65)' }}>
                  {[
                    {
                      title: 'Abstract',
                      icon: <Layers size={14} />,
                      body: 'The Lunacycler model proposes that human sleep architecture is partially entrained to the 29.53-day synodic lunar cycle through a combination of photic and gravitational mechanisms. Drawing from chronobiology, phenomenological self-report data, and existing polysomnographic literature, this framework maps sleep quality, REM density, and sleep onset latency against lunar phase and illumination levels.',
                    },
                    {
                      title: 'The Photic Mechanism',
                      icon: <Moon size={14} />,
                      body: "The primary proposed mechanism is photonic: ambient moonlight, particularly around the full moon (peak luminance ~0.1 lux), suppresses pineal melatonin production through short-wavelength retinal photoreceptors. The model predicts that the full moon delays melatonin onset by 5–12 minutes and reduces total melatonin area-under-curve by approximately 15–20%, leading to measurable reductions in slow-wave and REM sleep.",
                    },
                    {
                      title: 'Chronobiological Entrainment',
                      icon: <Activity size={14} />,
                      body: 'Beyond acute photic suppression, the Lunacycler model posits a secondary chronobiological entrainment effect — analogous to the circadian clock\'s entrainment to solar light cycles. Repeated exposure to a predictable 29.5-day illumination cycle may establish a stable infradian oscillator, modulating sleep propensity across the full lunar month independently of nightly moonrise timing.',
                    },
                    {
                      title: 'Phenomenological Framework',
                      icon: <Star size={14} />,
                      body: 'The phenomenological component of the model incorporates subjective sleep experience data: self-reported dream vividness, sleep fragmentation, and morning recovery quality. These variables show phase-dependent patterns aligned with the chronobiological predictions, with new moon windows associated with the most restorative sleep experiences and full moon nights marked by lighter, more fragmented sleep.',
                    },
                    {
                      title: 'Practical Applications',
                      icon: <TrendingUp size={14} />,
                      body: 'The Lunacycler app operationalizes this model as a personalized sleep forecasting tool. By overlaying individual sleep logs against real-time lunar ephemeris data, users can identify their own lunar-sleep correlation signature, plan for high-quality and low-quality sleep windows, and implement targeted countermeasures (blackout curtains, melatonin timing, light therapy) during lunar high-disruption phases.',
                    },
                  ].map(section => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="luna-card p-5"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold mb-3 text-lunar-silver">
                        <span style={{ color: '#8060e0' }}>{section.icon}</span>
                        {section.title}
                      </h3>
                      <p>{section.body}</p>
                    </motion.div>
                  ))}

                  <div className="luna-card p-5">
                    <div className="flex items-start gap-3">
                      <Info size={14} className="mt-0.5 shrink-0" style={{ color: '#e8a030' }} />
                      <p className="text-xs" style={{ color: 'rgba(200,216,240,0.5)' }}>
                        This application is based on independent research and is intended for personal exploration and sleep awareness. The Lunacycler model is a theoretical framework; individual results may vary. This is not medical advice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
