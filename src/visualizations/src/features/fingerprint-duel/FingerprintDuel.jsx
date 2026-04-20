import { useState, useMemo, useRef, useEffect } from 'react';
import _LottieImport from 'lottie-react';
import perCountryData from '../../data/perCountry.json';

// Vite CJS interop: default export may be wrapped in a namespace object
const Lottie = _LottieImport?.default ?? _LottieImport;
import { COUNTRY_NAME, CLUSTERS } from '../../data/mlResults';
import gaugeAnimation from './gaugeAnimation.json';
import './FingerprintDuel.css';

const CATS = [
  'Autos & Vehicles',
  'Comedy',
  'Education',
  'Entertainment',
  'Film & Animation',
  'Gaming',
  'Howto & Style',
  'Music',
  'News & Politics',
  'People & Blogs',
  'Science & Technology',
  'Sports',
  'Travel & Events',
];

const CAT_LABELS = [
  'Autos', 'Comedy', 'Education', 'Entmt.',
  'Film', 'Gaming', 'Howto', 'Music',
  'News', 'Blogs', 'Science', 'Sports', 'Travel',
];

const COLOR_A = '#22d3ee';
const COLOR_B = '#f472b6';

const ALL_COUNTRIES = Object.keys(perCountryData.countries)
  .sort((a, b) => (COUNTRY_NAME[a] ?? a).localeCompare(COUNTRY_NAME[b] ?? b));

// ── math helpers ──────────────────────────────────────────────────────────────

function cosineSim(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return Math.max(0, Math.min(1, dot / (magA * magB)));
}

function simLabel(s) {
  if (s >= 0.97) return 'Near Identical';
  if (s >= 0.90) return 'Highly Similar';
  if (s >= 0.78) return 'Moderately Similar';
  if (s >= 0.62) return 'Loosely Related';
  return 'Very Different';
}

function simColor(s) {
  if (s >= 0.88) return '#22c55e';
  if (s >= 0.72) return '#eab308';
  return '#ef4444';
}

// ── radar chart ───────────────────────────────────────────────────────────────

const N = CATS.length;
const CX = 150, CY = 155, R = 108;
const axisAngle = (i) => (2 * Math.PI * i / N) - Math.PI / 2;
const axisPt    = (i, v) => ({
  x: CX + v * R * Math.cos(axisAngle(i)),
  y: CY + v * R * Math.sin(axisAngle(i)),
});
const polyStr = (pts) => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

function buildPolygon(shares) {
  return CATS.map((cat, i) => axisPt(i, shares[cat] ?? 0));
}

// ── component ─────────────────────────────────────────────────────────────────

