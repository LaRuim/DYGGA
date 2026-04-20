import { useState } from 'react';
import perCountryData from '../../data/perCountry.json';
import { CLUSTERS, COUNTRY_NAME } from '../../data/mlResults';
import './TttScatter.css';

const NOISE_COLOR = '#555';

const CLUSTER_SHORT = {
  '-1': 'Noise',
  0: 'Gulf / ME',
  1: 'Latin A (Central)',
  2: 'W. Anglosphere',
  3: 'C/E Europe',
  4: 'Latin A (Andean)',
  5: 'Nordic / Oceania',
};

const ALL_POINTS = Object.entries(perCountryData.countries).map(([iso, d]) => ({
  iso,
  name: COUNTRY_NAME[iso] ?? iso,
  ttt: d.mean_ttt,
  dur: d.mean_duration,
  cluster: d.cluster,
  color: CLUSTERS[d.cluster]?.color ?? NOISE_COLOR,
  clusterLabel: CLUSTER_SHORT[d.cluster] ?? 'Noise',
  engagement: d.mean_engagement,
  views: d.mean_views,
}));

// ── chart geometry ─────────────────────────────────────────────────────────────
const SVG_W = 540, SVG_H = 370;
const ML = 54, MR = 18, MT = 18, MB = 46;
const PW = SVG_W - ML - MR;
const PH = SVG_H - MT - MB;

const TTT_MIN = 5,  TTT_MAX = 115;
const DUR_MIN = 0,  DUR_MAX = 640;

const xS = (v) => ML + ((v - TTT_MIN) / (TTT_MAX - TTT_MIN)) * PW;
const yS = (v) => MT + PH - ((v - DUR_MIN) / (DUR_MAX - DUR_MIN)) * PH;

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

const MED_TTT = median(ALL_POINTS.map(p => p.ttt));
const MED_DUR = median(ALL_POINTS.map(p => p.dur));

const X_TICKS = [10, 20, 40, 60, 80, 100];
const Y_TICKS = [0, 100, 200, 300, 400, 500, 600];

const QUADRANTS = [
  { x: ML + 6,        y: MT + 14,      label: 'Fast trend · Long shelf',  anchor: 'start'  },
  { x: ML + PW - 4,  y: MT + 14,      label: 'Slow trend · Long shelf',  anchor: 'end'    },
  { x: ML + 6,        y: MT + PH - 6,  label: 'Fast trend · Short shelf', anchor: 'start'  },
  { x: ML + PW - 4,  y: MT + PH - 6,  label: 'Slow trend · Short shelf', anchor: 'end'    },
];

