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
// 6. World Sync — cosine similarity gauge, 2022 → 2025
// ============================================================
export function WorldSyncShort() {
  const [year, setYear] = useState(2025);
  const [playing, setPlaying] = useState(false);

  const data = CONVERGENCE.similarity_by_year;
  const years = data.map(d => d.year);
  const yearColors = ['#8fb8ff', '#54a0ff', '#ff9f43', '#ff6b6b'];

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => {
      setYear(y => {
        const idx = years.indexOf(y);
        if (idx >= years.length - 1) { setPlaying(false); return y; }
        return years[idx + 1];
      });
    }, 1200);
    return () => clearInterval(tick);
  }, [playing, years]);

  const row = data.find(d => d.year === year);
  const base = data[0].sim;
  const delta = row.sim - base;

  const w = 300, h = 190;
  const gx = w / 2, gy = h / 2;
  const R = 62;

  // angleDeg: degrees clockwise from 12 o'clock
  const toXY = (angleDeg, r) => {
    const a = (angleDeg - 90) * Math.PI / 180;
    return [gx + r * Math.cos(a), gy + r * Math.sin(a)];
  };

  // Gauge opens at the bottom: 225° (lower-left) → 135° (lower-right), clockwise 270°
  const TRACK_START = 225, TRACK_END = 135;
  const ARC_LEN = R * (270 * Math.PI / 180); // ≈ 292

  const arcPath = (r, startDeg, endDeg) => {
    const [sx, sy] = toXY(startDeg, r);
    const [ex, ey] = toXY(endDeg, r);
    const sweep = (endDeg - startDeg + 360) % 360;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  };

  const simMin = 0.848, simMax = 0.869;
  const progress = Math.max(0.01, Math.min(1, (row.sim - simMin) / (simMax - simMin)));

  const interpretation = delta > 0.015 ? 'Strong convergence' : delta > 0.004 ? 'Converging' : delta > 0 ? 'Slight sync' : 'Mild divergence';

  return (
    <ShortShell
      eyebrow="COSINE SIMILARITY · 2022 → 2025"
      title="The world is syncing"
      accent="#54a0ff"
      footer={
        <div className="short-stat-row">
          <div className="short-stat">
            <div className="short-stat-label"><Activity size={12} /> Global similarity</div>
            <div className="short-stat-val">{(row.sim * 100).toFixed(2)}<span className="short-stat-unit">%</span></div>
            <div className="short-stat-delta" style={{ color: delta >= 0 ? '#ff8a8a' : '#4ecdc4' }}>
              {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(2)} pp vs 2022
            </div>
          </div>
          <div className="short-stat">
            <div className="short-stat-label"><TrendingUp size={12} /> Signal</div>
            <div className="short-stat-val" style={{ fontSize: '0.85rem' }}>{interpretation}</div>
            <div className="short-stat-delta" style={{ color: '#aaa' }}>104 countries</div>
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="short-svg">
        {/* Ambient pulse rings */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={gx} cy={gy} r={R * (0.3 + i * 0.2)}
            fill="none" stroke="#54a0ff" strokeWidth="0.8"
            className={`sync-pulse sync-pulse-${i}`}
          />
        ))}

        {/* Track arc (dim) */}
        <path d={arcPath(R, TRACK_START, TRACK_END)}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" strokeLinecap="round" />

        {/* Filled arc — stroke-dashoffset drives the fill animation */}
        <path d={arcPath(R, TRACK_START, TRACK_END)}
          fill="none" stroke="#54a0ff" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={ARC_LEN * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.2,0.8,0.2,1)' }}
        />

        {/* Cluster color dots evenly around the gauge arc */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const angle = TRACK_START + (i / 5) * 270;
          const [dx, dy] = toXY(angle, R + 16);
          return <circle key={i} cx={dx} cy={dy} r={3.5} fill={CLUSTERS[i].color} opacity={0.85} />;
        })}

        {/* Centre value */}
        <text x={gx} y={gy - 8} textAnchor="middle" fontSize="26" fontWeight="bold" fill="#fff">
          {(row.sim * 100).toFixed(2)}%
        </text>
        <text x={gx} y={gy + 10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.45)">
          cosine similarity
        </text>
        <text x={gx} y={gy + 22} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.28)">
          trending-list overlap across 104 countries
        </text>
      </svg>

      <div className="short-year-row">
        {data.map((d, i) => (
          <button key={d.year}
            className={`short-year-pill ${d.year === year ? 'active' : ''}`}
            onClick={() => { setYear(d.year); setPlaying(false); }}
            style={{ borderColor: d.year === year ? yearColors[i] : 'transparent', color: d.year === year ? yearColors[i] : undefined }}
          >
            {d.year}
          </button>
        ))}
      </div>
    </ShortShell>
  );
}

