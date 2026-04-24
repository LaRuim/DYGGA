import { useState, useMemo } from 'react';
import { BERTOPIC_SUBTOPICS } from '../data/mlResults';

const CAT_KEYS = Object.keys(BERTOPIC_SUBTOPICS);
const CAT_LABELS = ['Entertainment', 'Sports', 'Gaming', 'Music', 'People & Blogs'];
const YEARS = [2022, 2023, 2024, 2025];

export function SubtopicsVisualization() {
  const [catIdx, setCatIdx] = useState(2); // Gaming default
  const [hov, setHov] = useState(null);

  const data = BERTOPIC_SUBTOPICS[CAT_KEYS[catIdx]];

  const W = 900, H = 400, pL = 140, pR = 140, pT = 48, pB = 24;
  const MAX_RANK = 10;

  const xAt = (yi) => pL + (yi / (YEARS.length - 1)) * (W - pL - pR);
  const yAt = (r) => pT + ((r - 1) / (MAX_RANK - 1)) * (H - pT - pB);

  const { riserIdx, fallerIdx } = useMemo(() => {
    const deltas = data.ranks.map((rs) => {
      const first = rs.find((r) => r !== null);
      const last = [...rs].reverse().find((r) => r !== null);
      return first !== null && last !== null ? first - last : 0;
    });
    return {
      riserIdx: deltas.indexOf(Math.max(...deltas)),
      fallerIdx: deltas.indexOf(Math.min(...deltas)),
    };
  }, [data]);

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '520px',
      background: 'linear-gradient(160deg, #0a1628 0%, #05070d 100%)',
      display: 'flex', flexDirection: 'column', padding: '20px 16px 12px',
    }}>
      {/* header */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: '#ffe66d', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
          BERTOPIC · RANK MOBILITY 2022 → 2025
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f1f1' }}>
          Which sub-topics rose and fell in the trending ecosystem?
        </div>
      </div>

      {/* category tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {CAT_LABELS.map((label, i) => (
          <button key={label} onClick={() => { setCatIdx(i); setHov(null); }}
            style={{
              background: i === catIdx ? 'rgba(255,230,109,0.12)' : 'transparent',
              border: `1px solid ${i === catIdx ? '#ffe66d' : 'rgba(255,255,255,0.15)'}`,
              color: i === catIdx ? '#ffe66d' : 'rgba(255,255,255,0.6)',
              borderRadius: '999px', padding: '5px 14px', fontSize: '0.8rem',
              cursor: 'pointer', fontWeight: i === catIdx ? 600 : 400,
              transition: 'all 0.2s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* bump chart */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', flex: 1 }}
        onMouseLeave={() => setHov(null)}>

        {/* rank grid lines + labels */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
          <g key={r}>
            <line x1={pL - 8} x2={W - pR + 8} y1={yAt(r)} y2={yAt(r)}
              stroke={r <= 3 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'} strokeWidth="1" />
            <text x={pL - 12} y={yAt(r) + 4} fontSize="10" fill="rgba(255,255,255,0.3)" textAnchor="end">
              #{r}
            </text>
          </g>
        ))}

        {/* year columns */}
        {YEARS.map((yr, yi) => (
          <g key={yr}>
            <line x1={xAt(yi)} x2={xAt(yi)} y1={pT - 10} y2={H - pB}
              stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={xAt(yi)} y={pT - 14} fontSize="12" fill="rgba(255,255,255,0.7)"
              textAnchor="middle" fontWeight="600">{yr}</text>
          </g>
        ))}

        {/* topic lines */}
        {data.topics.map((topic, ti) => {
          const ranks = data.ranks[ti];
          const color = data.colors[ti];
          const isHov = hov === ti;
          const isNotable = ti === riserIdx || ti === fallerIdx;
          const opacity = hov === null ? (isNotable ? 1 : 0.6) : isHov ? 1 : 0.12;
          const sw = isHov ? 3.5 : isNotable ? 2.5 : 1.8;

          const segments = [];
          let seg = [];
          for (let yi = 0; yi < YEARS.length; yi++) {
            if (ranks[yi] !== null) {
              seg.push([xAt(yi), yAt(ranks[yi])]);
            } else if (seg.length > 0) {
              segments.push(seg); seg = [];
            }
          }
          if (seg.length > 0) segments.push(seg);

          return (
            <g key={topic} style={{ cursor: 'default' }}
              onMouseEnter={() => setHov(ti)}>
              {segments.map((s, si) => (
                <polyline key={si}
                  points={s.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                  stroke={color} strokeWidth={sw} fill="none" opacity={opacity}
                  strokeLinejoin="round" style={{ transition: 'opacity 0.15s' }} />
              ))}
              {ranks.map((r, yi) => r !== null && (
                <circle key={yi} cx={xAt(yi)} cy={yAt(r)} r={isHov ? 6 : isNotable ? 5 : 4}
                  fill={color} opacity={opacity} style={{ transition: 'opacity 0.15s' }} />
              ))}
              {/* share % on hover */}
              {isHov && ranks.map((r, yi) => {
                const s = data.shares[ti][yi];
                if (r === null || s === null) return null;
                return (
                  <text key={yi} x={xAt(yi)} y={yAt(r) - 10} fontSize="11"
                    fill={color} textAnchor="middle" fontWeight="bold">{s}%</text>
                );
              })}
            </g>
          );
        })}

        {/* left labels (2022 positions) */}
        {data.topics.map((topic, ti) => {
          const r0 = data.ranks[ti][0];
          if (r0 === null) return null;
          const isHov = hov === ti;
          const isNotable = ti === riserIdx || ti === fallerIdx;
          return (
            <text key={topic} x={pL - 16} y={yAt(r0) + 4.5} fontSize="11.5"
              fill={data.colors[ti]} textAnchor="end"
              fontWeight={isHov || isNotable ? 700 : 400}
              opacity={hov === null ? (isNotable ? 1 : 0.7) : isHov ? 1 : 0.15}
              style={{ transition: 'opacity 0.15s', cursor: 'default' }}
              onMouseEnter={() => setHov(ti)}>
              {topic}
            </text>
          );
        })}

        {/* right labels (2025 positions) */}
        {data.topics.map((topic, ti) => {
          const r3 = data.ranks[ti][3];
          if (r3 === null) return null;
          const isHov = hov === ti;
          const isNotable = ti === riserIdx || ti === fallerIdx;
          return (
            <text key={topic} x={W - pR + 16} y={yAt(r3) + 4.5} fontSize="11.5"
              fill={data.colors[ti]} textAnchor="start"
              fontWeight={isHov || isNotable ? 700 : 400}
              opacity={hov === null ? (isNotable ? 1 : 0.7) : isHov ? 1 : 0.15}
              style={{ transition: 'opacity 0.15s', cursor: 'default' }}
              onMouseEnter={() => setHov(ti)}>
              {topic}
            </text>
          );
        })}

        {/* riser / faller badges */}
        {[
          { idx: riserIdx, label: '▲ biggest riser', yOff: -14 },
          { idx: fallerIdx, label: '▼ biggest faller', yOff: 14 },
        ].map(({ idx, label, yOff }) => {
          const r3 = data.ranks[idx][3];
          if (r3 === null) return null;
          return (
            <text key={label} x={W - pR + 16} y={yAt(r3) + 4.5 + yOff} fontSize="9"
              fill={data.colors[idx]} textAnchor="start" opacity="0.75"
              fontStyle="italic">{label}</text>
          );
        })}
      </svg>

      {/* legend hint */}
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
        Hover any line or label to see % share per year. Bold lines = biggest rank change.
      </div>
    </div>
  );
}
