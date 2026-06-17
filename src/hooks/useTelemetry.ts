import { useState } from 'react';
import { Earthquake, WeatherData } from '../types.ts';

export function useTelemetry() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [eqLoading, setEqLoading] = useState(false);
  const [eqError, setEqError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve atmospheric intelligence');
      }
      const data = await response.json();
      setWeather(data);
      return data;
    } catch (err: any) {
      console.error(err);
      setWeatherError('Failed to communicate with meteorological tracking servers.');
      return null;
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchEarthquakes = async (period: 'hour' | 'day' | 'week') => {
    setEqLoading(true);
    setEqError(null);
    try {
      const response = await fetch(`/api/earthquakes?period=${period}`);
      if (!response.ok) {
        throw new Error('USGS Seismic server returned unsuccessful code');
      }
      const data = await response.json();
      setEarthquakes(data);
      return data;
    } catch (err: any) {
      console.error(err);
      setEqError('Unable to parse active tectonic monitoring database.');
      return null;
    } finally {
      setEqLoading(false);
    }
  };

  return {
    weather,
    weatherLoading,
    weatherError,
    earthquakes,
    eqLoading,
    eqError,
    fetchWeather,
    fetchEarthquakes,
  };
}