// ============================================================
// 7. Cluster Scatter — TTT vs Duration bubble chart
// ============================================================
const SCATTER_IDS = [0, 1, 2, 3, 4, 5];

export function ClusterScatterShort() {
  const [selected, setSelected] = useState(2); // Western Anglosphere is the standout outlier

  const w = 300, h = 180;
  const pad = { l: 38, r: 14, t: 14, b: 32 };

  const points = SCATTER_IDS.map((i) => ({ id: i, ...CLUSTERS[i] }));

  const tttVals = points.map((p) => p.profile.mean_ttt);
  const durVals = points.map((p) => p.profile.mean_duration);
  const viewVals = points.map((p) => p.profile.mean_views);

  const tttMin = Math.min(...tttVals), tttMax = Math.max(...tttVals);
  const durMin = Math.min(...durVals), durMax = Math.max(...durVals);
  const viewMin = Math.min(...viewVals), viewMax = Math.max(...viewVals);

  const cx = (ttt) => pad.l + ((ttt - tttMin) / (tttMax - tttMin)) * (w - pad.l - pad.r);
  const cy = (dur) => pad.t + (1 - (dur - durMin) / (durMax - durMin)) * (h - pad.t - pad.b);
  const r  = (views) => 6 + ((views - viewMin) / (viewMax - viewMin)) * 10;

  const sel = CLUSTERS[selected];

  // Axis tick values
  const tttTicks = [20, 40, 60];
  const durTicks = [150, 250, 350];

  return (
    <ShortShell
      eyebrow="DBSCAN · TTT vs DURATION"
      title="Where do archetypes sit?"
      accent="#a06cd5"
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: sel.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>{sel.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="short-stat" style={{ flex: 1 }}>
              <div className="short-stat-label"><Clock size={11} /> Time-to-trend</div>
              <div className="short-stat-val" style={{ fontSize: '1rem' }}>{sel.profile.mean_ttt.toFixed(1)} <span className="short-stat-unit">hrs</span></div>
            </div>
            <div className="short-stat" style={{ flex: 1 }}>
              <div className="short-stat-label"><Activity size={11} /> Duration</div>
              <div className="short-stat-val" style={{ fontSize: '1rem' }}>{sel.profile.mean_duration.toFixed(0)} <span className="short-stat-unit">hrs</span></div>
            </div>
            <div className="short-stat" style={{ flex: 1 }}>
              <div className="short-stat-label"><Layers size={11} /> Avg views</div>
              <div className="short-stat-val" style={{ fontSize: '1rem' }}>{(sel.profile.mean_views / 1e6).toFixed(2)}<span className="short-stat-unit">M</span></div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '2px' }}>
            "{sel.distinguishing}"
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="short-svg" style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {tttTicks.map((t) => (
          <line key={t} x1={cx(t)} x2={cx(t)} y1={pad.t} y2={h - pad.b}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        {durTicks.map((d) => (
          <line key={d} x1={pad.l} x2={w - pad.r} y1={cy(d)} y2={cy(d)}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}

        {/* Axis labels */}
        {tttTicks.map((t) => (
          <text key={t} x={cx(t)} y={h - pad.b + 10} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">{t}h</text>
        ))}
        {durTicks.map((d) => (
          <text key={d} x={pad.l - 4} y={cy(d) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end">{d}h</text>
        ))}

        {/* Axis titles */}
        <text x={w / 2} y={h - 2} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">Time-to-trend →</text>
        <text x={6} y={h / 2} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle"
          transform={`rotate(-90, 6, ${h / 2})`}>Duration →</text>

        {/* Bubbles — render selected last so it sits on top */}
        {[...points.filter((p) => p.id !== selected), ...points.filter((p) => p.id === selected)].map((p) => {
          const isSelected = p.id === selected;
          const bx = cx(p.profile.mean_ttt);
          const by = cy(p.profile.mean_duration);
          const br = r(p.profile.mean_views);
          return (
            <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p.id)}>
              {isSelected && (
                <circle cx={bx} cy={by} r={br + 5} fill="none"
                  stroke={p.color} strokeWidth="1.5" opacity="0.5" strokeDasharray="3 2" />
              )}
              <circle cx={bx} cy={by} r={br}
                fill={p.color} opacity={isSelected ? 1 : 0.45}
                style={{ transition: 'r 0.2s, opacity 0.2s' }}
              />
              {isSelected && (
                <text x={bx} y={by - br - 4} fontSize="8" fill={p.color} textAnchor="middle" fontWeight="bold">
                  {p.label.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}

        {/* Bubble size legend */}
        <g>
          <circle cx={w - pad.r - 18} cy={pad.t + 8} r={6} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <circle cx={w - pad.r - 4}  cy={pad.t + 14} r={11} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x={w - pad.r - 30} y={pad.t + 26} fontSize="7" fill="rgba(255,255,255,0.35)" textAnchor="middle">= views</text>
        </g>
      </svg>
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
  if (kind === 'world-sync') {
    const gx = 50, gy = 32, R = 22;
    const toXY = (deg, r) => {
      const a = (deg - 90) * Math.PI / 180;
      return [gx + r * Math.cos(a), gy + r * Math.sin(a)];
    };
    const arcPath = (r, s, e) => {
      const [sx, sy] = toXY(s, r);
      const [ex, ey] = toXY(e, r);
      const sw = (e - s + 360) % 360;
      return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${sw > 180 ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    };
    const ARC_LEN = R * (270 * Math.PI / 180);
    const progress = (0.8669 - 0.848) / (0.869 - 0.848); // peak year (2024)
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 50% 40%, #0a1a3a, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          <path d={arcPath(R, 225, 135)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round" />
          <path d={arcPath(R, 225, 135)} fill="none" stroke="#54a0ff" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={ARC_LEN} strokeDashoffset={ARC_LEN * (1 - progress)} />
          {[0,1,2].map(i => <circle key={i} cx={gx} cy={gy} r={R*(0.3+i*0.2)} fill="none" stroke="#54a0ff" strokeWidth="0.4" opacity={0.15-i*0.04} />)}
          <text x={gx} y={gy+4} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#fff">86.69%</text>
          <text x={50} y={54} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.4)">peak 2024</text>
        </svg>
        <div className="short-preview-badge">GLOBAL SYNC</div>
      </div>
    );
  }
  if (kind === 'cluster-scatter') {
    const ids = [0, 1, 2, 3, 4, 5];
    const tttMin = 16.6, tttMax = 71.8, durMin = 147.8, durMax = 380.2;
    const cx = (ttt) => 8 + ((ttt - tttMin) / (tttMax - tttMin)) * 84;
    const cy = (dur) => 55 - ((dur - durMin) / (durMax - durMin)) * 48;
    return (
      <div className="short-preview" style={{ background: 'radial-gradient(circle at 30% 70%, #1a0f2a, #05070d)' }}>
        <svg viewBox="0 0 100 60" className="short-preview-svg">
          {ids.map((i) => (
            <circle key={i}
              cx={cx(CLUSTERS[i].profile.mean_ttt)}
              cy={cy(CLUSTERS[i].profile.mean_duration)}
              r={3 + (CLUSTERS[i].profile.mean_views / 4361375) * 5}
              fill={CLUSTERS[i].color} opacity="0.85"
            />
          ))}
        </svg>
        <div className="short-preview-badge">CLUSTER MAP</div>
      </div>
    );
  }
  return null;
}
