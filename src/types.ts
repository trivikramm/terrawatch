/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  updated: number;
  tsunami: number;
  alert: string; // 'green' | 'yellow' | 'orange' | 'red' | null
  significance: number;
  depth: number;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  city: string;
  lat: number;
  lon: number;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uvi: number;
    clouds: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    dew_point: number;
    sunrise: number;
    sunset: number;
    description: string;
    main: string;
    icon: string;
  };
  hourly: Array<{
    time: string; // e.g. "14:00"
    temp: number;
    pop: number; // rain probability 0 to 100
    wind_speed: number;
    humidity: number;
  }>;
  daily: Array<{
    date: string; // e.g. "Mon", "Jun 15"
    tempMax: number;
    tempMin: number;
    pop: number; // rain chance 0 to 100
    main: string;
    icon: string;
  }>;
  aqi: {
    aqi: number; // 1-5: Good, Fair, Moderate, Poor, Very Poor
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
  };
  alerts: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    severity?: string; // 'minor', 'moderate', 'severe', 'extreme'
  }>;
}

export interface ClimateInsights {
  summary: string;
  weatherWarning: string | null;
  seismicWarning: string | null;
  bullets: string[];
  tsunamiRisk: boolean;
}

export interface AlertNotification {
  id: string;
  type: 'weather' | 'seismic' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
}
