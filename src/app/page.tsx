'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | 'title'
  | 'abstract'
  | 'literature'
  | 'crosscultural'
  | 'methodology'
  | 'math'
  | 'theory'
  | 'critique'
  | 'discussion'
  | 'conclusion';

interface Section {
  id: SectionId;
  label: string;
  moon: string;
  phase: number;
  title: string;
  subtitle: string;
}

// ─── Section Manifest ─────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  { id: 'title',        label: 'Title Page',             moon: '🌑', phase: 0, title: 'The Luna Cycler',               subtitle: 'A Phenomenological and Chronobiological Model of Lunar Entrained Sleep' },
  { id: 'abstract',     label: 'Abstract & Introduction', moon: '🌒', phase: 1, title: 'Abstract & Introduction',        subtitle: 'Section I'   },
  { id: 'literature',   label: 'Literature Review',       moon: '🌓', phase: 2, title: 'Literature Review',              subtitle: 'Section II'  },
  { id: 'crosscultural',label: 'Cross-Cultural Analysis', moon: '🌔', phase: 3, title: 'Cross-Cultural Historical Analysis', subtitle: 'Section III' },
  { id: 'methodology',  label: 'Methodology',             moon: '🌕', phase: 4, title: 'Phenomenological Methodology',   subtitle: 'Section IV'  },
  { id: 'math',         label: 'Mathematical Model',      moon: '🌖', phase: 5, title: 'Mathematical Modeling',          subtitle: 'Section V'   },
  { id: 'theory',       label: 'Theoretical Framework',   moon: '🌗', phase: 6, title: 'Theoretical Framework',          subtitle: 'Section VI'  },
  { id: 'critique',     label: 'Calendar Critique',       moon: '🌘', phase: 7, title: 'Critique of the Gregorian Calendar', subtitle: 'Section VII' },
  { id: 'discussion',   label: 'Discussion',              moon: '🌑', phase: 8, title: 'Discussion',                     subtitle: 'Section VIII'},
  { id: 'conclusion',   label: 'Conclusion & References', moon: '🌒', phase: 9, title: 'Conclusion & References',        subtitle: 'Section IX'  },
];

// ─── Moon Phase Icon ──────────────────────────────────────────────────────────

function MoonPhaseIcon({ phase, size = 40, glow = false }: { phase: number; size?: number; glow?: boolean }) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const illumination = phase / 9;
  const isFull = illumination > 0.85;
  const isEmpty = illumination < 0.05;
  const rx = r * 0.85;
  const ry = r * 0.85;
  const offset = rx * (1 - 2 * illumination);

  let moonPath: React.ReactNode = null;
  if (!isEmpty) {
    if (isFull) {
      moonPath = <circle cx={cx} cy={cy} r={r * 0.85} fill="currentColor" />;
    } else {
      moonPath = (
        <path
          d={`M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry} A ${Math.abs(offset)} ${ry} 0 1 ${illumination > 0.5 ? 0 : 1} ${cx} ${cy - ry} Z`}
          fill="currentColor"
        />
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: glow ? 'drop-shadow(0 0 8px rgba(200,180,120,0.8))' : 'none' }}
    >
      <circle cx={cx} cy={cy} r={r * 0.85} fill="rgba(255,255,255,0.05)" stroke="rgba(200,180,120,0.3)" strokeWidth="1" />
      <g color="#e8d5a0">{moonPath}</g>
    </svg>
  );
}

// ─── Luna Sleep Chart ─────────────────────────────────────────────────────────

function LunarSleepChart() {
  const points = Array.from({ length: 29 }, (_, d) => ({
    d,
    sleep: 6.5 + 6.5 * Math.cos((2 * Math.PI * d) / 28),
  }));

  const W = 600, H = 200;
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  const toX = (d: number) => pad.l + (d / 28) * iw;
  const toY = (s: number) => pad.t + ih - (s / 13) * ih;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.d)} ${toY(p.sleep)}`).join(' ');
  const fillD = pathD + ` L ${toX(28)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl mx-auto" style={{ fontFamily: 'inherit' }}>
        <defs>
          <linearGradient id="sleepGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4a3f6b" />
            <stop offset="50%" stopColor="#c8b46a" />
            <stop offset="100%" stopColor="#4a3f6b" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c8b46a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c8b46a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 3.25, 6.5, 9.75, 13].map((v) => (
          <g key={v}>
            <line x1={pad.l} y1={toY(v)} x2={pad.l + iw} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.l - 6} y={toY(v) + 4} textAnchor="end" fill="rgba(200,180,120,0.5)" fontSize="10">{v}h</text>
          </g>
        ))}

        <line x1={toX(0)}  y1={pad.t} x2={toX(0)}  y2={pad.t + ih} stroke="rgba(200,180,120,0.3)" strokeWidth="1" strokeDasharray="4,3" />
        <line x1={toX(14)} y1={pad.t} x2={toX(14)} y2={pad.t + ih} stroke="rgba(200,180,120,0.3)" strokeWidth="1" strokeDasharray="4,3" />

        <text x={toX(0)}  y={H - 8} textAnchor="middle" fill="rgba(200,180,120,0.6)" fontSize="9">New Moon</text>
        <text x={toX(14)} y={H - 8} textAnchor="middle" fill="rgba(200,180,120,0.6)" fontSize="9">Full Moon</text>

        <path d={fillD} fill="url(#fillGrad)" />
        <path d={pathD} fill="none" stroke="url(#sleepGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {([{ d: 0, s: 13, label: '13h' }, { d: 14, s: 0, label: '0h' }] as const).map(({ d, s, label }) => (
          <g key={d}>
            <circle cx={toX(d)} cy={toY(s)} r={5} fill="#c8b46a" />
            <text x={toX(d)} y={toY(s) - 10} textAnchor="middle" fill="#e8d5a0" fontSize="11" fontWeight="bold">{label}</text>
          </g>
        ))}

        <text x={pad.l + iw / 2} y={H - 2} textAnchor="middle" fill="rgba(200,180,120,0.4)" fontSize="9">
          S(d) = 6.5 + 6.5 · cos(2πd/28)
        </text>
      </svg>
    </div>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function TitlePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,180,100,0.07) 0%, transparent 70%)',
      }} />

      <div className="relative mb-8">
        <div style={{ filter: 'drop-shadow(0 0 30px rgba(200,180,100,0.4))' }}>
          <MoonPhaseIcon phase={0} size={100} glow />
        </div>
      </div>

      <p className="text-base tracking-[0.4em] uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>
        An Independent Research Paper
      </p>

      <h1 style={{
        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
        color: '#e8d5a0',
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
        textShadow: '0 0 40px rgba(200,180,100,0.2)',
        marginBottom: '0.5rem',
      }}>
        The Luna Cycler
      </h1>

      <div className="w-24 h-px my-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,180,100,0.5), transparent)' }} />

      <p className="text-lg max-w-lg mb-10" style={{ color: 'rgba(232,213,160,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>
        A Phenomenological and Chronobiological Model of Lunar Entrained Sleep Oscillation
      </p>

      <div className="space-y-2 text-center" style={{ color: 'rgba(200,180,120,0.5)', fontFamily: 'monospace', fontSize: '1rem' }}>
        <p><span style={{ color: 'rgba(200,180,120,0.3)' }}>AUTHOR</span>&nbsp;&nbsp;Galen Tenney</p>
        <p><span style={{ color: 'rgba(200,180,120,0.3)' }}>AFFILIATION</span>&nbsp;&nbsp;Auralicode LLC (Independent Research)</p>
        <p><span style={{ color: 'rgba(200,180,120,0.3)' }}>DATE</span>&nbsp;&nbsp;May 16th, 2026 (New Moon)</p>
      </div>

      <div className="mt-14 flex gap-3 items-center" style={{ color: 'rgba(200,180,120,0.3)', fontSize: '0.9rem', letterSpacing: '0.2em' }}>
        <div className="w-8 h-px" style={{ background: 'rgba(200,180,120,0.3)' }} />
        <span>SCROLL TO EXPLORE</span>
        <div className="w-8 h-px" style={{ background: 'rgba(200,180,120,0.3)' }} />
      </div>
    </div>
  );
}

