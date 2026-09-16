'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Globe, Layers, ZoomIn, ZoomOut, RotateCcw, Sparkles, MapPin, Compass } from 'lucide-react';

// HIGH-FIDELITY WORLD CONTINENT POLYGONS (Latitude, Longitude in degrees)
const CONTINENT_POLYGONS = [
  // 1. AFRICA
  {
    id: 'africa',
    name: 'Africa',
    coords: [
      [35.8, -5.6], [36.9, 3.8], [37.3, 9.8], [33.5, 11.2], [32.0, 15.2], [32.9, 20.0],
      [31.6, 25.0], [31.3, 34.2], [27.8, 34.5], [22.0, 36.8], [15.6, 39.5], [11.8, 43.3],
      [11.8, 51.2], [9.5, 50.8], [2.0, 45.3], [-4.7, 39.3], [-11.0, 40.5], [-16.0, 39.8],
      [-25.0, 33.0], [-28.5, 32.3], [-33.0, 27.8], [-34.8, 20.0], [-34.4, 18.5], [-31.0, 17.8],
      [-22.6, 14.5], [-16.5, 11.8], [-6.0, 12.3], [-1.0, 9.2], [4.5, 8.5], [6.3, 2.5],
      [4.8, -1.8], [4.3, -7.5], [6.8, -11.5], [11.8, -15.5], [14.8, -17.2], [20.8, -17.0],
      [28.0, -12.5], [30.5, -9.8], [35.8, -5.6]
    ]
  },
  // 2. MADAGASCAR
  {
    id: 'madagascar',
    name: 'Madagascar',
    coords: [
      [-12.0, 49.3], [-15.5, 50.5], [-20.5, 48.5], [-25.2, 47.0],
      [-25.5, 45.0], [-22.0, 43.3], [-16.0, 44.5], [-12.0, 49.3]
    ]
  },
  // 3. EUROPE
  {
    id: 'europe',
    name: 'Europe',
    coords: [
      [36.0, -5.5], [43.5, -9.0], [43.8, -1.8], [48.0, -4.7], [49.7, -1.5],
      [51.0, 2.5], [53.5, 7.0], [55.0, 8.5], [57.5, 10.5], [55.5, 12.8],
      [54.5, 18.5], [59.0, 26.0], [60.5, 29.0], [69.0, 31.0], [70.5, 28.0],
      [71.2, 25.8], [68.0, 14.0], [62.0, 5.0], [58.0, 7.0], [54.0, 9.0],
      [52.0, 14.0], [48.0, 17.0], [45.5, 13.5], [41.0, 15.0], [38.0, 15.5],
      [36.5, 14.8], [40.0, 18.5], [38.0, 23.5], [36.5, 22.5], [40.5, 23.0],
      [41.0, 29.0], [44.0, 28.5], [46.5, 31.0], [45.0, 36.5], [47.0, 39.0],
      [50.0, 37.0], [55.0, 37.5], [60.0, 50.0], [65.0, 60.0], [55.0, 55.0],
      [50.0, 48.0], [45.0, 40.0], [42.0, 28.0], [41.0, 20.0], [44.0, 15.0],
      [43.5, 7.5], [41.5, 2.5], [36.7, -2.0], [36.0, -5.5]
    ]
  },
  // 4. BRITISH ISLES
  {
    id: 'uk',
    name: 'UK & Ireland',
    coords: [
      [50.0, -5.2], [51.5, 1.4], [53.5, 0.0], [56.0, -2.5], [58.5, -3.0],
      [58.5, -5.0], [55.5, -5.5], [53.5, -4.5], [51.5, -4.5], [50.0, -5.2]
    ]
  },
  {
    id: 'ireland',
    name: 'Ireland',
    coords: [
      [51.5, -9.8], [52.5, -6.2], [54.5, -5.8], [55.3, -7.5], [54.0, -10.0], [51.5, -9.8]
    ]
  },
  // 5. ARABIAN PENINSULA & MIDDLE EAST
  {
    id: 'arabia',
    name: 'Arabian Peninsula',
    coords: [
      [31.3, 34.2], [29.5, 35.0], [27.8, 35.5], [22.0, 39.0], [16.5, 42.0],
      [12.8, 43.5], [12.6, 45.0], [14.5, 50.0], [16.8, 54.0], [22.5, 59.8],
      [26.0, 56.5], [24.5, 54.5], [26.0, 50.5], [29.0, 48.5], [30.0, 48.0],
      [31.0, 47.5], [33.5, 36.0], [31.3, 34.2]
    ]
  },
  // 6. ASIA & SIBERIA
  {
    id: 'asia',
    name: 'Asia',
    coords: [
      [36.0, 36.0], [41.0, 29.0], [42.0, 35.0], [41.5, 41.5], [38.5, 48.5],
      [36.5, 53.0], [37.0, 59.0], [25.0, 62.0], [24.0, 67.5], [20.5, 72.8],
      [15.5, 73.8], [8.0, 77.5], [11.0, 79.8], [16.0, 81.0], [21.5, 87.0],
      [22.0, 91.5], [16.0, 94.5], [10.0, 98.5], [1.5, 104.0], [6.5, 102.0],
      [10.5, 104.0], [10.5, 108.0], [16.0, 108.5], [21.5, 108.0], [22.5, 114.0],
      [24.5, 118.5], [30.0, 122.0], [35.0, 119.5], [37.5, 126.5], [40.0, 124.5],
      [38.5, 128.5], [43.0, 132.0], [47.0, 139.0], [53.0, 141.0], [59.5, 150.0],
      [56.0, 156.0], [51.0, 157.0], [56.0, 163.0], [65.0, 175.0], [66.0, -170.0],
      [71.0, -179.0], [73.0, 140.0], [76.0, 110.0], [77.0, 105.0], [73.0, 80.0],
      [71.0, 65.0], [68.0, 50.0], [60.0, 50.0], [55.0, 55.0], [50.0, 48.0],
      [42.0, 45.0], [38.0, 44.0], [36.0, 36.0]
    ]
  },
  // 7. JAPAN
  {
    id: 'japan',
    name: 'Japan',
    coords: [
      [31.0, 130.5], [33.5, 133.5], [35.5, 136.0], [38.0, 141.0], [41.5, 141.5],
      [45.5, 142.0], [43.0, 145.5], [42.0, 141.0], [36.0, 136.0], [34.0, 131.0],
      [31.0, 130.5]
    ]
  },
  // 8. NORTH AMERICA
  {
    id: 'north_america',
    name: 'North America',
    coords: [
      [7.5, -77.5], [9.0, -83.0], [13.5, -87.5], [16.0, -93.0], [19.0, -96.0],
      [22.0, -97.5], [26.0, -97.0], [29.0, -95.0], [29.5, -89.0], [30.0, -84.0],
      [25.0, -80.5], [31.0, -81.5], [35.5, -75.5], [40.5, -74.0], [44.5, -67.0],
      [47.5, -53.0], [51.5, -56.0], [58.5, -62.5], [60.0, -65.0], [58.0, -78.0],
      [51.5, -80.0], [55.0, -90.0], [62.0, -93.0], [68.0, -85.0], [70.0, -95.0],
      [71.5, -125.0], [70.0, -145.0], [71.5, -156.5], [65.5, -168.0], [59.0, -162.0],
      [55.0, -163.0], [57.0, -154.0], [60.0, -140.0], [54.0, -133.0], [49.0, -125.0],
      [42.0, -124.5], [34.0, -120.0], [32.5, -117.0], [23.0, -110.0], [28.0, -112.0],
      [31.5, -114.5], [23.0, -106.0], [16.0, -98.0], [14.5, -92.5], [7.5, -77.5]
    ]
  },
  // 9. GREENLAND
  {
    id: 'greenland',
    name: 'Greenland',
    coords: [
      [60.0, -44.0], [65.0, -40.0], [70.0, -22.0], [76.0, -20.0], [82.0, -30.0],
      [83.5, -35.0], [80.0, -65.0], [76.0, -68.0], [68.0, -53.0], [60.0, -44.0]
    ]
  },
  // 10. SOUTH AMERICA
  {
    id: 'south_america',
    name: 'South America',
    coords: [
      [12.0, -72.0], [10.5, -62.0], [8.5, -59.5], [4.5, -51.5], [0.0, -50.0],
      [-2.5, -44.0], [-5.0, -35.0], [-13.0, -38.5], [-23.0, -43.0], [-28.0, -48.5],
      [-34.5, -53.5], [-38.0, -57.5], [-45.0, -66.0], [-52.5, -68.0], [-55.0, -66.0],
      [-53.5, -74.0], [-45.0, -74.5], [-35.0, -72.5], [-20.0, -70.0], [-14.0, -76.0],
      [-5.0, -81.0], [1.0, -79.5], [8.0, -77.5], [11.5, -75.0], [12.0, -72.0]
    ]
  },
  // 11. AUSTRALIA
  {
    id: 'australia',
    name: 'Australia',
    coords: [
      [-12.0, 132.0], [-12.0, 136.0], [-16.0, 136.0], [-14.0, 142.0], [-10.5, 142.5],
      [-17.0, 146.0], [-23.0, 151.0], [-28.0, 153.5], [-34.0, 151.0], [-37.5, 150.0],
      [-39.0, 146.5], [-38.0, 141.0], [-35.5, 136.0], [-32.0, 132.0], [-32.0, 125.0],
      [-35.0, 117.0], [-31.5, 115.5], [-25.0, 113.5], [-20.0, 119.0], [-16.5, 123.0],
      [-14.0, 127.0], [-12.0, 132.0]
    ]
  },
  // 12. NEW ZEALAND
  {
    id: 'new_zealand',
    name: 'New Zealand',
    coords: [
      [-35.0, 173.0], [-37.5, 178.0], [-41.5, 175.5], [-41.0, 172.5], [-43.5, 170.0],
      [-46.5, 168.0], [-46.0, 166.5], [-43.0, 169.5], [-40.5, 173.5], [-35.0, 173.0]
    ]
  },
  // 13. EGYPT (Highlighted active territory)
  {
    id: 'egypt',
    name: 'Egypt',
    coords: [
      [31.6, 25.0], [31.5, 34.2], [27.8, 34.5], [22.0, 36.8],
      [22.0, 25.0], [31.6, 25.0]
    ]
  }
];