export function FingerprintDuel() {
  const [countryA, setCountryA] = useState('US');
  const [countryB, setCountryB] = useState('GB');
  const lottieRef = useRef(null);

  const dataA = perCountryData.countries[countryA];
  const dataB = perCountryData.countries[countryB];

  const { similarity, ptsA, ptsB } = useMemo(() => {
  // 1. Safety check: Do we even have data?
  if (!dataA || !dataB || !dataA.category_shares || !dataB.category_shares) {
    return { similarity: 0, ptsA: [], ptsB: [] };
  }

  // 2. Extract vectors
  const vecA = CATS.map(c => dataA.category_shares[c] || 0);
  const vecB = CATS.map(c => dataB.category_shares[c] || 0);

  // 3. Scale for visibility (Visual Only)
  const VISUAL_MAX = 3.0; 

  const buildSafePolygon = (shares) => {
    return CATS.map((cat, i) => {
      const rawVal = shares[cat] || 0;
      // Ensure we never pass NaN to the SVG
      const scaledVal = Number.isNaN(rawVal) ? 0 : Math.min(1.1, rawVal * VISUAL_MAX);
      return axisPt(i, scaledVal);
    });
  };

  const sim = cosineSim(vecA, vecB);

  return {
    similarity: Number.isNaN(sim) ? 0 : sim,
    ptsA: buildSafePolygon(dataA.category_shares),
    ptsB: buildSafePolygon(dataB.category_shares),
  };
}, [dataA, dataB]);

  // Scrub Lottie gauge to the similarity frame whenever score changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(Math.round(similarity * 100), true);
    }
  }, [similarity]);

  const clusterLabelFor = (iso) => {
    const d = perCountryData.countries[iso];
    if (!d) return null;
    const cid = d.cluster;
    return CLUSTERS[cid]?.label ?? (cid === -1 ? 'Noise' : `Cluster ${cid}`);
  };

  return (
    <div className="fd-shell">
      <div className="fd-header">
        <div className="fd-eyebrow">Category Attention · 13 Axes</div>
        <div className="fd-title">Attention Fingerprint Duel</div>
        <div className="fd-subtitle">
          Compare how two countries distribute attention across YouTube categories.
        </div>
      </div>

      {/* Country selectors */}
      <div className="fd-selectors">
        <div className="fd-selector-wrap">
          <div className="fd-selector-dot" style={{ background: COLOR_A }} />
          <select
            className="fd-select"
            value={countryA}
            onChange={e => setCountryA(e.target.value)}
            style={{ borderColor: `${COLOR_A}44` }}
          >
            {ALL_COUNTRIES.map(iso => (
              <option key={iso} value={iso}>{COUNTRY_NAME[iso] ?? iso}</option>
            ))}
          </select>
        </div>

        <span className="fd-vs">VS</span>

        <div className="fd-selector-wrap">
          <div className="fd-selector-dot" style={{ background: COLOR_B }} />
          <select
            className="fd-select"
            value={countryB}
            onChange={e => setCountryB(e.target.value)}
            style={{ borderColor: `${COLOR_B}44` }}
          >
            {ALL_COUNTRIES.map(iso => (
              <option key={iso} value={iso}>{COUNTRY_NAME[iso] ?? iso}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="fd-body">
        <div className="fd-chart-row">
          {/* Radar chart */}
          <div className="fd-radar-wrap">
            <svg viewBox="0 0 300 310" className="fd-radar-svg">
              {/* Grid rings at 25 / 50 / 75 / 100% */}
              {[0.25, 0.5, 0.75, 1.0].map(pct => (
                <polygon
                  key={pct}
                  points={polyStr(CATS.map((_, i) => axisPt(i, pct)))}
                  fill="none"
                  stroke={pct === 1.0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth="1"
                />
              ))}

              {/* Axis spokes */}
              {CATS.map((_, i) => {
                const end = axisPt(i, 1);
                return (
                  <line
                    key={i}
                    x1={CX} y1={CY}
                    x2={end.x.toFixed(2)} y2={end.y.toFixed(2)}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Country B polygon (behind) */}
              {ptsB.length > 0 && (
                <polygon
                  points={polyStr(ptsB)}
                  fill={`${COLOR_B}22`}
                  stroke={COLOR_B}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 0 4px ${COLOR_B}66)` }}
                />
              )}

              {/* Country A polygon (front) */}
              {ptsA.length > 0 && (
                <polygon
                  points={polyStr(ptsA)}
                  fill={`${COLOR_A}22`}
                  stroke={COLOR_A}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 0 4px ${COLOR_A}66)` }}
                />
              )}

              {/* Axis labels */}
              {CATS.map((_, i) => {
                const a = axisAngle(i);
                const lx = CX + 125 * Math.cos(a);
                const ly = CY + 125 * Math.sin(a);
                const anchor = Math.abs(Math.cos(a)) < 0.18
                  ? 'middle'
                  : Math.cos(a) > 0 ? 'start' : 'end';
                return (
                  <text
                    key={i}
                    x={lx.toFixed(2)}
                    y={ly.toFixed(2)}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.45)"
                    fontSize="9"
                    fontFamily="Outfit, system-ui, sans-serif"
                  >
                    {CAT_LABELS[i]}
                  </text>
                );
              })}

              <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.15)" />
            </svg>
          </div>

          {/* Similarity meter */}
          <div className="fd-meter-wrap">
            <div className="fd-meter-label">Similarity Score</div>

            <div className="fd-lottie-wrap">
              <Lottie
                lottieRef={lottieRef}
                animationData={gaugeAnimation}
                autoplay={false}
                loop={false}
                className="fd-lottie"
              />
              <div className="fd-score-overlay">
                <span
                  className="fd-score-num"
                  style={{ color: simColor(similarity) }}
                >
                  {(similarity * 100).toFixed(0)}
                </span>
                <span className="fd-score-pct">%</span>
              </div>
            </div>

            <div className="fd-sim-label" style={{ color: simColor(similarity) }}>
              {simLabel(similarity)}
            </div>

            {/* Country chips showing cluster */}
            <div className="fd-chips">
              {[
                { iso: countryA, color: COLOR_A },
                { iso: countryB, color: COLOR_B },
              ].map(({ iso, color }) => (
                <div
                  key={iso}
                  className="fd-chip"
                  style={{ borderColor: `${color}44` }}
                >
                  <span className="fd-chip-dot" style={{ background: color }} />
                  <span>{COUNTRY_NAME[iso] ?? iso}</span>
                  <span className="fd-chip-cluster">{clusterLabelFor(iso)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home grid thumbnail ───────────────────────────────────────────────────────

export function FingerprintDuelPreview() {
  // Static preview using US vs JP polygons
  const dataUS = perCountryData.countries['US'];
  const dataJP = perCountryData.countries['JP'];
  const ptsUS = dataUS ? buildPolygon(dataUS.category_shares) : [];
  const ptsJP = dataJP ? buildPolygon(dataJP.category_shares) : [];

  return (
    <div className="fd-preview-wrap">
      <svg viewBox="0 0 300 310" className="fd-preview-svg" preserveAspectRatio="xMidYMid slice">
        <rect width="300" height="310" fill="#0a0d14" />
        {[0.25, 0.5, 0.75, 1.0].map(pct => (
          <polygon
            key={pct}
            points={polyStr(CATS.map((_, i) => axisPt(i, pct)))}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}
        {CATS.map((_, i) => {
          const end = axisPt(i, 1);
          return (
            <line key={i} x1={CX} y1={CY} x2={end.x.toFixed(2)} y2={end.y.toFixed(2)}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          );
        })}
        {ptsJP.length > 0 && (
          <polygon points={polyStr(ptsJP)} fill={`${COLOR_B}22`} stroke={COLOR_B} strokeWidth="1.5" strokeLinejoin="round" />
        )}
        {ptsUS.length > 0 && (
          <polygon points={polyStr(ptsUS)} fill={`${COLOR_A}22`} stroke={COLOR_A} strokeWidth="1.5" strokeLinejoin="round" />
        )}
        {/* Overlay label */}
        <text x="150" y="272" textAnchor="middle" fill="rgba(255,255,255,0.75)"
          fontSize="14" fontWeight="700" fontFamily="Outfit, system-ui, sans-serif">
          Fingerprint Duel
        </text>
        <text x="150" y="288" textAnchor="middle" fill="rgba(255,255,255,0.35)"
          fontSize="9.5" fontFamily="Outfit, system-ui, sans-serif">
          13-axis category attention · 104 countries
        </text>
      </svg>
    </div>
  );
}
