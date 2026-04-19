import { useEffect, useRef, useState } from 'react';
import { Globe2, Info, Layers, Activity, Clock, Eye, MessageSquare, X, TrendingUp, TrendingDown, Video, Target, Minus } from 'lucide-react';
import {
  CLUSTERS,
  COUNTRY_CLUSTER,
  COUNTRY_NAME,
  NUMERIC_TO_ISO2,
  CONVERGENCE,
  DBSCAN_META,
} from '../data/mlResults';
import perCountryData from '../data/perCountry.json';

const PER_COUNTRY = perCountryData.countries;
const CLUSTER_MEANS = perCountryData.cluster_means;

const CDN_D3 = 'https://d3js.org/d3.v7.min.js';
const CDN_TOPOJSON = 'https://unpkg.com/topojson-client@3';
const CDN_WORLD = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { existing.addEventListener('load', resolve); resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function fmt(n, digits = 0) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Number(n).toFixed(digits);
}

export function WorldMapVisualization() {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selected, setSelected] = useState(null); // { iso2, cluster }
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await loadScript(CDN_D3);
      await loadScript(CDN_TOPOJSON);
      if (cancelled) return;
      const d3 = window.d3;
      const topojson = window.topojson;

      const world = await d3.json(CDN_WORLD);
      if (cancelled) return;
      const countries = topojson.feature(world, world.objects.countries).features;

      const width = 960, height = 520;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

      const projection = d3.geoNaturalEarth1().scale(180).translate([width / 2, height / 2]);
      const path = d3.geoPath().projection(projection);

      const g = svg.append('g');

      // ocean / background
      svg.insert('rect', ':first-child')
        .attr('width', width).attr('height', height)
        .attr('fill', 'url(#ocean-grad)');

      const defs = svg.append('defs');
      const grad = defs.append('linearGradient').attr('id', 'ocean-grad').attr('x2', 0).attr('y2', 1);
      grad.append('stop').attr('offset', '0%').attr('stop-color', '#0a1628');
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#05070d');

      const countryColor = (d) => {
        const iso2 = NUMERIC_TO_ISO2[String(d.id).padStart(3, '0')];
        const cid = COUNTRY_CLUSTER[iso2];
        if (cid === undefined) return '#1a1f2e'; // not in dataset
        return CLUSTERS[cid].color;
      };

      const paths = g.selectAll('path.country')
        .data(countries)
        .join('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', countryColor)
        .attr('stroke', 'rgba(255,255,255,0.15)')
        .attr('stroke-width', 0.5)
        .style('cursor', (d) => {
          const iso2 = NUMERIC_TO_ISO2[String(d.id).padStart(3, '0')];
          return COUNTRY_CLUSTER[iso2] !== undefined ? 'pointer' : 'default';
        })
        .on('mousemove', function (event, d) {
          const iso2 = NUMERIC_TO_ISO2[String(d.id).padStart(3, '0')];
          const cid = COUNTRY_CLUSTER[iso2];
          const name = COUNTRY_NAME[iso2] || d.properties.name || '—';
          const archetype = cid !== undefined ? CLUSTERS[cid].label : 'Not in dataset';
          const tip = tooltipRef.current;
          if (tip && wrapRef.current) {
            const rect = wrapRef.current.getBoundingClientRect();
            tip.style.left = `${event.clientX - rect.left + 14}px`;
            tip.style.top = `${event.clientY - rect.top + 14}px`;
            tip.style.opacity = 1;
            tip.innerHTML = `<strong>${name}</strong><br/><span style="color:${cid !== undefined ? CLUSTERS[cid].color : '#888'}">${archetype}</span>`;
          }
          d3.select(this).attr('stroke-width', 1.4).attr('stroke', '#fff');
          setHovered(iso2);
        })
        .on('mouseout', function () {
          if (tooltipRef.current) tooltipRef.current.style.opacity = 0;
          d3.select(this).attr('stroke-width', 0.5).attr('stroke', 'rgba(255,255,255,0.15)');
          setHovered(null);
        })
        .on('click', function (_event, d) {
          const iso2 = NUMERIC_TO_ISO2[String(d.id).padStart(3, '0')];
          const cid = COUNTRY_CLUSTER[iso2];
          if (cid === undefined) return;
          const pc = PER_COUNTRY[iso2];
          // for noise countries (-1), route archetype context to nearest cluster
          const archetypeCluster = pc && pc.is_noise && pc.nearest_cluster !== undefined ? pc.nearest_cluster : cid;
          setSelected({ iso2, cluster: archetypeCluster });
        });

      // zoom
      const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', (e) => g.attr('transform', e.transform));
      svg.call(zoom);

      setLoading(false);
    };

    run().catch((e) => console.error('world map load failed', e));
    return () => { cancelled = true; };
  }, []);

  const selInfo = selected ? {
    name: COUNTRY_NAME[selected.iso2] || selected.iso2,
    cluster: CLUSTERS[selected.cluster],
    siblings: CLUSTERS[selected.cluster].countries.filter((c) => c !== selected.iso2),
    country: PER_COUNTRY[selected.iso2] || null,
  } : null;

  return (
    <div className="wmap-shell">
      <div className="wmap-header">
        <div className="wmap-title"><Globe2 size={18} /> DBSCAN Attention Archetypes — 104 countries</div>
        <div className="wmap-meta">
          ε = {DBSCAN_META.eps} · min_samples = {DBSCAN_META.min_samples} · {DBSCAN_META.n_clusters} clusters · {DBSCAN_META.n_noise} noise
        </div>
      </div>

      <div className="wmap-main">
        <div className="wmap-canvas" ref={wrapRef}>
          {loading && <div className="wmap-loading">Loading world topology…</div>}
          <svg ref={svgRef} className="wmap-svg" />
          <div ref={tooltipRef} className="wmap-tooltip" />

          <div className="wmap-legend">
            <div className="wmap-legend-title"><Layers size={14} /> Archetypes</div>
            {Object.entries(CLUSTERS).map(([cid, c]) => (
              <button
                key={cid}
                className={`wmap-legend-row ${selected && selected.cluster === Number(cid) ? 'active' : ''}`}
                onClick={() => setSelected({ iso2: c.countries[0], cluster: Number(cid) })}
                title={c.distinguishing}
              >
                <span className="wmap-legend-swatch" style={{ background: c.color }} />
                <span className="wmap-legend-label">{c.label}</span>
                <span className="wmap-legend-count">{c.countries.length}</span>
              </button>
            ))}
          </div>

          <div className="wmap-hint"><Info size={12} /> Scroll to zoom · drag to pan · click a country</div>
        </div>

        <aside className="wmap-panel">
          {selInfo ? (
            <>
              <div className="wmap-panel-head">
                <div>
                  <div className="wmap-panel-country">{selInfo.name} <span className="wmap-panel-iso">{selected.iso2}</span></div>
                  <div className="wmap-panel-arch" style={{ color: selInfo.cluster.color }}>
                    ● {selInfo.cluster.label}
                  </div>
                </div>
                <button className="wmap-close" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>

              <p className="wmap-panel-distinct">{selInfo.cluster.distinguishing}</p>

              {selInfo.country && (
                <div className="wmap-proto-row">
                  <Target size={14} />
                  <span>Prototypicality</span>
                  <div className="wmap-proto-bar">
                    <div className="wmap-proto-fill" style={{ width: `${Math.max(0, Math.min(1, selInfo.country.prototypicality)) * 100}%`, background: selInfo.cluster.color }} />
                  </div>
                  <span className="wmap-proto-val">{(Math.max(0, Math.min(1, selInfo.country.prototypicality)) * 100).toFixed(0)}%</span>
                </div>
              )}
              {selInfo.country && selInfo.country.is_noise && (
                <p className="wmap-noise-note">
                  This country is a <strong>noise point</strong> — DBSCAN didn't assign it to a core cluster.
                  Its nearest archetype is <strong style={{ color: selInfo.cluster.color }}>{selInfo.cluster.label}</strong>
                  {' '}({selInfo.country.centroid_distance.toFixed(2)} σ away in feature space).
                </p>
              )}

              <div className="wmap-section-title">
                {selInfo.country ? `${selInfo.name} — vs archetype average` : 'Archetype profile'}
              </div>
              <div className="wmap-metrics-grid">
                {selInfo.country ? (
                  <>
                    <MetricDelta icon={<Clock size={14} />} label="Trending duration"
                      value={`${selInfo.country.mean_duration.toFixed(0)} hrs`}
                      delta={selInfo.country.mean_duration - (CLUSTER_MEANS[selInfo.country.cluster]?.mean_duration ?? selInfo.country.mean_duration)}
                      unit="hrs" betterLower={false} />
                    <MetricDelta icon={<Activity size={14} />} label="Time-to-trend"
                      value={`${selInfo.country.mean_ttt.toFixed(0)} hrs`}
                      delta={selInfo.country.mean_ttt - (CLUSTER_MEANS[selInfo.country.cluster]?.mean_ttt ?? selInfo.country.mean_ttt)}
                      unit="hrs" betterLower={true} />
                    <MetricDelta icon={<MessageSquare size={14} />} label="Engagement depth"
                      value={selInfo.country.mean_engagement.toFixed(4)}
                      delta={selInfo.country.mean_engagement - (CLUSTER_MEANS[selInfo.country.cluster]?.mean_engagement ?? selInfo.country.mean_engagement)}
                      unit="" betterLower={false} />
                    <MetricDelta icon={<Eye size={14} />} label="Mean views / video"
                      value={fmt(selInfo.country.mean_views)}
                      delta={selInfo.country.mean_views - (CLUSTER_MEANS[selInfo.country.cluster]?.mean_views ?? selInfo.country.mean_views)}
                      unit="" isCount betterLower={false} />
                    <Metric icon={<Video size={14} />} label="Trending videos" value={fmt(selInfo.country.n_videos)} />
                    <Metric icon={<Layers size={14} />} label="Categories seen" value={selInfo.country.n_categories} />
                  </>
                ) : (
                  <>
                    <Metric icon={<Clock size={14} />} label="Mean trending duration" value={`${selInfo.cluster.profile.mean_duration.toFixed(1)} hrs`} />
                    <Metric icon={<Activity size={14} />} label="Time-to-trend" value={`${selInfo.cluster.profile.mean_ttt.toFixed(1)} hrs`} />
                    <Metric icon={<MessageSquare size={14} />} label="Engagement depth" value={selInfo.cluster.profile.mean_engagement.toFixed(4)} />
                    <Metric icon={<Eye size={14} />} label="Mean views / video" value={fmt(selInfo.cluster.profile.mean_views)} />
                    <Metric icon={<Layers size={14} />} label="Distinct categories" value={selInfo.cluster.profile.n_categories.toFixed(1)} />
                    <Metric icon={<Globe2 size={14} />} label="Cluster size" value={`${selInfo.cluster.countries.length} countries`} />
                  </>
                )}
              </div>

              {selInfo.country && selInfo.country.top_categories.length > 0 && (
                <>
                  <div className="wmap-section-title">Top categories in {selInfo.name}</div>
                  <div className="wmap-catbars">
                    {selInfo.country.top_categories.slice(0, 5).map(([cat, share]) => (
                      <div key={cat} className="wmap-catbar">
                        <div className="wmap-catbar-label">
                          <span>{cat}</span>
                          <span className="wmap-catbar-val">{(share * 100).toFixed(1)}%</span>
                        </div>
                        <div className="wmap-catbar-track">
                          <div className="wmap-catbar-fill" style={{ width: `${share * 100 * 2}%`, background: selInfo.cluster.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="wmap-siblings">
                <div className="wmap-section-title">Peer countries in this archetype</div>
                <div className="wmap-sibling-chips">
                  {selInfo.siblings.map((c) => (
                    <button key={c} className="wmap-chip" onClick={() => setSelected({ iso2: c, cluster: selected.cluster })}>
                      {c} <span className="wmap-chip-name">{COUNTRY_NAME[c] || ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="wmap-panel-head">
                <div>
                  <div className="wmap-panel-country">Global view</div>
                  <div className="wmap-panel-arch" style={{ color: '#8fb8ff' }}>Click any country to drill in</div>
                </div>
              </div>

              <p className="wmap-panel-distinct">
                DBSCAN groups the 104 countries into 6 &ldquo;attention archetypes&rdquo; from a 21-feature
                vector: category share + engagement + trending lifecycle. Unclustered countries are
                left as noise.
              </p>

              <div className="wmap-section-title">Platform-level convergence</div>
              <MiniTrend title="Shannon entropy (categories)" data={CONVERGENCE.entropy_by_year.map(d => d.entropy)} years={CONVERGENCE.entropy_by_year.map(d => d.year)} fmt={(v) => v.toFixed(3)} />
              <MiniTrend title="Top-3 category share" data={CONVERGENCE.top3_by_year.map(d => d.share)} years={CONVERGENCE.top3_by_year.map(d => d.year)} fmt={(v) => (v * 100).toFixed(1) + '%'} />
              <MiniTrend title="Cross-country cosine similarity" data={CONVERGENCE.similarity_by_year.map(d => d.sim)} years={CONVERGENCE.similarity_by_year.map(d => d.year)} fmt={(v) => v.toFixed(3)} />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="wmap-metric">
      <div className="wmap-metric-label">{icon} {label}</div>
      <div className="wmap-metric-value">{value}</div>
    </div>
  );
}

function MetricDelta({ icon, label, value, delta, unit, betterLower, isCount }) {
  const threshold = isCount ? Math.abs(delta) / Math.max(1, Math.abs(delta) + Math.abs(value.toString().length ? 1 : 0)) : 0.01;
  const isFlat = Math.abs(delta) < (isCount ? 1 : 0.0005);
  const up = delta > 0;
  const good = isFlat ? null : (betterLower ? !up : up);
  const Icon = isFlat ? Minus : up ? TrendingUp : TrendingDown;
  const color = isFlat ? '#888' : good ? '#4ecdc4' : '#ff8a8a';
  const deltaStr = isFlat ? '≈ peers'
    : (isCount
        ? `${up ? '+' : ''}${fmt(delta)} vs peers`
        : `${up ? '+' : ''}${delta.toFixed(unit === 'hrs' ? 0 : 4)}${unit ? ' ' + unit : ''} vs peers`);
  return (
    <div className="wmap-metric">
      <div className="wmap-metric-label">{icon} {label}</div>
      <div className="wmap-metric-value">{value}</div>
      <div className="wmap-metric-delta" style={{ color }}>
        <Icon size={11} /> {deltaStr}
      </div>
    </div>
  );
}

function MiniTrend({ title, data, years, fmt }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  return (
    <div className="wmap-mini">
      <div className="wmap-mini-title">{title}</div>
      <div className="wmap-mini-bars">
        {data.map((v, i) => (
          <div key={i} className="wmap-mini-col">
            <div className="wmap-mini-bar" style={{ height: `${12 + ((v - min) / range) * 52}px` }} />
            <div className="wmap-mini-year">{years[i]}</div>
            <div className="wmap-mini-val">{fmt(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