function AbstractSection() {
  return (
    <div className="space-y-8">
      <div className="p-6 rounded-lg border" style={{ borderColor: 'rgba(200,180,120,0.15)', background: 'rgba(200,180,120,0.04)' }}>
        <h3 className="text-sm tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>Abstract</h3>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.7)', fontStyle: 'italic' }}>
          This paper presents the Luna Cycler, a phenomenological and theoretically grounded model of lunar entrained sleep oscillation derived from long-term self-observation and supported by cross-cultural, historical, and chronobiological research. While contemporary chronobiology prioritizes the 24-hour solar circadian rhythm, evidence suggests that lunar phases exert measurable effects on human sleep architecture (Cajochen et al., 2013; de la Iglesia et al., 2021). This paper argues that these effects, though subtle at the population level, may manifest as high-amplitude oscillations in individuals with heightened chronobiological sensitivity, including those with neurodivergent profiles. Integrating personal narrative with academic analysis, the paper situates the Luna Cycler within a global history of lunar timekeeping, critiques the dominance of the Gregorian solar calendar as an industrial colonial imposition, and proposes a mathematical and theoretical framework for understanding lunar entrained sleep rhythms.
        </p>
      </div>

      <div>
        <h3 className="text-xl mb-4" style={{ color: '#e8d5a0' }}>Introduction</h3>
        <blockquote className="border-l-2 pl-5 mb-6 italic text-lg" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
          "I did not set out to build a theory. I set out to survive my own body."
        </blockquote>
        <p className="text-base leading-relaxed mb-4" style={{ color: 'rgba(232,213,160,0.65)' }}>
          For years, the author lived inside a sleep rhythm that defied conventional frameworks — swelling to 11–13 hours around the new moon and collapsing to zero or near zero hours around the full moon. Not insomnia. Not mania. A <em>cycle</em>. A rhythm. A tide.
        </p>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(232,213,160,0.65)' }}>
          The more I observed, the more undeniable it became: my body was not entrained to the sun — it was entrained to the moon. This realization placed me in direct conflict with the temporal structures of modern life. The 9-to-5 workday, the five-day workweek, the Gregorian calendar — all of these are solar-based constructs designed for industrial productivity, not biological truth.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {[
            { phase: '🌑 New Moon', hours: '11–13 hrs', desc: 'Deep restoration', color: '#6b5fa0' },
            { phase: '🌕 Full Moon', hours: '0–1 hrs',  desc: 'Electric wakefulness', color: '#c8b46a' },
          ].map((item) => (
            <div key={item.phase} className="p-5 rounded-lg text-center" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
              <div className="text-3xl mb-2">{item.phase}</div>
              <div className="text-3xl font-bold mb-2" style={{ color: item.color }}>{item.hours}</div>
              <div className="text-base" style={{ color: 'rgba(232,213,160,0.5)' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <h4 className="text-base font-semibold mb-3 mt-6" style={{ color: 'rgba(200,180,120,0.8)' }}>The Central Claim</h4>
        <div className="p-5 rounded border-l-4 text-base leading-relaxed" style={{ borderColor: '#c8b46a', background: 'rgba(200,180,100,0.06)', color: 'rgba(232,213,160,0.8)' }}>
          The Luna Cycler is real for me — and its existence challenges the assumption that the solar circadian rhythm is the <em>only</em> meaningful temporal structure for human biology.
        </div>

        <h4 className="text-base font-semibold mt-8 mb-4" style={{ color: 'rgba(200,180,120,0.8)' }}>Implications</h4>
        <div className="space-y-3">
          {[
            'Human temporal biology may be more diverse than current models allow.',
            'Neurodivergent individuals may exhibit heightened sensitivity to lunar cues.',
            'The dominance of solar industrial time may suppress alternative biological rhythms.',
            'Recognizing personal chronobiological patterns is a form of autonomy, not pathology.',
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start text-base" style={{ color: 'rgba(232,213,160,0.65)' }}>
              <span style={{ color: 'rgba(200,180,120,0.5)', minWidth: '1.5rem' }}>{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiteratureSection() {
  const studies = [
    { author: 'Cajochen et al. (2013)',       finding: '−20 min sleep, −30% deep sleep, lower melatonin at full moon in controlled lab — participants had no visual access to the moon',                                                      icon: '🔬' },
    { author: 'de la Iglesia et al. (2021)',   finding: 'Lunar sleep modulation is "ancestral" — persists across 3 Indigenous communities in Argentina, including those without electricity',                                                  icon: '🌍' },
    { author: 'Wehr (2018)',                   finding: 'Some individuals with bipolar disorder exhibit circalunar mood cycling, with depressive and hypomanic phases aligning with lunar illumination patterns',                              icon: '🧠' },
    { author: 'Casiraghi et al. (2021)',       finding: 'Human sleep synchronized with the moon cycle under natural conditions — evidence of non-photic lunar entrainment',                                                                   icon: '🌊' },
  ];

  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        The scientific literature on lunar influences in humans is fragmented, controversial, and often minimized — not because the evidence is absent, but because the dominant chronobiological paradigm is overwhelmingly solar. Yet when examined carefully, a more complicated story emerges.
      </p>

      <div className="space-y-3">
        <h3 className="text-base tracking-widest uppercase mb-2" style={{ color: 'rgba(200,180,120,0.5)' }}>Key Studies</h3>
        {studies.map((s) => (
          <div key={s.author} className="flex gap-4 p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,180,120,0.1)' }}>
            <span className="text-2xl mt-0.5">{s.icon}</span>
            <div>
              <div className="text-base font-semibold mb-1" style={{ color: '#e8d5a0' }}>{s.author}</div>
              <div className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.6)' }}>{s.finding}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-base tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>Proposed Entrainment Mechanisms</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Light-mediated', 'Gravitational', 'Electromagnetic', 'Evolutionary'].map((m) => (
            <div key={m} className="p-4 rounded text-center text-base" style={{ background: 'rgba(200,180,100,0.07)', border: '1px solid rgba(200,180,100,0.15)', color: 'rgba(232,213,160,0.7)' }}>
              {m}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.06)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h4 className="text-sm tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.6)' }}>Methodological Biases Against Lunar Research</h4>
        <div className="space-y-2">
          {[
            'Solar centrism in chronobiology — the 24h rhythm dominates all framing',
            'Population averages erase high-amplitude individual responders',
            'Neurodivergent populations systematically excluded from studies',
            'Artificial lab environments suppress natural environmental cues',
            'Western science dismisses lunar knowledge as superstition',
          ].map((b, i) => (
            <div key={i} className="text-base flex gap-2" style={{ color: 'rgba(232,213,160,0.6)' }}>
              <span style={{ color: 'rgba(200,180,120,0.4)' }}>—</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <blockquote className="text-lg italic border-l-2 pl-4" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
        "The literature does not prove the Luna Cycler. But it does something more important: it makes the Luna Cycler <em>plausible</em>."
      </blockquote>
    </div>
  );
}

function CrossCulturalSection() {
  const cultures = [
    { region: 'Paleolithic',      tradition: 'Ishango Bone (~20,000 BCE)',    notes: 'Notches widely interpreted as a lunar tally — earliest known evidence of human timekeeping, predating agriculture, metallurgy, and written language.',                                                       emoji: '🦴' },
    { region: 'Ancient Near East',tradition: 'Babylonian, Hebrew, Ethiopian', notes: 'Months began with first visible crescent; festivals tied to lunar phases; sleep, fasting, feasting, and ritual purification corresponded to lunar timing.',                                                    emoji: '🏛️' },
    { region: 'Asia',             tradition: 'China, Tibet, India',           notes: 'Chinese lunisolar calendar structured around new moon; Tibetan astrology links lunar phases to energy levels and sleep quality; Indian Jyotisha assigns bodily qualities to each lunar tithi.',               emoji: '🪷' },
    { region: 'Mesoamerica',      tradition: 'Maya, Aztec, Olmec',            notes: 'Maya tracked lunar cycles with extraordinary accuracy; linked to fertility, dream states, altered consciousness, and communal ceremony. Full moon associated with heightened wakefulness and emotional intensity.', emoji: '🌿' },
    { region: 'Celtic Europe',    tradition: 'Celtic & Gaelic Systems',       notes: 'Festivals tied to lunar cross-quarter days; folklore describes deep rest during dark moons, heightened dreams during waxing moons, emotional intensity at full moon.',                                        emoji: '🌀' },
  ];

  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        Long before the mechanical clock or Gregorian calendar, human societies oriented their lives around the lunar cycle. The moon was humanity's first reliable timekeeper — visible to every person regardless of literacy, geography, or technology. When I recognized the Luna Cycler in my own body, I felt an uncanny resonance with these older systems of time.
      </p>

      <div className="space-y-4">
        {cultures.map((c) => (
          <div key={c.region} className="flex gap-4 p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,180,120,0.12)' }}>
            <div className="text-3xl">{c.emoji}</div>
            <div>
              <div className="flex flex-wrap gap-3 items-baseline mb-2">
                <span className="text-base font-semibold" style={{ color: '#e8d5a0' }}>{c.region}</span>
                <span className="text-sm" style={{ color: 'rgba(200,180,120,0.4)' }}>{c.tradition}</span>
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.6)' }}>{c.notes}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(107,95,160,0.1)', border: '1px solid rgba(107,95,160,0.3)' }}>
        <h4 className="text-sm tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.6)' }}>Cross-Cultural Consensus</h4>
        <div className="grid grid-cols-2 gap-3 text-base" style={{ color: 'rgba(232,213,160,0.65)' }}>
          {['Moon as primary regulator of time', 'New moon → rest & restoration', 'Full moon → wakefulness & heightened energy', 'Lunar phases modulate mood & behavior'].map((item) => (
            <div key={item} className="flex gap-2 items-start">
              <span style={{ color: 'rgba(200,180,120,0.5)' }}>◇</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <blockquote className="text-lg italic border-l-2 pl-4" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
        "My body remembers what civilization has tried to overwrite."
      </blockquote>
    </div>
  );
}

function MethodologySection() {
  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        Scientific knowledge is often framed as something that happens in laboratories. But phenomenology — the disciplined study of lived experience — is not a lesser form of knowledge. In chronobiology, where individual variation is vast and population averages obscure meaningful patterns, phenomenological data is not only valid; it is essential.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.06)', border: '1px solid rgba(200,180,100,0.15)' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#e8d5a0' }}>Data Collected</h3>
          <ul className="space-y-2">
            {['Total hours slept', 'Sleep onset and wake times', 'Number of awakenings', 'Subjective sleep depth', 'Lunar day alignment (0–29)', 'Illumination percentage'].map((item) => (
              <li key={item} className="text-base flex gap-2" style={{ color: 'rgba(232,213,160,0.65)' }}>
                <span style={{ color: 'rgba(200,180,120,0.5)' }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-lg" style={{ background: 'rgba(107,95,160,0.08)', border: '1px solid rgba(107,95,160,0.2)' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#e8d5a0' }}>Phenomenological Advantages</h3>
          <ul className="space-y-2">
            {['Longitudinal depth across hundreds of lunar cycles', 'Contextual richness distinguishing lunar vs. other effects', 'Internal qualitative access instruments cannot capture', 'Heightened sensitivity as autistic/bipolar individual'].map((item) => (
              <li key={item} className="text-base flex gap-2" style={{ color: 'rgba(232,213,160,0.65)' }}>
                <span style={{ color: 'rgba(107,95,160,0.8)' }}>▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-base tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>Phase Phenomenology</h3>
        <div className="space-y-3">
          {[
            { phase: '🌑 New Moon',        feel: 'Restoration', desc: 'Profound heaviness, deep dream-rich sleep, emotional quieting, internal "reset." Not depression — restoration.',                             color: '#6b5fa0' },
            { phase: '🌒→🌔 Waxing',       feel: 'Recalibration', desc: 'Gradual movement toward the full moon extreme. A shifting tide. Increasing alertness and energy.',                                           color: '#8b7da0' },
            { phase: '🌕 Full Moon',        feel: 'Activation', desc: 'Heightened alertness, sharpened sensory perception, racing but clear thoughts, inability to descend into sleep. Not mania — activation.',       color: '#c8b46a' },
            { phase: '🌖→🌘 Waning',        feel: 'Return', desc: 'Gradual recovery of sleep capacity. Emotional quieting. Movement back toward the dark moon and restoration.',                                        color: '#9a8a5a' },
          ].map((p) => (
            <div key={p.phase} className="flex gap-4 p-5 rounded" style={{ background: `${p.color}12`, borderLeft: `3px solid ${p.color}60` }}>
              <div className="text-xl pt-0.5">{p.phase.slice(0, 2)}</div>
              <div>
                <div className="text-base font-semibold mb-1" style={{ color: p.color }}>{p.phase.slice(3)} — {p.feel}</div>
                <div className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.6)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <blockquote className="text-lg italic border-l-2 pl-4" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
        "In phenomenology, the researcher is not a contaminant. The researcher is the instrument."
      </blockquote>
    </div>
  );
}

function MathSection() {
  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        The Luna Cycler did not begin as an equation — it began as a sensation. A heaviness near the new moon. A sharpening near the full moon. A smooth rise and fall that repeated with uncanny regularity. Only after years of tracking did I realize that what I was feeling could be expressed mathematically — not to reduce the experience, but to reveal its structure.
      </p>

      <div className="p-6 rounded-lg text-center" style={{ background: 'rgba(200,180,100,0.06)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h3 className="text-sm tracking-widest uppercase mb-5" style={{ color: 'rgba(200,180,120,0.5)' }}>The Core Equation</h3>
        <div className="text-2xl md:text-3xl mb-5" style={{ color: '#e8d5a0', letterSpacing: '0.05em' }}>
          S(d) = 6.5 + 6.5 · cos(2πd / 28)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-base">
          {[
            { sym: 'S(d)',   def: 'Sleep duration on day d' },
            { sym: 'A = 6.5', def: 'Baseline (vertical shift)' },
            { sym: 'B = 6.5', def: 'Amplitude' },
            { sym: 'T = 28',  def: 'Period (days)' },
          ].map((v) => (
            <div key={v.sym} className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#c8b46a' }}>{v.sym}</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(232,213,160,0.5)' }}>{v.def}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>Waveform Visualization</h3>
        <LunarSleepChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Phase Locking', desc: 'Sleep peak consistently aligned with new moon, trough with full moon — across seasons, medication changes, and environments. Phase locking is not coincidence. It is entrainment.', icon: '🔒' },
          { title: 'Asymmetry',    desc: 'The descent into full moon wakefulness is steeper than the ascent out of it. The new moon hypersomnia sometimes forms a broader plateau than the cosine model predicts.',            icon: '〰️' },
          { title: 'Amplitude',   desc: 'The 13-hour swing from peak to trough is unusually large but not biologically impossible. It is the signature of a high-amplitude oscillator with heightened chronobiological sensitivity.', icon: '📊' },
        ].map((item) => (
          <div key={item.title} className="p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,180,120,0.1)' }}>
            <div className="text-2xl mb-3">{item.icon}</div>
            <div className="text-base font-semibold mb-2" style={{ color: '#e8d5a0' }}>{item.title}</div>
            <div className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.6)' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <blockquote className="text-lg italic border-l-2 pl-4" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
        "The Luna Cycler is not just something that happens to me. It is something I can articulate, model, and defend."
      </blockquote>
    </div>
  );
}

function TheorySection() {
  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        The Luna Cycler emerges at the intersection of three domains that rarely speak to one another: chronobiology, neurodivergence, and temporal anthropology. This section constructs a unified theoretical framework integrating all three.
      </p>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.07)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: '#e8d5a0' }}>Formal Definition</h3>
        <p className="text-lg leading-relaxed" style={{ color: 'rgba(232,213,160,0.75)', fontStyle: 'italic' }}>
          A high-amplitude, individual-specific, lunar-entrained infradian sleep oscillator, amplified by neurodivergent sensitivity and distorted by solar industrial temporal structures.
        </p>
      </div>

      <div>
        <h3 className="text-sm tracking-widest uppercase mb-4" style={{ color: 'rgba(200,180,120,0.5)' }}>The Three Domains</h3>
        <div className="space-y-4">
          {[
            {
              domain: 'Chronobiology',       subtitle: 'Infradian Rhythms',      color: '#6b5fa0',
              points: [
                'The SCN is not the only biological clock — humans exhibit menstrual, seasonal, metabolic, immune, and tidal cycles',
                'Infradian rhythms respond to gravity, electromagnetic fields, and ancestral mechanisms',
                'The Luna Cycler fits naturally as a 29.5-day infradian oscillator',
                'Chronobiology has neglected infradian rhythms due to methodological bias toward short-period cycles',
              ],
            },
            {
              domain: 'Neurodivergence',     subtitle: 'Amplifier, Not Confounder', color: '#c8b46a',
              points: [
                'Autistic traits: atypical melatonin cycles, heightened interoception, strong pattern recognition',
                'Bipolar physiology: circadian instability, light-driven mood shifts, infradian cycling (Wehr, 2018)',
                'Neurodivergence reveals patterns hidden in neurotypical noise',
                'My nervous system is not malfunctioning — it is detecting a signal others cannot',
              ],
            },
            {
              domain: 'Temporal Anthropology', subtitle: 'Clash of Calendars',    color: '#a07860',
              points: [
                'Modern society is built on solar, 7-day, Gregorian time — none of it biological in origin',
                'Lunar time is cyclical, embodied, variable; solar industrial time is linear and extractive',
                'Forcing a lunar-entrained body into a solar schedule produces temporal dissonance',
                'The conflict is structural mismatch, not personal dysfunction',
              ],
            },
          ].map((d) => (
            <div key={d.domain} className="p-5 rounded-lg" style={{ background: `${d.color}0d`, border: `1px solid ${d.color}25` }}>
              <div className="flex flex-wrap gap-3 items-baseline mb-4">
                <h4 className="text-base font-semibold" style={{ color: d.color }}>{d.domain}</h4>
                <span className="text-sm" style={{ color: 'rgba(232,213,160,0.4)' }}>{d.subtitle}</span>
              </div>
              <ul className="space-y-2">
                {d.points.map((p) => (
                  <li key={p} className="text-base flex gap-2" style={{ color: 'rgba(232,213,160,0.65)' }}>
                    <span style={{ color: `${d.color}80` }}>▸</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded" style={{ background: 'rgba(200,180,100,0.05)', border: '1px solid rgba(200,180,100,0.15)' }}>
        <h4 className="text-sm tracking-widest uppercase mb-3" style={{ color: 'rgba(200,180,120,0.5)' }}>Proposed Entrainment Mechanisms</h4>
        <div className="grid grid-cols-2 gap-3 text-base" style={{ color: 'rgba(232,213,160,0.6)' }}>
          <div>🌙 Light-mediated (melatonin at low lux)</div>
          <div>🌊 Gravitational (tidal forces)</div>
          <div>⚡ Electromagnetic (geomagnetic modulation)</div>
          <div>🧬 Evolutionary (ancestral adaptation)</div>
        </div>
      </div>
    </div>
  );
}

function CritiqueSection() {
  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        If the Luna Cycler is a biological truth, then the Gregorian calendar is a political one. The conflict between a lunar-entrained body and the solar industrial world is not a personal failing — it is the result of a historical process in which one temporal system violently displaced another.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg" style={{ background: 'rgba(107,95,160,0.1)', border: '1px solid rgba(107,95,160,0.25)' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#9a8fd0' }}>Lunar Time</h3>
          <ul className="space-y-2 text-base" style={{ color: 'rgba(232,213,160,0.65)' }}>
            {['Cyclical', 'Embodied', 'Variable month lengths', 'Accommodates biological variation', 'Ancestral & cross-cultural'].map((item) => (
              <li key={item} className="flex gap-2"><span style={{ color: '#9a8fd0' }}>◇</span>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.08)', border: '1px solid rgba(200,180,100,0.2)' }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#c8b46a' }}>Solar Industrial Time</h3>
          <ul className="space-y-2 text-base" style={{ color: 'rgba(232,213,160,0.65)' }}>
            {['Linear', 'Extractive', 'Rigid fixed months', 'Demands uniformity', '16th-century European political instrument'].map((item) => (
              <li key={item} className="flex gap-2"><span style={{ color: '#c8b46a' }}>◇</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-sm tracking-widest uppercase mb-5" style={{ color: 'rgba(200,180,120,0.5)' }}>Timeline of Displacement</h3>
        <div className="relative pl-6 space-y-5 border-l" style={{ borderColor: 'rgba(200,180,120,0.2)' }}>
          {[
            { year: '20,000 BCE', event: 'Ishango bone — earliest lunar tally marks; humanity tracked the moon long before the sun became the primary temporal reference.' },
            { year: '~3000 BCE',  event: 'Babylonian, Hebrew, Egyptian lunar calendars govern civic and religious life across the ancient Near East.' },
            { year: '1582 CE',    event: 'Pope Gregory XIII introduces the Gregorian calendar — a political project spread globally through colonial conquest, not scientific consensus.' },
            { year: '1750–1850', event: 'Industrial Revolution imposes mechanical clock time; factories require synchronized labor, suppressing natural bodily rhythms as obstacles to productivity.' },
            { year: 'Today',      event: 'Gregorian calendar governs global life; lunar calendars marginalized to ritual use; bodies like mine labeled "disordered" for not conforming.' },
          ].map((item) => (
            <div key={item.year} className="relative">
              <div className="absolute -left-[1.6rem] w-3 h-3 rounded-full mt-1" style={{ background: 'rgba(200,180,120,0.5)' }} />
              <div className="text-sm font-mono mb-1" style={{ color: 'rgba(200,180,120,0.6)' }}>{item.year}</div>
              <div className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>{item.event}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.06)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h4 className="text-base font-semibold mb-3" style={{ color: '#e8d5a0' }}>The 7-Day Week: A Non-Astronomical Imposition</h4>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
          The 7-day week has no astronomical basis. It does not correspond to lunar phases, solar cycles, planetary orbits, or biological rhythms. It is a cultural artifact derived from ancient Near Eastern numerology, reinforced by religious structures, and adopted by industrial capitalism for predictable labor cycles. For a lunar-entrained body, the week is meaningless. My sleep does not care whether it is Monday or Saturday. It cares where the moon is.
        </p>
      </div>

      <blockquote className="text-lg italic border-l-2 pl-4" style={{ borderColor: 'rgba(200,180,120,0.4)', color: 'rgba(232,213,160,0.6)' }}>
        "My lunar-entrained sleep pattern is not unnatural. The Gregorian calendar is.<br />My body is not backward. It is pre-colonial."
      </blockquote>
    </div>
  );
}

function DiscussionSection() {
  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        The Luna Cycler is not simply a sleep pattern. It is a site of tension between body and society, between ancient rhythms and modern structures, between neurodivergent sensitivity and normative temporal expectations. This section synthesizes the implications across multiple domains.
      </p>

      <div className="space-y-6">
        {[
          {
            num: '8.1', title: 'Rethinking "Normal" in Human Temporal Biology',
            content: 'Human temporal biology may include circadian (daily), ultradian (hourly), infradian (monthly), and circalunar (synodic month) rhythms. Expressing a high-amplitude lunar rhythm does not make one abnormal — it makes one visible evidence of a biological diversity that science has not yet fully mapped.',
          },
          {
            num: '8.2', title: 'Neurodivergence as a Lens, Not a Liability',
            content: 'Autistic sensory sensitivity, bipolar circadian fragility, and heightened interoception are not obstacles to understanding the Luna Cycler. They are the traits that make its detection possible. What is labeled "instability" may sometimes be entrainment to a different temporal structure. Neurodivergence may be a difference in temporal attunement, not merely cognitive difference.',
          },
          {
            num: '8.3', title: 'The Body as Archive: Remembering What Society Forgot',
            content: 'The body evolved under lunar cycles for tens of thousands of years. The shift to solar industrial time is historically recent — biologically irrelevant. The Luna Cycler may represent an ancestral rhythm, a vestigial entrainment mechanism, a temporal memory encoded in physiology. My body is not resisting modern time out of stubbornness. It is expressing a rhythm that predates modern time entirely.',
          },
          {
            num: '8.4', title: 'Temporal Mismatch as a Source of Suffering',
            content: 'The distress associated with the Luna Cycler does not come from the rhythm itself — it comes from mismatch. Forcing a solar schedule produces sleep deprivation, mood destabilization, and self-doubt. Following the lunar rhythm produces deeper rest, clearer thinking, and physiological coherence. The suffering is produced by a society that recognizes only one temporal architecture.',
          },
          {
            num: '8.5', title: 'Challenge to Temporal Hegemony',
            content: 'The Luna Cycler asserts that multiple temporalities exist, and that the one imposed by modern society is not the only valid framework. Recognizing temporal diversity would require society to accommodate flexible sleep schedules, variable productivity cycles, non-linear work rhythms, and neurodivergent temporalities. The Luna Cycler becomes a form of temporal resistance.',
          },
        ].map((item) => (
          <div key={item.num} className="flex gap-4 items-start">
            <span className="text-sm font-mono pt-1" style={{ color: 'rgba(200,180,120,0.4)', minWidth: '2.5rem' }}>{item.num}</span>
            <div>
              <h4 className="text-base font-semibold mb-2" style={{ color: '#e8d5a0' }}>{item.title}</h4>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.07)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h4 className="text-base font-semibold mb-4" style={{ color: '#e8d5a0' }}>The Luna Cycler Is Both:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base" style={{ color: 'rgba(232,213,160,0.7)' }}>
          <div className="p-4 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="font-semibold mb-2" style={{ color: '#c8b46a' }}>A Biological Oscillator</div>
            High-amplitude, infradian, phase-locked to the lunar cycle, mathematically modelable with precision.
          </div>
          <div className="p-4 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="font-semibold mb-2" style={{ color: '#9a8fd0' }}>A Cultural Critique</div>
            Challenges solar-centric chronobiology, industrial time, and the pathologization of temporal diversity.
          </div>
        </div>
      </div>
    </div>
  );
}

function ConclusionSection() {
  const references = [
    'Aveni, A. (2001). Skywatchers. University of Texas Press.',
    'Baker, E., & Richdale, A. (2015). Sleep patterns in adults with autism spectrum disorder. Research in Autism Spectrum Disorders, 11, 8–17.',
    'Bauer, M., Glenn, T., Alda, M., et al. (2021). Relationship between lunar phases and mood episodes in bipolar disorder. Translational Psychiatry, 11, 1–9.',
    'Benbadis, S. R., Chang, S., Hunter, J., & Wang, W. (2004). The influence of the full moon on seizure frequency. Epilepsy & Behavior, 5(4), 596–597.',
    'Brainard, G. C., et al. (2001). Action spectrum for melatonin regulation in humans. Journal of Neuroscience, 21(16), 6405–6412.',
    'Cajochen, C., et al. (2013). Evidence that the lunar cycle influences human sleep. Current Biology, 23(15), 1485–1488.',
    'Casiraghi, L., et al. (2021). Moonstruck sleep: Synchronization of human sleep with the moon cycle under natural conditions. Science Advances, 7(5).',
    'Cutler, W. B., et al. (1980). Lunar influences on the menstrual cycle. American Journal of Obstetrics and Gynecology, 137(7), 834–839.',
    'de la Iglesia, H. O., et al. (2021). Moonstruck sleep. Science Advances, 7(5).',
    'Gooley, J. J., et al. (2011). Exposure to room light before bedtime suppresses melatonin onset. Journal of Clinical Endocrinology & Metabolism, 96(3), E463–E472.',
    'Hannah, R. (2005). Greek and Roman Calendars: Constructions of Time in the Classical World. Duckworth.',
    'Lieber, A. L. (1978). Human aggression and the lunar synodic cycle. Journal of Clinical Psychiatry, 39(5), 385–392.',
    'MacKillop, J. (1998). Dictionary of Celtic Mythology. Oxford University Press.',
    'Marshack, A. (1972). The Roots of Civilization. McGraw-Hill.',
    'Moore, R. Y. (2013). The suprachiasmatic nucleus and the circadian timing system. Progress in Molecular Biology and Translational Science, 119, 1–28.',
    'Needham, J. (1959). Science and Civilisation in China. Cambridge University Press.',
    'Parry, B. L., et al. (1989). Full moon and sleep: A preliminary study. Psychiatry Research, 27(3), 325–331.',
    'Sahlins, M. (1999). Two or three things that I know about culture. Journal of the Royal Anthropological Institute, 5(3), 399–421.',
    'Varela, F. J., & Shear, J. (1999). The View from Within: First Person Approaches to the Study of Consciousness. Imprint Academic.',
    'Wehr, T. A. (1984). The sleep of long distance truck drivers. New England Journal of Medicine, 310(12), 755–759.',
    'Wehr, T. A. (2018). Bipolar mood cycles and lunar cycles. Molecular Psychiatry, 23, 923–931.',
  ];

  const findings = [
    'Lunar influences on human sleep are empirically documented (Cajochen et al., 2013; de la Iglesia et al., 2021)',
    'Infradian rhythms are a legitimate part of human physiology',
    'Neurodivergent individuals may exhibit heightened temporal sensitivity',
    'Lunar timekeeping has deep cross-cultural and historical roots',
    'The Gregorian calendar is a political construct, not a biological one',
    'Phenomenological self-observation is a valid method for detecting long-period rhythms',
    'The Luna Cycler can be mathematically modeled with precision',
    'Temporal diversity is real, meaningful, and systematically erased',
  ];

  return (
    <div className="space-y-8">
      <blockquote className="text-lg leading-relaxed italic" style={{ color: 'rgba(232,213,160,0.75)', borderLeft: '2px solid rgba(200,180,120,0.4)', paddingLeft: '1.25rem' }}>
        "The Luna Cycler began as a private mystery — a pattern I lived long before I understood it, a rhythm that shaped my nights and days in ways that felt both intimate and inexplicable."
      </blockquote>

      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        For years I interpreted this through the frameworks available to me: insomnia, bipolar cycling, stress, poor discipline, personal failure. None of these explanations fit. None could account for the smoothness of the oscillation, the precision of its timing, the way it repeated month after month with the quiet authority of a tide.
      </p>

      <p className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.65)' }}>
        Only when I aligned my sleep data with the lunar cycle did the pattern reveal itself. Only when I allowed myself to trust my own perception — my autistic pattern recognition, my bipolar sensitivity, my embodied awareness — did the Luna Cycler emerge as something coherent, rhythmic, and real. And only when I placed that lived truth in conversation with chronobiology, anthropology, mathematics, and history did I understand that my body was not malfunctioning. It was <em>remembering</em>.
      </p>

      <div className="p-5 rounded-lg" style={{ background: 'rgba(200,180,100,0.06)', border: '1px solid rgba(200,180,100,0.2)' }}>
        <h3 className="text-sm tracking-widest uppercase mb-5" style={{ color: 'rgba(200,180,120,0.5)' }}>This Paper Has Shown</h3>
        <div className="space-y-3">
          {findings.map((item, i) => (
            <div key={i} className="flex gap-3 text-base" style={{ color: 'rgba(232,213,160,0.7)' }}>
              <span style={{ color: 'rgba(200,180,120,0.5)', minWidth: '1.5rem' }}>{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg text-center" style={{ background: 'rgba(107,95,160,0.1)', border: '1px solid rgba(107,95,160,0.25)' }}>
        <p className="text-lg leading-relaxed" style={{ color: 'rgba(232,213,160,0.8)', fontStyle: 'italic', lineHeight: 2 }}>
          "My body follows the moon.<br />
          It always has.<br />
          This paper is the first time I have allowed myself to say that without apology.<br />
          And in saying it, I am not just describing a rhythm.<br />
          <strong style={{ color: '#e8d5a0', fontStyle: 'normal' }}>I am reclaiming a self.</strong>"
        </p>
      </div>

      <div>
        <h3 className="text-sm tracking-widest uppercase mb-5" style={{ color: 'rgba(200,180,120,0.5)' }}>References</h3>
        <div className="space-y-3">
          {references.map((ref, i) => (
            <p key={i} className="text-base leading-relaxed" style={{ color: 'rgba(232,213,160,0.5)', paddingLeft: '1.5rem', textIndent: '-1.5rem' }}>
              {ref}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Content Map ──────────────────────────────────────────────────────────────

const CONTENT_MAP: Record<SectionId, React.ComponentType> = {
  title:        TitlePage,
  abstract:     AbstractSection,
  literature:   LiteratureSection,
  crosscultural:CrossCulturalSection,
  methodology:  MethodologySection,
  math:         MathSection,
  theory:       TheorySection,
  critique:     CritiqueSection,
  discussion:   DiscussionSection,
  conclusion:   ConclusionSection,
};

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function LunaCyclerApp() {
  const [active, setActive] = useState<SectionId>('title');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  // Safe lookup — active is always a valid SectionId so find always succeeds,
  // but the fallback satisfies TypeScript's strict undefined check.
  const currentSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const ContentComponent = CONTENT_MAP[active];

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  const currentIndex = SECTIONS.findIndex((s) => s.id === active);

  const navTo = (id: SectionId) => { setActive(id); setSidebarOpen(false); };

  return (
    <div style={{
      background: '#0a0812',
      minHeight: '100vh',
      color: '#e8d5a0',
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(107,95,160,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(200,180,100,0.04) 0%, transparent 50%)',
      }} />

      {/* ── Top Nav ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,8,18,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200,180,120,0.12)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MoonPhaseIcon phase={currentSection.phase} size={28} />
            <span style={{ fontSize: '0.9rem', color: 'rgba(232,213,160,0.7)', letterSpacing: '0.05em' }}>
              The Luna Cycler
            </span>
          </div>

          {/* Desktop moon-phase pill nav */}
          <nav className="hidden md:flex" style={{ gap: '4px' }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => navTo(s.id)}
                title={s.label}
                style={{
                  padding: '4px 8px', borderRadius: '999px', fontSize: '1rem',
                  border: 'none', cursor: 'pointer',
                  background: active === s.id ? 'rgba(200,180,100,0.15)' : 'transparent',
                  color: active === s.id ? '#e8d5a0' : 'rgba(232,213,160,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {s.moon}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', color: 'rgba(232,213,160,0.6)', cursor: 'pointer', fontSize: '1.3rem', padding: '4px' }}
          >
            ☰
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 1 }}>
        {/* ── Sidebar ── */}
        <aside
          className="md:block"
          style={{
            width: '220px', minWidth: '220px',
            borderRight: '1px solid rgba(200,180,120,0.1)',
            padding: '1.5rem 0',
            position: 'sticky', top: '52px',
            height: 'calc(100vh - 52px)', overflowY: 'auto',
            background: 'rgba(10,8,18,0.95)',
            display: sidebarOpen ? 'block' : undefined,
          }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => navTo(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', textAlign: 'left',
                padding: '9px 20px',
                background: active === s.id ? 'rgba(200,180,100,0.09)' : 'transparent',
                border: 'none',
                borderLeft: active === s.id ? '2px solid rgba(200,180,100,0.6)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.1rem', minWidth: '1.5rem' }}>{s.moon}</span>
              <span style={{
                fontSize: '0.9rem',
                color: active === s.id ? '#e8d5a0' : 'rgba(232,213,160,0.4)',
                letterSpacing: '0.02em', lineHeight: 1.3,
              }}>
                {i === 0 ? 'Title Page' : `§${i} ${s.label}`}
              </span>
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main
          ref={contentRef}
          style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '720px', margin: '0 auto', overflowX: 'hidden' }}
        >
          {active !== 'title' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.9rem', letterSpacing: '0.3em', color: 'rgba(200,180,120,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {currentSection.subtitle}
              </p>
              <h2 style={{ fontSize: '2rem', color: '#e8d5a0', letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>
                {currentSection.title}
              </h2>
              <div style={{ width: '3rem', height: '1px', background: 'linear-gradient(90deg, rgba(200,180,100,0.5), transparent)', marginTop: '1rem' }} />
            </div>
          )}

          <ContentComponent />

          {/* ── Navigation Buttons ── */}
          {active === 'title' ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => navTo('abstract')}
                style={{
                  background: 'rgba(200,180,100,0.1)', border: '1px solid rgba(200,180,100,0.3)',
                  color: '#e8d5a0', padding: '12px 32px', borderRadius: '4px',
                  cursor: 'pointer', fontSize: '1rem', letterSpacing: '0.1em',
                  fontFamily: 'inherit',
                }}
              >
                Begin Reading →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(200,180,120,0.1)' }}>
              <button
                onClick={() => currentIndex > 0 && navTo(SECTIONS[currentIndex - 1].id)}
                disabled={currentIndex === 0}
                style={{
                  background: 'none', border: '1px solid rgba(200,180,120,0.2)',
                  color: currentIndex === 0 ? 'rgba(232,213,160,0.2)' : 'rgba(232,213,160,0.5)',
                  padding: '10px 20px', borderRadius: '4px',
                  cursor: currentIndex === 0 ? 'default' : 'pointer',
                  fontSize: '1rem', fontFamily: 'inherit',
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => currentIndex < SECTIONS.length - 1 && navTo(SECTIONS[currentIndex + 1].id)}
                disabled={currentIndex === SECTIONS.length - 1}
                style={{
                  background: 'none', border: '1px solid rgba(200,180,120,0.2)',
                  color: currentIndex === SECTIONS.length - 1 ? 'rgba(232,213,160,0.2)' : 'rgba(232,213,160,0.5)',
                  padding: '10px 20px', borderRadius: '4px',
                  cursor: currentIndex === SECTIONS.length - 1 ? 'default' : 'pointer',
                  fontSize: '1rem', fontFamily: 'inherit',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
