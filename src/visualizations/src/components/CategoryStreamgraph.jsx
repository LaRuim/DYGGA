import { useState, useMemo } from 'react';
import { CATEGORY_STREAM } from '../data/mlResults';

const CATS = ['Entertainment', 'Gaming', 'People & Blogs', 'Sports', 'Music', 'News & Politics', 'Education', 'Comedy'];
const CAT_COLORS = {
  'Entertainment':    '#ff8a8a',
  'Gaming':          '#4ecdc4',
  'People & Blogs':  '#a06cd5',
  'Sports':          '#ff9f43',
  'Music':           '#ffe66d',
  'News & Politics': '#54a0ff',
  'Education':       '#2ecc71',
  'Comedy':          '#fd79a8',
};

export function CategoryStreamgraph() {
  const [highlight, setHighlight] = useState(null);

  const W = 900, H = 420, padL = 42, padR = 16, padT = 20, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = CATEGORY_STREAM.length;

  // Build stacked areas (simple stacking from 0)
  const stacked = useMemo(() => {
    return CATS.map((cat, ci) => {
      return CATEGORY_STREAM.map((row, xi) => {
        const base = CATS.slice(0, ci).reduce((s, c) => s + row[c], 0);
        const top = base + row[cat];
        return { xi, base, top, share: row[cat] };
      });
    });
  }, []);

  const xScale = (xi) => padL + (xi / (n - 1)) * innerW;
  const yScale = (v) => padT + (1 - v) * innerH;

  const buildPath = (points) => {
    const forward = points.map(({ xi, top }) => `${xScale(xi).toFixed(1)},${yScale(top).toFixed(1)}`);
    const backward = [...points].reverse().map(({ xi, base }) => `${xScale(xi).toFixed(1)},${yScale(base).toFixed(1)}`);
    return `M ${forward.join(' L ')} L ${backward.join(' L ')} Z`;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #0a1628 0%, #05070d 100%)', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      <div style={{ fontSize: '0.75rem', color: '#54a0ff', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
        CATEGORY COMPOSITION · QUARTERLY
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f1f1', marginBottom: '12px' }}>
        Entertainment steadily gains share 2022 → 2025
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', flex: 1 }}>
        {/* grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={yScale(v)} y2={yScale(v)}
              stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={padL - 6} y={yScale(v) + 4} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">
              {(v * 100).toFixed(0)}%
            </text>
          </g>
        ))}

        {/* stacked areas */}
        {CATS.map((cat, ci) => (
          <path
            key={cat}
            d={buildPath(stacked[ci])}
            fill={CAT_COLORS[cat]}
            opacity={highlight === null ? 0.82 : highlight === cat ? 0.95 : 0.18}
            style={{ transition: 'opacity 0.25s' }}
            onMouseEnter={() => setHighlight(cat)}
            onMouseLeave={() => setHighlight(null)}
          />
        ))}

        {/* x-axis labels */}
        {CATEGORY_STREAM.map((row, xi) => (
          xi % 2 === 0 && (
            <text key={xi} x={xScale(xi)} y={H - 6} fontSize="10"
              fill="rgba(255,255,255,0.5)" textAnchor="middle">
              {row.period}
            </text>
          )
        ))}

        {/* highlight label */}
        {highlight && (() => {
          const lastRow = stacked[CATS.indexOf(highlight)][n - 1];
          const midY = yScale((lastRow.base + lastRow.top) / 2);
          return (
            <text x={W - padR - 4} y={midY + 4} fontSize="11" fontWeight="bold"
              fill={CAT_COLORS[highlight]} textAnchor="end">
              {highlight}
            </text>
          );
        })()}
      </svg>

      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '8px' }}>
        {CATS.map((cat) => (
          <button
            key={cat}
            onMouseEnter={() => setHighlight(cat)}
            onMouseLeave={() => setHighlight(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              opacity: highlight === null || highlight === cat ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[cat], display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#ccc' }}>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
