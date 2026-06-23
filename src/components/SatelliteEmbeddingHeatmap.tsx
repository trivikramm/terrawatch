import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface HeatmapProps {
  embeddings: Array<{
    lat: number;
    lon: number;
    embedding: number[];
    year: number;
    name?: string;
  }>;
  mapInstance: L.Map | null;
  colorScale?: 'forest' | 'urban' | 'water' | 'barren';
}

const SatelliteEmbeddingHeatmap: React.FC<HeatmapProps> = ({
  embeddings,
  mapInstance,
  colorScale = 'forest'
}) => {
  const [heatScriptLoaded, setHeatScriptLoaded] = useState(false);
  const heatmapLayerRef = useRef<any>(null);

  // Load leaflet-heat library dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).L = L;
    }

    const scriptId = 'leaflet-heat-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        setHeatScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      if ((L as any).heatLayer) {
        setHeatScriptLoaded(true);
      } else {
        const handleScriptLoad = () => setHeatScriptLoaded(true);
        script.addEventListener('load', handleScriptLoad);
        return () => {
          script.removeEventListener('load', handleScriptLoad);
        };
      }
    }
  }, []);

  // Define color gradients for different land cover types
  const getGradient = () => {
    switch (colorScale) {
      case 'forest':
        return {
          0.2: '#14532d', // Dark Green
          0.5: '#22c55e', // Green
          0.8: '#4ade80', // Light green
          1.0: '#86efac'  // Pale Green
        };
      case 'urban':
        return {
          0.2: '#1e3a8a', // Dark Blue
          0.5: '#3b82f6', // Blue
          0.8: '#60a5fa', // Light Blue
          1.0: '#93c5fd'  // Sky Blue
        };
      case 'water':
        return {
          0.2: '#164e63', // Dark Cyan
          0.5: '#06b6d4', // Cyan
          0.8: '#22d3ee', // Light Cyan
          1.0: '#67e8f9'  // Bright Cyan
        };
      case 'barren':
        return {
          0.2: '#78350f', // Dark Amber
          0.5: '#f59e0b', // Amber
          0.8: '#fbbf24', // Yellow
          1.0: '#fde047'  // Bright Yellow
        };
      default:
        return {
          0.2: '#111827',
          0.5: '#06b6d4',
          0.8: '#38bdf8',
          1.0: '#e0f2fe'
        };
    }
  };

  // Redraw heatmap when data or mapInstance changes
  useEffect(() => {
    const map = mapInstance;
    if (!map || !heatScriptLoaded || embeddings.length === 0) return;

    // Remove existing heatmap layer
    if (heatmapLayerRef.current) {
      try {
        map.removeLayer(heatmapLayerRef.current);
      } catch (err) {
        console.error('Heatmap layer removal failed:', err);
      }
      heatmapLayerRef.current = null;
    }

    // Helper to calculate mathematical land classifications derived from 64D
    const calculateVelocity = (v: number[]) => {
      if (!v || v.length < 64) return 0.5;
      
      let val = 0.5;
      if (colorScale === 'forest') {
        val = v.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
      } else if (colorScale === 'urban') {
        val = v.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
      } else if (colorScale === 'water') {
        val = v.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
      } else if (colorScale === 'barren') {
        val = v.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
      }
      return val;
    };

    try {
      // Map embeddings to points [lat, lon, intensity]
      // We can add random/jitter secondary points near each coordinate to make a beautiful cloud of heat
      const heatmapPoints: [number, number, number][] = [];

      embeddings.forEach(emb => {
        const intensity = calculateVelocity(emb.embedding);
        
        // Central point
        heatmapPoints.push([emb.lat, emb.lon, intensity]);

        // Jitter surrounding clouds for visual density gradient in simulator
        const jitterCount = 8;
        for (let j = 0; j < jitterCount; j++) {
          const angle = (j / jitterCount) * 2 * Math.PI;
          const r = 0.015 + Math.random() * 0.02; // Roughly couple of kilometers
          const jitterLat = emb.lat + Math.sin(angle) * r;
          const jitterLon = emb.lon + Math.cos(angle) * r;
          const jitterIntensity = intensity * (0.6 + Math.random() * 0.4);
          heatmapPoints.push([jitterLat, jitterLon, jitterIntensity]);
        }
      });

      if ((L as any).heatLayer) {
        const heatLayer = (L as any).heatLayer(heatmapPoints, {
          radius: 35,
          blur: 20,
          maxZoom: 14,
          max: 1.0,
          gradient: getGradient(),
          minOpacity: 0.45
        }).addTo(map);

        heatmapLayerRef.current = heatLayer;
      }
    } catch (err) {
      console.error('Failed to create or update satellite-heatmap overlay:', err);
    }

    return () => {
      if (heatmapLayerRef.current && map) {
        try {
          map.removeLayer(heatmapLayerRef.current);
        } catch (err) {
          console.error('Heatmap cleanup removal failed:', err);
        }
        heatmapLayerRef.current = null;
      }
    };
  }, [embeddings, mapInstance, colorScale, heatScriptLoaded]);

  return null;
};

export default SatelliteEmbeddingHeatmap;
