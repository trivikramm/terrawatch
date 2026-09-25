import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

class SimpleHeat {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  maxVal: number;
  data: [number, number, number][];
  circle: HTMLCanvasElement | null;
  r: number;
  grad: Uint8ClampedArray | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.maxVal = 1.0;
    this.data = [];
    this.circle = null;
    this.r = 0;
    this.grad = null;
  }

  setData(data: [number, number, number][]) {
    this.data = data;
    return this;
  }

  setMax(maxVal: number) {
    this.maxVal = maxVal;
    return this;
  }

  clear() {
    this.data = [];
    return this;
  }

  setRadius(r: number, blur = 15) {
    const circle = this.circle = document.createElement('canvas');
    const ctx = circle.getContext('2d')!;
    const r2 = this.r = r + blur;
    circle.width = circle.height = r2 * 2;
    ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'black';
    ctx.beginPath();
    ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    return this;
  }

  resize() {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  setGradient(grad: { [key: number]: string }) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    canvas.width = 1;
    canvas.height = 256;
    for (const i in grad) {
      gradient.addColorStop(parseFloat(i), grad[i]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    this.grad = ctx.getImageData(0, 0, 1, 256).data;
    return this;
  }

  draw(minOpacity = 0.05) {
    if (!this.circle) this.setRadius(25);
    if (!this.grad) this.setGradient({ 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' });

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0, len = this.data.length; i < len; i++) {
      const p = this.data[i];
      ctx.globalAlpha = Math.min(Math.max(p[2] / this.maxVal, minOpacity), 1);
      ctx.drawImage(this.circle!, p[0] - this.r, p[1] - this.r);
    }

    const colored = ctx.getImageData(0, 0, this.width, this.height);
    this._colorize(colored.data, this.grad!);
    ctx.putImageData(colored, 0, 0);
    return this;
  }

  _colorize(pixels: Uint8ClampedArray, gradient: Uint8ClampedArray) {
    for (let i = 0, len = pixels.length; i < len; i += 4) {
      const j = pixels[i + 3] * 4;
      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  }
}

const SimpleHeatLayer = (L as any).Layer.extend({
  options: {
    minOpacity: 0.05,
    maxZoom: 18,
    radius: 25,
    blur: 15,
    max: 1.0,
    gradient: {
      0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'
    }
  },

  initialize: function (latlngs: any[], options: any) {
    this._latlngs = latlngs;
    (L as any).setOptions(this, options);
  },

  setLatLngs: function (latlngs: any[]) {
    this._latlngs = latlngs;
    return this.redraw();
  },

  redraw: function () {
    if (this._map && !this._frame && !this._map._animating) {
      this._frame = (L as any).Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function (map: any) {
    this._map = map;
    if (!this._canvas) {
      this._initCanvas();
    }

    const pane = (map && map.getPane) ? (map.getPane('overlayPane') || map.getContainer()) : null;
    if (pane && this._canvas) {
      try {
        pane.appendChild(this._canvas);
      } catch (err) {
        console.error('Failed to append heatmap canvas:', err);
      }
    }

    if (map && map.on) {
      map.on('moveend', this._reset, this);
      if (map.options && map.options.zoomAnimation && (L as any).Browser && (L as any).Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
    }
    this._reset();
  },

  onRemove: function (map: any) {
    const pane = (map && map.getPane) ? (map.getPane('overlayPane') || map.getContainer()) : null;
    const parent = pane || (this._canvas ? this._canvas.parentNode : null);
    if (parent && this._canvas) {
      try {
        parent.removeChild(this._canvas);
      } catch (err) {}
    }
    if (map && map.off) {
      map.off('moveend', this._reset, this);
      if (map.options && map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this);
      }
    }
  },

  _initCanvas: function () {
    const canvas = this._canvas = (L as any).DomUtil.create('canvas', 'leaflet-heat-layer leaflet-zoom-animated');
    const size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    const animated = this._map.options.zoomAnimation && (L as any).Browser.any3d;
    (L as any).DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
    this._heat = new SimpleHeat(canvas);
    this._updateOptions();
  },

  _updateOptions: function () {
    this._heat.setRadius(this.options.radius, this.options.blur);
    if (this.options.gradient) {
      this._heat.setGradient(this.options.gradient);
    }
    if (this.options.max) {
      this._heat.setMax(this.options.max);
    }
  },

  _reset: function () {
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    (L as any).DomUtil.setPosition(this._canvas, topLeft);
    const size = this._map.getSize();
    if (this._canvas.width !== size.x) {
      this._canvas.width = size.x;
    }
    if (this._canvas.height !== size.y) {
      this._canvas.height = size.y;
    }
    this._heat.resize();
    this._redraw();
  },

  _redraw: function () {
    if (!this._map) return;
    const data = [];
    const r = this._heat.r;
    const size = this._map.getSize();
    const bounds = new (L as any).LatLngBounds(
      this._map.containerPointToLatLng([-r, -r]),
      this._map.containerPointToLatLng(size.add([r, r]))
    );
    const v = 1;
    const cellSize = r / 2;
    const grid: any[] = [];
    const panePos = this._map._getMapPanePos ? this._map._getMapPanePos() : { x: 0, y: 0 };
    const offsetX = panePos.x % cellSize;
    const offsetY = panePos.y % cellSize;

    for (let i = 0, len = this._latlngs.length; i < len; i++) {
      const latlng = this._latlngs[i];
      const latVal = latlng[0];
      const lonVal = latlng[1];
      const val = latlng[2] !== undefined ? latlng[2] : 1;
      const lLatLng = new (L as any).LatLng(latVal, lonVal);
      if (bounds.contains(lLatLng)) {
        const p = this._map.latLngToContainerPoint(lLatLng);
        const x = Math.floor((p.x - offsetX) / cellSize) + 2;
        const y = Math.floor((p.y - offsetY) / cellSize) + 2;
        const k = val * v;
        grid[y] = grid[y] || [];
        const cell = grid[y][x];
        if (!cell) {
          grid[y][x] = [p.x, p.y, k];
        } else {
          cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k);
          cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k);
          cell[2] += k;
        }
      }
    }
    
    for (let i = 0, len = grid.length; i < len; i++) {
      if (grid[i]) {
        for (let x = 0, len2 = grid[i].length; x < len2; x++) {
          const cell = grid[i][x];
          if (cell) {
            data.push([
              Math.round(cell[0]),
              Math.round(cell[1]),
              Math.min(cell[2], 1)
            ]);
          }
        }
      }
    }
    this._heat.setData(data).draw(this.options.minOpacity);
    this._frame = null;
  },

  _animateZoom: function (e: any) {
    const scale = this._map.getZoomScale(e.zoom);
    const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._map._getMapPanePos());
    if ((L as any).DomUtil.setTransform) {
      (L as any).DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[(L as any).DomUtil.TRANSFORM] = (L as any).DomUtil.getTranslateString(offset) + ' ' + (L as any).DomUtil.getScaleString(scale);
    }
  }
});

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
  const heatmapLayerRef = useRef<any>(null);

  const getGradient = () => {
    switch (colorScale) {
      case 'forest':
        return {
          0.2: '#14532d',
          0.5: '#22c55e',
          0.8: '#4ade80',
          1.0: '#86efac'
        };
      case 'urban':
        return {
          0.2: '#1e3a8a',
          0.5: '#3b82f6',
          0.8: '#60a5fa',
          1.0: '#93c5fd'
        };
      case 'water':
        return {
          0.2: '#164e63',
          0.5: '#06b6d4',
          0.8: '#22d3ee',
          1.0: '#67e8f9'
        };
      case 'barren':
        return {
          0.2: '#78350f',
          0.5: '#f59e0b',
          0.8: '#fbbf24',
          1.0: '#fde047'
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

  useEffect(() => {
    const map = mapInstance;
    if (!map || embeddings.length === 0) return;

    if (heatmapLayerRef.current) {
      try {
        map.removeLayer(heatmapLayerRef.current);
      } catch (err) {
        console.error('Heatmap layer removal failed:', err);
      }
      heatmapLayerRef.current = null;
    }

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
      const heatmapPoints: [number, number, number][] = [];

      embeddings.forEach(emb => {
        const intensity = calculateVelocity(emb.embedding);
        heatmapPoints.push([emb.lat, emb.lon, intensity]);

        const jitterCount = 8;
        for (let j = 0; j < jitterCount; j++) {
          const angle = (j / jitterCount) * 2 * Math.PI;
          const r = 0.015 + Math.random() * 0.02;
          const jitterLat = emb.lat + Math.sin(angle) * r;
          const jitterLon = emb.lon + Math.cos(angle) * r;
          const jitterIntensity = intensity * (0.6 + Math.random() * 0.4);
          heatmapPoints.push([jitterLat, jitterLon, jitterIntensity]);
        }
      });

      const heatLayer = new (SimpleHeatLayer as any)(heatmapPoints, {
        radius: 35,
        blur: 20,
        maxZoom: 14,
        max: 1.0,
        gradient: getGradient(),
        minOpacity: 0.45
      }).addTo(map);

      heatmapLayerRef.current = heatLayer;
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
  }, [embeddings, mapInstance, colorScale]);

  return null;
};

export default SatelliteEmbeddingHeatmap;