// ── main component ─────────────────────────────────────────────────────────────
export function TttScatter() {
  const [tooltip, setTooltip] = useState(null); // { point, x, y } px relative to wrapper
  const [activeCluster, setActiveCluster] = useState(null);

  const handleEnter = (e, point) => {
    const rect = e.currentTarget.closest('.tts-chart-wrap').getBoundingClientRect();
    setTooltip({ point, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleLeave = () => setTooltip(null);
  const handleMove  = (e) => {
    if (!tooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
  };

  const dimmed = (p) => activeCluster !== null && p.cluster !== activeCluster;

  // noise behind, clusters on top
  const noisePoints   = ALL_POINTS.filter(p => p.cluster === -1);
  const clusterPoints = ALL_POINTS.filter(p => p.cluster !== -1);

  return (
    <div className="tts-shell">
      <div className="tts-header">
        <div className="tts-eyebrow">DBSCAN · 104 countries · 2022–2025</div>
        <div className="tts-title">Time-to-Trend vs Trending Duration</div>
        <div className="tts-subtitle">
          How fast does a video reach peak attention — and how long does it stay there? Click a cluster to highlight.
        </div>
      </div>

      <div className="tts-body">
        <div className="tts-chart-wrap" onMouseMove={handleMove}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="tts-svg">
            {/* Background */}
            <rect width={SVG_W} height={SVG_H} fill="#0a0d14" />

            {/* Grid */}
            {X_TICKS.map(t => (
              <line key={`xg${t}`} x1={xS(t)} y1={MT} x2={xS(t)} y2={MT + PH}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}
            {Y_TICKS.map(t => (
              <line key={`yg${t}`} x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}

            {/* Median quadrant lines */}
            <line x1={xS(MED_TTT)} y1={MT} x2={xS(MED_TTT)} y2={MT + PH}
              stroke="rgba(255,255,255,0.13)" strokeWidth="1" strokeDasharray="5,3" />
            <line x1={ML} y1={yS(MED_DUR)} x2={ML + PW} y2={yS(MED_DUR)}
              stroke="rgba(255,255,255,0.13)" strokeWidth="1" strokeDasharray="5,3" />

            {/* Quadrant labels */}
            {QUADRANTS.map((q, i) => (
              <text key={i} x={q.x} y={q.y} textAnchor={q.anchor}
                fill="rgba(255,255,255,0.13)" fontSize="8"
                fontFamily="Outfit, system-ui, sans-serif">{q.label}</text>
            ))}

            {/* Axes */}
            <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1={ML} y1={MT} x2={ML} y2={MT + PH}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

            {/* X ticks */}
            {X_TICKS.map(t => (
              <g key={`xt${t}`}>
                <line x1={xS(t)} y1={MT + PH} x2={xS(t)} y2={MT + PH + 4}
                  stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                <text x={xS(t)} y={MT + PH + 14} textAnchor="middle"
                  fill="rgba(255,255,255,0.38)" fontSize="9"
                  fontFamily="Outfit, system-ui, sans-serif">{t}</text>
              </g>
            ))}

            {/* Y ticks */}
            {Y_TICKS.map(t => (
              <g key={`yt${t}`}>
                <line x1={ML - 4} y1={yS(t)} x2={ML} y2={yS(t)}
                  stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                <text x={ML - 7} y={yS(t)} textAnchor="end" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.38)" fontSize="9"
                  fontFamily="Outfit, system-ui, sans-serif">{t}</text>
              </g>
            ))}

            {/* Axis labels */}
            <text x={ML + PW / 2} y={SVG_H - 4} textAnchor="middle"
              fill="rgba(255,255,255,0.32)" fontSize="10"
              fontFamily="Outfit, system-ui, sans-serif">
              Time-to-Trend (hrs)
            </text>
            <text x={13} y={MT + PH / 2} textAnchor="middle"
              fill="rgba(255,255,255,0.32)" fontSize="10"
              fontFamily="Outfit, system-ui, sans-serif"
              transform={`rotate(-90, 13, ${MT + PH / 2})`}>
              Trending Duration (hrs)
            </text>

            {/* Median value labels */}
            <text x={xS(MED_TTT) + 3} y={MT + PH + 26} textAnchor="middle"
              fill="rgba(255,255,255,0.22)" fontSize="8"
              fontFamily="Outfit, system-ui, sans-serif">
              median {MED_TTT.toFixed(0)}h
            </text>
            <text x={ML + PW - 2} y={yS(MED_DUR) - 4} textAnchor="end"
              fill="rgba(255,255,255,0.22)" fontSize="8"
              fontFamily="Outfit, system-ui, sans-serif">
              median {MED_DUR.toFixed(0)}h
            </text>

            {/* Noise points (behind) */}
            {noisePoints.map(p => (
              <circle key={p.iso}
                cx={xS(p.ttt)} cy={yS(p.dur)} r={3.5}
                fill={p.color}
                opacity={dimmed(p) ? 0.1 : 0.42}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => handleEnter(e, p)}
                onMouseLeave={handleLeave}
              />
            ))}

            {/* Cluster points (front) */}
            {clusterPoints.map(p => (
              <circle key={p.iso}
                cx={xS(p.ttt)} cy={yS(p.dur)}
                r={tooltip?.point.iso === p.iso ? 7 : 5}
                fill={p.color}
                opacity={dimmed(p) ? 0.12 : 0.9}
                stroke={tooltip?.point.iso === p.iso ? '#fff' : 'none'}
                strokeWidth="1.5"
                style={{ cursor: 'pointer', transition: 'r 0.1s, opacity 0.2s' }}
                onMouseEnter={e => handleEnter(e, p)}
                onMouseLeave={handleLeave}
              />
            ))}

            {/* Country label on hover */}
            {tooltip && (
              <text
                x={Math.min(xS(tooltip.point.ttt) + 9, ML + PW - 70)}
                y={Math.max(yS(tooltip.point.dur) - 9, MT + 12)}
                fill="#fff" fontSize="9.5" fontWeight="600"
                fontFamily="Outfit, system-ui, sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {tooltip.point.name}
              </text>
            )}
          </svg>

          {/* Floating tooltip */}
          {tooltip && (
            <div
              className="tts-tooltip"
              style={{
                left: tooltip.x + 14,
                top:  tooltip.y - 10,
              }}
            >
              <div className="tts-tt-name">
                {tooltip.point.name}
                <span className="tts-tt-dot" style={{ background: tooltip.point.color }} />
              </div>
              <div className="tts-tt-cluster">{tooltip.point.clusterLabel}</div>
              <div className="tts-tt-divider" />
              <div className="tts-tt-row"><span>Time-to-Trend</span><span>{tooltip.point.ttt.toFixed(1)} hrs</span></div>
              <div className="tts-tt-row"><span>Trending Duration</span><span>{tooltip.point.dur.toFixed(0)} hrs</span></div>
              <div className="tts-tt-row"><span>Mean Views</span><span>{(tooltip.point.views / 1e6).toFixed(2)}M</span></div>
              <div className="tts-tt-row"><span>Engagement</span><span>{(tooltip.point.engagement * 100).toFixed(2)}%</span></div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="tts-legend">
          {Object.entries(CLUSTERS).map(([cid, info]) => {
            const cnum = Number(cid);
            return (
              <button
                key={cid}
                className={`tts-legend-btn ${activeCluster === cnum ? 'active' : ''}`}
                onClick={() => setActiveCluster(activeCluster === cnum ? null : cnum)}
              >
                <span className="tts-legend-dot" style={{ background: info.color }} />
                <span>{CLUSTER_SHORT[cid] ?? info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Home grid thumbnail ───────────────────────────────────────────────────────
export function TttScatterPreview() {
  return (
    <div className="tts-preview-wrap">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="tts-preview-svg" preserveAspectRatio="xMidYMid slice">
        <rect width={SVG_W} height={SVG_H} fill="#0a0d14" />
        {X_TICKS.map(t => (
          <line key={t} x1={xS(t)} y1={MT} x2={xS(t)} y2={MT + PH}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {Y_TICKS.map(t => (
          <line key={t} x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH}
          stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH}
          stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <line x1={xS(MED_TTT)} y1={MT} x2={xS(MED_TTT)} y2={MT + PH}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />
        <line x1={ML} y1={yS(MED_DUR)} x2={ML + PW} y2={yS(MED_DUR)}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />
        {ALL_POINTS.map(p => (
          <circle key={p.iso}
            cx={xS(p.ttt)} cy={yS(p.dur)}
            r={p.cluster === -1 ? 3 : 4.5}
            fill={p.color}
            opacity={p.cluster === -1 ? 0.38 : 0.88}
          />
        ))}
        <text x={SVG_W / 2} y={SVG_H - 22} textAnchor="middle"
          fill="rgba(255,255,255,0.28)" fontSize="8.5"
          fontFamily="Outfit, system-ui, sans-serif">
          104 countries · 6 DBSCAN clusters
        </text>
        <text x={SVG_W / 2} y={SVG_H - 7} textAnchor="middle"
          fill="rgba(255,255,255,0.65)" fontSize="13" fontWeight="700"
          fontFamily="Outfit, system-ui, sans-serif">
          TTT vs Duration Scatter
        </text>
      </svg>
    </div>
  );
}