export default function Globe3DCanvas({
  isRtl = false,
  countries = [],
  highlightedCountry = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'hologram'
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const activeCountry = highlightedCountry || (countries.length > 0 ? countries[0] : null);

  // Initial camera orientation facing Egypt / Middle East / North Africa
  const [rotation, setRotation] = useState({ y: 0.95, x: 0.25 });
  const rotRef = useRef({ y: 0.95, x: 0.25 });
  rotRef.current = rotation;
  const zoomRef = useRef(1.0);
  zoomRef.current = zoom;

  const resetCamera = () => {
    setRotation({ y: 0.95, x: 0.25 });
    setZoom(1.0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let autoRotateAngle = 0;

    // Background cosmic stars
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 560,
      y: Math.random() * 340,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.15 + 0.05,
      alpha: Math.random() * 0.5 + 0.3
    }));

    let pulseTime = 0;

    // 3D Spherical Coordinate Projection Helper
    const project3D = (latDeg, lonDeg, rotY, rotX, cx, cy, radius) => {
      const latRad = (latDeg * Math.PI) / 180;
      const lonRad = (lonDeg * Math.PI) / 180;

      const y0 = Math.sin(latRad);
      const r0 = Math.cos(latRad);
      const x0 = Math.cos(lonRad) * r0;
      const z0 = Math.sin(lonRad) * r0;

      // Rotate Y (Longitude)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;

      // Rotate X (Latitude tilt)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      return {
        x2D: cx + x1 * radius,
        y2D: cy - y2 * radius, // Invert Y for canvas coordinate system
        z: z2,
        isFront: z2 > 0
      };
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const currentZoom = zoomRef.current;
      const globeRadius = Math.min(width, height) * 0.39 * currentZoom;

      pulseTime += 0.035;

      // 1. Draw Space Stars
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        ctx.fillStyle = `rgba(147, 197, 253, ${s.alpha * (0.6 + Math.sin(pulseTime + s.x) * 0.4)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!isDragging) {
        autoRotateAngle += 0.0022;
      }

      const rotY = rotRef.current.y + (isDragging ? 0 : autoRotateAngle);
      const rotX = rotRef.current.x;

      if (viewMode === 'globe') {
        /* ================= 3D VECTOR CONTINENT GLOBE ================= */

        // 1. Radial Atmosphere Outer Glow
        const bgGlow = ctx.createRadialGradient(cx, cy, globeRadius * 0.5, cx, cy, globeRadius * 1.35);
        bgGlow.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
        bgGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
        bgGlow.addColorStop(0.8, 'rgba(30, 64, 175, 0.04)');
        bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // 2. Base Dark Oceanic Globe Sphere
        const oceanGrad = ctx.createRadialGradient(
          cx - globeRadius * 0.35,
          cy - globeRadius * 0.35,
          globeRadius * 0.05,
          cx,
          cy,
          globeRadius
        );
        oceanGrad.addColorStop(0, '#1e293b');
        oceanGrad.addColorStop(0.4, '#0f172a');
        oceanGrad.addColorStop(0.85, '#070f1e');
        oceanGrad.addColorStop(1, '#020617');

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
        ctx.clip(); // Clip all continents inside the globe disk

        ctx.fillStyle = oceanGrad;
        ctx.fill();

        // 3. Spherical Graticule Grid Lines (Curved Equator and Latitudes)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
        ctx.lineWidth = 1;

        // Latitude circles (-60, -30, 0, 30, 60)
        [-60, -30, 0, 30, 60].forEach(lat => {
          ctx.beginPath();
          let first = true;
          for (let lon = -180; lon <= 180; lon += 5) {
            const p = project3D(lat, lon, rotY, rotX, cx, cy, globeRadius);
            if (p.isFront) {
              if (first) { ctx.moveTo(p.x2D, p.y2D); first = false; }
              else { ctx.lineTo(p.x2D, p.y2D); }
            } else {
              first = true;
            }
          }
          ctx.stroke();
        });

        // Longitude meridians (every 30 degrees)
        for (let lon = -180; lon < 180; lon += 30) {
          ctx.beginPath();
          let first = true;
          for (let lat = -90; lat <= 90; lat += 5) {
            const p = project3D(lat, lon, rotY, rotX, cx, cy, globeRadius);
            if (p.isFront) {
              if (first) { ctx.moveTo(p.x2D, p.y2D); first = false; }
              else { ctx.lineTo(p.x2D, p.y2D); }
            } else {
              first = true;
            }
          }
          ctx.stroke();
        }

        // 4. DRAW CLEAR CONTINENTAL VECTOR POLYGONS
        CONTINENT_POLYGONS.forEach(cont => {
          // If this is Egypt, we give it a vibrant glowing highlight
          const isEgypt = cont.id === 'egypt';
          
          ctx.beginPath();
          let hasFrontPoints = false;
          let first = true;

          cont.coords.forEach(([lat, lon]) => {
            const p = project3D(lat, lon, rotY, rotX, cx, cy, globeRadius);
            if (p.isFront) {
              hasFrontPoints = true;
              if (first) {
                ctx.moveTo(p.x2D, p.y2D);
                first = false;
              } else {
                ctx.lineTo(p.x2D, p.y2D);
              }
            }
          });

          if (hasFrontPoints) {
            ctx.closePath();

            // Continental Fill
            if (isEgypt) {
              ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
              ctx.shadowColor = '#3b82f6';
              ctx.shadowBlur = 12;
            } else {
              ctx.fillStyle = 'rgba(30, 58, 138, 0.65)';
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
            ctx.fill();

            // Bright Coastline Outline
            ctx.strokeStyle = isEgypt ? '#93c5fd' : 'rgba(96, 165, 250, 0.85)';
            ctx.lineWidth = isEgypt ? 2.2 : 1.4;
            ctx.stroke();
          }
        });

        // 5. Specular Lighting / Rim Reflection
        const specularGrad = ctx.createLinearGradient(cx - globeRadius, cy - globeRadius, cx + globeRadius, cy + globeRadius);
        specularGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        specularGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.05)');
        specularGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = specularGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // End clipping

        // 6. Glowing Outer Rim Border
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 7. ACTIVE VISITOR BEACON (Egypt or Top Country)
        if (activeCountry) {
          const lat = typeof activeCountry.lat === 'number' ? activeCountry.lat : 26.8;
          const lon = typeof activeCountry.lon === 'number' ? activeCountry.lon : 30.8;

          const p = project3D(lat, lon, rotY, rotX, cx, cy, globeRadius);

          if (p.isFront) {
            const depthAlpha = Math.max(0.4, (p.z + 0.1) / 1.1);

            // Radar Ripple Rings
            const ring1 = 12 + Math.sin(pulseTime * 2.5) * 8;
            const ring2 = 22 + Math.sin(pulseTime * 2.5 + 1.2) * 10;

            ctx.strokeStyle = `rgba(59, 130, 246, ${depthAlpha * (0.85 - (ring1 / 32))})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x2D, p.y2D, ring1, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(147, 197, 253, ${depthAlpha * (0.6 - (ring2 / 42))})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(p.x2D, p.y2D, ring2, 0, Math.PI * 2);
            ctx.stroke();

            // 3D Laser Beam
            const beamHeight = 46 * depthAlpha;
            const beamGrad = ctx.createLinearGradient(p.x2D, p.y2D, p.x2D, p.y2D - beamHeight);
            beamGrad.addColorStop(0, `rgba(96, 165, 250, ${depthAlpha})`);
            beamGrad.addColorStop(0.7, `rgba(59, 130, 246, ${depthAlpha * 0.6})`);
            beamGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p.x2D, p.y2D);
            ctx.lineTo(p.x2D, p.y2D - beamHeight);
            ctx.stroke();

            // Core Solid Pin
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(p.x2D, p.y2D, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x2D, p.y2D, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Floating 3D Badge Tag
            const labelX = p.x2D;
            const labelY = p.y2D - beamHeight - 14;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;

            const flagStr = activeCountry.flag || '🇪🇬';
            const nameStr = activeCountry.name || 'Egypt';
            const countStr = `${activeCountry.count || 1} (${activeCountry.pct || '100%'})`;
            const labelText = `${flagStr} ${nameStr} • ${countStr}`;

            ctx.font = 'bold 11px Inter, system-ui, sans-serif';
            const textWidth = ctx.measureText(labelText).width;
            const boxW = Math.max(110, textWidth + 24);
            const boxH = 26;

            ctx.beginPath();
            ctx.roundRect(labelX - boxW / 2, labelY - boxH / 2, boxW, boxH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, labelX, labelY);
          }
        }

      } else {
        /* ================= 3D ISOMETRIC HOLOGRAPHIC PROJECTION ================= */

        const gridW = width * 0.86;
        const gridH = height * 0.64;
        const startX = (width - gridW) / 2;
        const startY = (height - gridH) / 2 + 18;

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.22)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
          const y = startY + (gridH / 10) * i;
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(startX + gridW, y);
          ctx.stroke();
        }

        for (let i = 0; i <= 14; i++) {
          const x = startX + (gridW / 14) * i;
          ctx.beginPath();
          ctx.moveTo(x, startY);
          ctx.lineTo(x, startY + gridH);
          ctx.stroke();
        }

        // Radar Scanning Laser
        const laserY = startY + ((Math.sin(pulseTime) + 1) / 2) * gridH;
        const laserGrad = ctx.createLinearGradient(startX, laserY, startX + gridW, laserY);
        laserGrad.addColorStop(0, 'rgba(59, 130, 246, 0)');
        laserGrad.addColorStop(0.5, 'rgba(96, 165, 250, 0.85)');
        laserGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX, laserY);
        ctx.lineTo(startX + gridW, laserY);
        ctx.stroke();

        // 2D Vector Map projection on the platform
        CONTINENT_POLYGONS.forEach(cont => {
          ctx.beginPath();
          let first = true;
          cont.coords.forEach(([lat, lon]) => {
            const x = startX + ((lon + 180) / 360) * gridW;
            const y = startY + ((90 - lat) / 180) * gridH;
            if (first) { ctx.moveTo(x, y); first = false; }
            else { ctx.lineTo(x, y); }
          });
          ctx.closePath();
          ctx.fillStyle = cont.id === 'egypt' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(30, 58, 138, 0.5)';
          ctx.fill();
          ctx.strokeStyle = cont.id === 'egypt' ? '#93c5fd' : 'rgba(96, 165, 250, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        if (activeCountry) {
          const lat = typeof activeCountry.lat === 'number' ? activeCountry.lat : 26.8;
          const lon = typeof activeCountry.lon === 'number' ? activeCountry.lon : 30.8;
          const isoX = startX + ((lon + 180) / 360) * gridW;
          const isoY = startY + ((90 - lat) / 180) * gridH;

          ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(isoX, isoY, 16 + Math.sin(pulseTime * 3) * 6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(isoX, isoY, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX, isoY - 48);
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;

          const flagStr = activeCountry.flag || '🇪🇬';
          const nameStr = activeCountry.name || 'Egypt';
          const countStr = `${activeCountry.count || 1} (${activeCountry.pct || '100%'})`;
          const labelText = `${flagStr} ${nameStr} • ${countStr}`;

          ctx.font = 'bold 11px Inter, system-ui, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          const boxW = Math.max(110, textWidth + 24);

          ctx.beginPath();
          ctx.roundRect(isoX - boxW / 2, isoY - 64, boxW, 26, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#60a5fa';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, isoX, isoY - 51);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewMode, isDragging, rotation, zoom, activeCountry]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setRotation(prev => ({
      y: prev.y + dx * 0.009,
      x: Math.max(-0.85, Math.min(0.85, prev.x + dy * 0.009))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #020617 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        padding: '16px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        minHeight: '340px',
        overflow: 'hidden'
      }}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Control Toolbar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: isRtl ? 'auto' : '14px',
        right: isRtl ? '14px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '2px',
          display: 'flex',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setViewMode('globe'); }}
            style={{
              background: viewMode === 'globe' ? '#2563eb' : 'transparent',
              color: viewMode === 'globe' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s'
            }}
          >
            <Globe size={13} />
            <span>{isRtl ? 'مجسم ثلاثي الأبعاد 3D' : '3D Globe'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setViewMode('hologram'); }}
            style={{
              background: viewMode === 'hologram' ? '#2563eb' : 'transparent',
              color: viewMode === 'hologram' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={13} />
            <span>{isRtl ? 'هولوجرام' : 'Hologram'}</span>
          </button>
        </div>

        <span style={{
          fontSize: '11px',
          color: '#60a5fa',
          background: 'rgba(37, 99, 235, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Sparkles size={12} />
          {isRtl ? 'اسحب للتدوير 360°' : 'Drag to Rotate 360°'}
        </span>
      </div>

      {/* Top Right Tools (Zoom + Reset) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: isRtl ? 'auto' : '14px',
        left: isRtl ? '14px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(1.4, prev + 0.15)); }}
          title={isRtl ? 'تكبير' : 'Zoom In'}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            borderRadius: '6px',
            padding: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(0.7, prev - 0.15)); }}
          title={isRtl ? 'تصغير' : 'Zoom Out'}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            borderRadius: '6px',
            padding: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ZoomOut size={14} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); resetCamera(); }}
          title={isRtl ? 'إعادة ضبط العرض' : 'Reset View'}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            borderRadius: '6px',
            padding: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={560}
        height={320}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '310px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      />

      {/* Bottom Live Geolocation Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11.5px',
        color: '#94a3b8',
        pointerEvents: 'none',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            width: '7px', 
            height: '7px', 
            borderRadius: '50%', 
            background: '#22c55e', 
            boxShadow: '0 0 8px #22c55e' 
          }} />
          <span style={{ fontWeight: '600' }}>
            {isRtl ? 'البث المباشر للزيارات نشط' : 'Live Geolocation Active'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: '700' }}>
          <MapPin size={12} color="#60a5fa" />
          <span>
            {activeCountry 
              ? `${isRtl ? 'المنطقة الأكثر نشاطاً: ' : 'Top Region: '}${activeCountry.flag || '🇪🇬'} ${activeCountry.name || 'Egypt'} (${activeCountry.pct || '100%'})`
              : (isRtl ? 'الرادار جاهز للزيارات' : 'Radar Ready for Traffic')}
          </span>
        </div>
      </div>
    </div>
  );
}
