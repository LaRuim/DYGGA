import { useState, useRef, useEffect } from 'react';
import { MousePointer2 } from 'lucide-react';

/**
 * A fully self-contained component for Interactive Visualizations.
 * Teammates can modify this file directly to add D3.js, WebGL, or Canvas logic 
 * without touching the rest of the application or the Shorts routing layout.
 */
export function InteractiveVisualization({ id }) {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  
  // Isolated mock interactiveness (Pan & Zoom)
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleWheel = (e) => {
    setScale((s) => Math.max(0.5, Math.min(s - e.deltaY * 0.001, 4)));
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  useEffect(() => {
    // Clean up before mounting new one (React StrictMode double invoke guard)
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }

    const loadD3Choropleth = async () => {
      // Dynamically load D3 & TopoJSON from CDNs so we don't need npm installs
      if (!window.d3) {
        await new Promise(r => { const s = document.createElement('script'); s.src = 'https://d3js.org/d3.v7.min.js'; s.onload = r; document.head.appendChild(s); });
      }
      if (!window.topojson) {
        await new Promise(r => { const s = document.createElement('script'); s.src = 'https://unpkg.com/topojson-client@3'; s.onload = r; document.head.appendChild(s); });
      }

      const d3 = window.d3;
      const topojson = window.topojson;

      try {
        // Fetch real world topography data
        const worldData = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const countries = topojson.feature(worldData, worldData.objects.countries).features;
        
        const width = 800;
        const height = 450;

        const svg = d3.select(mountRef.current)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${width} ${height}`);
          
        const projection = d3.geoMercator().scale(130).translate([width / 2, height / 1.5]);
        const path = d3.geoPath().projection(projection);
        
        // Mock data scale
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, countries.length]);
        
        svg.append('g')
          .selectAll('path')
          .data(countries)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', (d, i) => colorScale(i))
          .attr('stroke', 'rgba(255,255,255,0.1)')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.2s')
          .on('mouseover', function() {
            d3.select(this).attr('fill', '#ff4444').attr('stroke-width', 1.5);
          })
          .on('mouseout', function(e, d) {
            const index = countries.indexOf(d);
            d3.select(this).attr('fill', colorScale(index)).attr('stroke-width', 0.5);
          })
          .append('title')
          .text(d => d.properties.name);

        setIsMapLoaded(true);
      } catch (err) {
        console.error("Failed to load D3 map placeholder", err);
      }
    };

    loadD3Choropleth();
  }, [id]);

  return (
    <div 
      className="short-viz-placeholder" 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      style={{ 
        background: `radial-gradient(circle, hsl(${id * 50}, 40%, 25%), hsl(${id * 60}, 60%, 10%))`,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <MousePointer2 size={64} color="rgba(255,255,255,0.4)" style={{ animation: 'bounce 2s infinite', visibility: isMapLoaded ? 'hidden' : 'visible' }} />

        {/* --- INJECT CUSTOM VISUALIZATION HERE --- */}
        <div 
          style={{
            marginTop: '24px',
            width: '90%',
            height: '60%',
            position: 'relative',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            border: '2px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {!isMapLoaded && (
            <div style={{ position: 'absolute', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', zIndex: 5 }}>
              Loading D3 TopoJSON Map...
            </div>
          )}
          
          {/* A pure empty div for D3 to manipulate. React will not add/remove children here. */}
          <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}></div>
        </div>

      </div>
    </div>
  );
}
