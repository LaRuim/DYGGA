import { useState, useMemo, useEffect } from 'react';
import { TrendingDown, TrendingUp, Activity, Clock, Layers, Target, Play, Pause } from 'lucide-react';
import { CLUSTERS, CONVERGENCE, MONTHLY_CHURN } from '../data/mlResults';

// ============================================================
// Shared shell used by every short so the visuals look consistent.
// ============================================================
function ShortShell({ eyebrow, title, children, footer, accent = '#4ecdc4' }) {
  return (
    <div className="short-viz-placeholder short-ml">
      <div className="short-ml-inner">
        <div className="short-ml-eyebrow" style={{ color: accent }}>{eyebrow}</div>
        <div className="short-ml-title">{title}</div>
        <div className="short-ml-stage">{children}</div>
        {footer && <div className="short-ml-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================
// 1. Attention Concentration (ML result)
//    Shannon entropy + top-3 category share, 2022-2025
// ============================================================
export function ConvergenceShort() {
  const years = CONVERGENCE.entropy_by_year.map((d) => d.year);
  const entropy = CONVERGENCE.entropy_by_year.map((d) => d.entropy);
  const top3 = CONVERGENCE.top3_by_year.map((d) => d.share);

  const [year, setYear] = useState(years[years.length - 1]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => {
      setYear((y) => {
        const next = years[(years.indexOf(y) + 1) % years.length];
        return next;
      });
    }, 1400);
    return () => clearInterval(tick);
  }, [playing, years]);

  const idx = years.indexOf(year);
  const curE = entropy[idx];
  const curT = top3[idx];
  const dEntropy = curE - entropy[0];
  const dTop3 = curT - top3[0];

  // SVG dual-line chart
  const w = 320, h = 160, pad = 28;
  const xs = years.map((_, i) => pad + (i * (w - 2 * pad)) / (years.length - 1));
  const eMin = Math.min(...entropy), eMax = Math.max(...entropy);
  const tMin = Math.min(...top3), tMax = Math.max(...top3);
  const eY = (v) => h - pad - ((v - eMin) / (eMax - eMin || 1)) * (h - 2 * pad);
  const tY = (v) => h - pad - ((v - tMin) / (tMax - tMin || 1)) * (h - 2 * pad);
  const ePath = entropy.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs[i]},${eY(v)}`).join(' ');
  const tPath = top3.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs[i]},${tY(v)}`).join(' ');

  return (
    <ShortShell
      eyebrow="CONVERGENCE · 2022 → 2025"
      title="Attention is concentrating"
      accent="#ff8a8a"
      footer={
        <div className="short-stat-row">
          <div className="short-stat">
            <div className="short-stat-label"><TrendingDown size={12} /> Shannon entropy</div>
            <div className="short-stat-val">{curE.toFixed(3)}</div>
            <div className="short-stat-delta" style={{ color: dEntropy < 0 ? '#ff8a8a' : '#4ecdc4' }}>
              {dEntropy >= 0 ? '+' : ''}{dEntropy.toFixed(3)} vs 2022
            </div>
          </div>
          <div className="short-stat">
            <div className="short-stat-label"><TrendingUp size={12} /> Top-3 share</div>
            <div className="short-stat-val">{(curT * 100).toFixed(1)}%</div>
            <div className="short-stat-delta" style={{ color: dTop3 > 0 ? '#ff8a8a' : '#4ecdc4' }}>
              {dTop3 >= 0 ? '+' : ''}{(dTop3 * 100).toFixed(1)} pp vs 2022
            </div>
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="short-svg">
        <defs>
          <linearGradient id="eFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8a8a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff8a8a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${ePath} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`} fill="url(#eFill)" />
        <path d={ePath} stroke="#ff8a8a" strokeWidth="2" fill="none" />
        <path d={tPath} stroke="#ffe66d" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        {years.map((y, i) => (
          <g key={y}>
            <circle cx={xs[i]} cy={eY(entropy[i])} r={y === year ? 5 : 3} fill="#ff8a8a" />
            <circle cx={xs[i]} cy={tY(top3[i])} r={y === year ? 5 : 3} fill="#ffe66d" />
            <text x={xs[i]} y={h - 8} fill="rgba(255,255,255,0.55)" fontSize="10" textAnchor="middle">{y}</text>
          </g>
        ))}
        <g fontSize="9" fill="rgba(255,255,255,0.6)">
          <rect x={pad} y={4} width="10" height="10" fill="#ff8a8a" />
          <text x={pad + 14} y={13}>entropy</text>
          <rect x={pad + 64} y={4} width="10" height="10" fill="#ffe66d" />
          <text x={pad + 78} y={13}>top-3 share</text>
        </g>
      </svg>

      <div className="short-scrubber">
        <button className="short-play-btn" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <input
          type="range"
          min={years[0]}
          max={years[years.length - 1]}
          step={1}
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setPlaying(false); }}
          className="short-range"
        />
        <div className="short-year">{year}</div>
      </div>
    </ShortShell>
  );
}

// ============================================================
// 2. Trending Duration Survival (ML result)
//    Kaplan-Meier median trending duration rising 2022 → 2025
// ============================================================
const KM_MEDIAN_DAYS = [
  { year: 2022, days: 8.00 },
  { year: 2023, days: 8.75 },
  { year: 2024, days: 10.75 },
  { year: 2025, days: 10.50 },
];

export function SurvivalShort() {
  const [year, setYear] = useState(2025);
  const row = KM_MEDIAN_DAYS.find((r) => r.year === year);
  const base = KM_MEDIAN_DAYS[0].days;
  const delta = row.days - base;

  // Render synthetic KM curves per year (exponential decay where median matches data)
  const w = 320, h = 170, pad = 28;
  const tMax = 25;
  const colors = ['#8fb8ff', '#54a0ff', '#ff9f43', '#ff6b6b'];
  const buildCurve = (median) => {
    const k = Math.log(2) / median;
    const steps = 40;
    return Array.from({ length: steps + 1 }).map((_, i) => {
      const t = (i / steps) * tMax;
      const s = Math.exp(-k * t);
      return [pad + (t / tMax) * (w - 2 * pad), h - pad - s * (h - 2 * pad)];
    });
  };

  return (
    <ShortShell
      eyebrow="KAPLAN-MEIER · SURVIVAL"
      title="Videos linger on trending"
      accent="#ff9f43"
      footer={
        <div className="short-stat-row">
          <div className="short-stat">
            <div className="short-stat-label"><Clock size={12} /> Median duration</div>
            <div className="short-stat-val">{row.days.toFixed(2)} <span className="short-stat-unit">days</span></div>
            <div className="short-stat-delta" style={{ color: delta > 0 ? '#ff8a8a' : '#4ecdc4' }}>
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)} d vs 2022
            </div>
          </div>
          <div className="short-stat">
            <div className="short-stat-label"><Activity size={12} /> Log-rank</div>
            <div className="short-stat-val">p &lt; 0.001</div>
            <div className="short-stat-delta" style={{ color: '#4ecdc4' }}>2022 vs 2025 significant</div>
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="short-svg">
        {/* reference 50% line */}
        <line x1={pad} x2={w - pad} y1={h / 2 - 4} y2={h / 2 - 4} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />
        <text x={w - pad} y={h / 2 - 7} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">50% still trending</text>
        {KM_MEDIAN_DAYS.map((r, i) => {
          const pts = buildCurve(r.days);
          const d = pts.map(([x, y], k) => `${k === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
          const active = r.year === year;
          return (
            <path
              key={r.year}
              d={d}
              fill="none"
              stroke={colors[i]}
              strokeWidth={active ? 2.5 : 1.2}
              opacity={active ? 1 : 0.45}
            />
          );
        })}
        {/* axes labels */}
        <text x={pad} y={h - 6} fontSize="9" fill="rgba(255,255,255,0.5)">0 d</text>
        <text x={w - pad} y={h - 6} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">{tMax} d</text>
        <text x={pad - 4} y={pad + 4} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">1.0</text>
        <text x={pad - 4} y={h - pad} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end">0</text>
      </svg>

      <div className="short-year-row">
        {KM_MEDIAN_DAYS.map((r, i) => (
          <button
            key={r.year}
            className={`short-year-pill ${r.year === year ? 'active' : ''}`}
            onClick={() => setYear(r.year)}
            style={{ borderColor: r.year === year ? colors[i] : 'transparent', color: r.year === year ? colors[i] : undefined }}
          >
            {r.year}
          </button>
        ))}
      </div>
    </ShortShell>
  );
}

// ============================================================
// 3. BERTopic Noise Reduction (Evaluation)
// ============================================================
const BERTOPIC = [
  { cat: 'Entertainment',    docs: 205063, topics: 26, noiseBefore: 0.527, noiseAfter: 0.171 },
  { cat: 'People & Blogs',   docs:  98664, topics: 50, noiseBefore: 0.506, noiseAfter: 0.097 },
  { cat: 'Sports',           docs:  86201, topics: 84, noiseBefore: 0.479, noiseAfter: 0.067 },
  { cat: 'Gaming',           docs:  79790, topics: 99, noiseBefore: 0.509, noiseAfter: 0.066 },
  { cat: 'Music',            docs:  70943, topics: 73, noiseBefore: 0.496, noiseAfter: 0.077 },
];

export function BertopicShort() {
  const [phase, setPhase] = useState('after'); // before | after
  const [selected, setSelected] = useState(2); // Sports

  const cur = BERTOPIC[selected];
  const noise = phase === 'before' ? cur.noiseBefore : cur.noiseAfter;
  const avgBefore = BERTOPIC.reduce((s, r) => s + r.noiseBefore, 0) / BERTOPIC.length;
  const avgAfter = BERTOPIC.reduce((s, r) => s + r.noiseAfter, 0) / BERTOPIC.length;

  return (
    <ShortShell
      eyebrow="BERTOPIC · OUTLIER REDUCTION"
      title="Noise halved after refit"
      accent="#4ecdc4"
      footer={
        <div className="short-stat-row">
          <div className="short-stat">
            <div className="short-stat-label"><Layers size={12} /> {cur.cat} noise</div>
            <div className="short-stat-val">{(noise * 100).toFixed(1)}%</div>
            <div className="short-stat-delta" style={{ color: '#4ecdc4' }}>
              {((cur.noiseBefore - cur.noiseAfter) * 100).toFixed(1)} pp reduction
            </div>
          </div>
          <div className="short-stat">
            <div className="short-stat-label"><Target size={12} /> Topics found</div>
            <div className="short-stat-val">{cur.topics}</div>
            <div className="short-stat-delta">{(cur.docs / 1000).toFixed(0)}K docs</div>
          </div>
        </div>
      }
    >
      <div className="short-bertopic">
        <div className="short-phase-toggle">
          <button className={`short-phase-btn ${phase === 'before' ? 'active' : ''}`} onClick={() => setPhase('before')}>
            Before · {(avgBefore * 100).toFixed(0)}% avg noise
          </button>
          <button className={`short-phase-btn ${phase === 'after' ? 'active' : ''}`} onClick={() => setPhase('after')}>
            After · {(avgAfter * 100).toFixed(0)}% avg noise
          </button>
        </div>

        <div className="short-bars">
          {BERTOPIC.map((r, i) => {
            const v = phase === 'before' ? r.noiseBefore : r.noiseAfter;
            const active = i === selected;
            return (
              <button
                key={r.cat}
                className={`short-bar-row ${active ? 'active' : ''}`}
                onClick={() => setSelected(i)}
              >
                <div className="short-bar-label">{r.cat}</div>
                <div className="short-bar-track">
                  <div
                    className="short-bar-fill"
                    style={{
                      width: `${v * 100}%`,
                      background: phase === 'before' ? '#ff8a8a' : '#4ecdc4',
                      transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  />
                </div>
                <div className="short-bar-val">{(v * 100).toFixed(1)}%</div>
              </button>
            );
          })}
        </div>
      </div>
    </ShortShell>
  );
}

// ============================================================
// 4. DBSCAN Archetype Profiles (Evaluation)
// ============================================================
const ARCHETYPE_IDS = [0, 1, 2, 3, 4, 5];

export function ArchetypeShort() {
  const [cid, setCid] = useState(2); // Western Anglosphere — the visible outlier

  // Normalize each metric against the peer archetypes so bars are comparable
  const metrics = useMemo(() => {
    const ms = ['mean_duration', 'mean_ttt', 'mean_engagement', 'mean_views'];
    return ms.map((m) => {
      const vals = ARCHETYPE_IDS.map((i) => CLUSTERS[i].profile[m]);
      return { key: m, min: Math.min(...vals), max: Math.max(...vals) };
    });
  }, []);

  const c = CLUSTERS[cid];
  const norm = (key, v) => {
    const m = metrics.find((x) => x.key === key);
    const r = (m.max - m.min) || 1;
    return (v - m.min) / r;
  };

  const rows = [
    { key: 'mean_duration',    label: 'Trending duration', unit: 'hrs',    icon: <Clock size={12} />,    fmt: (v) => `${v.toFixed(0)} hrs` },
    { key: 'mean_ttt',         label: 'Time-to-trend',     unit: 'hrs',    icon: <Activity size={12} />, fmt: (v) => `${v.toFixed(1)} hrs` },
    { key: 'mean_engagement',  label: 'Engagement depth',  unit: '',       icon: <Target size={12} />,   fmt: (v) => v.toFixed(4) },
    { key: 'mean_views',       label: 'Mean views / video',unit: 'views',  icon: <Layers size={12} />,   fmt: (v) => (v / 1e6).toFixed(2) + 'M' },
  ];

  return (
    <ShortShell
      eyebrow="DBSCAN · 6 ARCHETYPES"
      title={c.label}
      accent={c.color}
      footer={
        <div className="short-archetype-footer">
          <div className="short-distinct">“{c.distinguishing}”</div>
          <div className="short-countries">
            {c.countries.slice(0, 10).map((cc) => <span key={cc} className="short-country-chip">{cc}</span>)}
            {c.countries.length > 10 && <span className="short-country-chip dim">+{c.countries.length - 10}</span>}
          </div>
        </div>
      }
    >
      <div className="short-archetype-tabs">
        {ARCHETYPE_IDS.map((i) => (
          <button
            key={i}
            className={`short-arch-tab ${i === cid ? 'active' : ''}`}
            onClick={() => setCid(i)}
            style={{ borderColor: i === cid ? CLUSTERS[i].color : 'transparent' }}
            title={CLUSTERS[i].label}
          >
            <span className="short-arch-dot" style={{ background: CLUSTERS[i].color }} />
            {CLUSTERS[i].countries.length}
          </button>
        ))}
      </div>

      <div className="short-radar">
        {rows.map((r) => {
          const v = c.profile[r.key];
          const n = norm(r.key, v);
          return (
            <div key={r.key} className="short-metric-row">
              <div className="short-metric-head">
                <span className="short-metric-lab">{r.icon} {r.label}</span>
                <span className="short-metric-val">{r.fmt(v)}</span>
              </div>
              <div className="short-metric-track">
                <div className="short-metric-fill" style={{ width: `${Math.max(4, n * 100)}%`, background: c.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </ShortShell>
  );
}

// ============================================================
// 5. Monthly Trend Churn (entries vs exits, Jul 2022 – Jun 2025)
// ============================================================
export function ChurnShort() {
  const [idx, setIdx] = useState(MONTHLY_CHURN.length - 1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => {
      setIdx((i) => {
        if (i >= MONTHLY_CHURN.length - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 120);
    return () => clearInterval(tick);
  }, [playing]);

  const w = 320, h = 150, pad = { l: 28, r: 10, t: 10, b: 22 };
  const allVals = MONTHLY_CHURN.flatMap((d) => [d.entries, d.exits]);
  const vMin = Math.min(...allVals) * 0.95;
  const vMax = Math.max(...allVals) * 1.05;
  const xScale = (i) => pad.l + (i / (MONTHLY_CHURN.length - 1)) * (w - pad.l - pad.r);
  const yScale = (v) => h - pad.b - ((v - vMin) / (vMax - vMin)) * (h - pad.t - pad.b);

  const ePath = MONTHLY_CHURN.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.entries).toFixed(1)}`).join(' ');
  const xPath = MONTHLY_CHURN.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.exits).toFixed(1)}`).join(' ');

  const cur = MONTHLY_CHURN[idx];
  const net = cur.entries - cur.exits;

  const yearMarks = [0, 6, 12, 18, 24, 30];

  return (
    <ShortShell
      eyebrow="TREND CHURN · 2022 → 2025"
      title="Entries outpace exits every month"
      accent="#4ecdc4"
      footer={
        <div className="short-stat-row">
          <div className="short-stat">
            <div className="short-stat-label"><TrendingUp size={12} /> Entries — {cur.month}</div>
            <div className="short-stat-val">{(cur.entries / 1000).toFixed(1)}<span className="short-stat-unit">K</span></div>
            <div className="short-stat-delta" style={{ color: '#4ecdc4' }}>+{(net / 1000).toFixed(1)}K net</div>
          </div>
          <div className="short-stat">
            <div className="short-stat-label"><TrendingDown size={12} /> Exits</div>
            <div className="short-stat-val">{(cur.exits / 1000).toFixed(1)}<span className="short-stat-unit">K</span></div>
            <div className="short-stat-delta" style={{ color: '#aaa' }}>turnover ratio</div>
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="short-svg">
        <defs>
          <linearGradient id="eFillChurn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yearMarks.map((i) => (
          <line key={i} x1={xScale(i)} x2={xScale(i)} y1={pad.t} y2={h - pad.b}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        <path d={`${ePath} L${xScale(MONTHLY_CHURN.length - 1)},${h - pad.b} L${xScale(0)},${h - pad.b} Z`}
          fill="url(#eFillChurn)" />
        <path d={ePath} stroke="#4ecdc4" strokeWidth="1.8" fill="none" />
        <path d={xPath} stroke="#ff8a8a" strokeWidth="1.8" fill="none" strokeDasharray="3 3" />
        <line x1={xScale(idx)} x2={xScale(idx)} y1={pad.t} y2={h - pad.b}
          stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={xScale(idx)} cy={yScale(cur.entries)} r="3.5" fill="#4ecdc4" />
        <circle cx={xScale(idx)} cy={yScale(cur.exits)} r="3.5" fill="#ff8a8a" />
        {[0, 6, 12, 18, 24, 30].map((i) => (
          <text key={i} x={xScale(i)} y={h - 5} fontSize="8" fill="rgba(255,255,255,0.45)" textAnchor="middle">
            {MONTHLY_CHURN[i]?.month.split('/')[1] ? `'${MONTHLY_CHURN[i].month.split('/')[1]}` : ''}
          </text>
        ))}
        <g fontSize="8" fill="rgba(255,255,255,0.6)">
          <line x1={pad.l} x2={pad.l + 8} y1={12} y2={12} stroke="#4ecdc4" strokeWidth="1.8" />
          <text x={pad.l + 12} y={15}>entries</text>
          <line x1={pad.l + 54} x2={pad.l + 62} y1={12} y2={12} stroke="#ff8a8a" strokeWidth="1.8" strokeDasharray="3 2" />
          <text x={pad.l + 66} y={15}>exits</text>
        </g>
      </svg>

      <div className="short-scrubber">
        <button className="short-play-btn" onClick={() => { if (idx >= MONTHLY_CHURN.length - 1) setIdx(0); setPlaying((p) => !p); }}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <input type="range" min={0} max={MONTHLY_CHURN.length - 1} step={1} value={idx}
          onChange={(e) => { setIdx(Number(e.target.value)); setPlaying(false); }}
          className="short-range" />
        <div className="short-year">{cur.month}</div>
      </div>
    </ShortShell>
  );
}

// ============================================================
// Preview thumbnails for the Home page shorts shelf
// ============================================================
export function ShortPreview({ kind }) {
  if (kind === 'convergence') {
    const pts = CONVERGENCE.entropy_by_year.map((d) => d.entropy);
    const top3 = CONVERGENCE.top3_by_year.map((d) => d.share);
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 30% 20%, #3a1a2e, #05070d)' }}>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="short-preview-svg">
          <polyline points={pts.map((v, i) => `${i * 33 + 5},${55 - (v - 3.11) / 0.04 * 40}`).join(' ')} stroke="#ff8a8a" strokeWidth="2" fill="none" />
          <polyline points={top3.map((v, i) => `${i * 33 + 5},${55 - (v - 0.53) / 0.04 * 40}`).join(' ')} stroke="#ffe66d" strokeWidth="2" fill="none" strokeDasharray="2 2" />
        </svg>
        <div className="short-preview-badge">CONVERGENCE</div>
      </div>
    );
  }
  if (kind === 'survival') {
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 70% 80%, #2a1a05, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          {KM_MEDIAN_DAYS.map((r, i) => {
            const k = Math.log(2) / r.days;
            const pts = Array.from({ length: 20 }).map((_, j) => {
              const t = (j / 19) * 22;
              return `${5 + (t / 22) * 90},${55 - Math.exp(-k * t) * 48}`;
            }).join(' ');
            const colors = ['#8fb8ff', '#54a0ff', '#ff9f43', '#ff6b6b'];
            return <polyline key={r.year} points={pts} stroke={colors[i]} strokeWidth="1.5" fill="none" opacity={0.85} />;
          })}
        </svg>
        <div className="short-preview-badge">KAPLAN-MEIER</div>
      </div>
    );
  }
  if (kind === 'bertopic') {
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 50% 50%, #0a2a28, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          {BERTOPIC.map((r, i) => (
            <g key={r.cat}>
              <rect x="5"  y={5 + i * 10} width={r.noiseBefore * 90} height="5" fill="#ff8a8a" opacity="0.55" />
              <rect x="5"  y={5 + i * 10} width={r.noiseAfter * 90}  height="5" fill="#4ecdc4" />
            </g>
          ))}
        </svg>
        <div className="short-preview-badge">BERTOPIC EVAL</div>
      </div>
    );
  }
  if (kind === 'archetype') {
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 20% 80%, #1a0f2a, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          {ARCHETYPE_IDS.map((i) => {
            const c = CLUSTERS[i];
            const r = 4 + c.countries.length * 0.35;
            const cx = 15 + (i % 3) * 35;
            const cy = 15 + Math.floor(i / 3) * 28;
            return <circle key={i} cx={cx} cy={cy} r={r} fill={c.color} opacity="0.85" />;
          })}
        </svg>
        <div className="short-preview-badge">ARCHETYPES</div>
      </div>
    );
  }
  if (kind === 'churn') {
    const pts = MONTHLY_CHURN.map((d, i) => `${3 + (i / (MONTHLY_CHURN.length - 1)) * 94},${55 - ((d.entries - 60000) / 50000) * 45}`).join(' ');
    const xPts = MONTHLY_CHURN.map((d, i) => `${3 + (i / (MONTHLY_CHURN.length - 1)) * 94},${55 - ((d.exits - 60000) / 50000) * 45}`).join(' ');
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 50% 70%, #0a2020, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          <polyline points={pts} stroke="#4ecdc4" strokeWidth="1.5" fill="none" opacity={0.9} />
          <polyline points={xPts} stroke="#ff8a8a" strokeWidth="1.5" fill="none" opacity={0.9} strokeDasharray="3 2" />
        </svg>
        <div className="short-preview-badge">TREND CHURN</div>
      </div>
    );
  }
  return null;
}
