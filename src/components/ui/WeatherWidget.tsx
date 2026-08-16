'use client';

import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  symbolCode: string;
  location: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setWeather(res.data);
        }
      })
      .catch((e) => console.error('Failed to load weather:', e));
  }, []);

  if (!weather) return null;

  const renderIcon = () => {
    if (weather.symbolCode.includes('rain')) return <CloudRain className="w-4 h-4 text-blue-500" />;
    if (weather.symbolCode.includes('cloud')) return <Cloud className="w-4 h-4 text-slate-400" />;
    return <Sun className="w-4 h-4 text-amber-500 animate-pulse" />;
  };

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-muted border border-border
                 rounded-full text-xs font-semibold text-foreground shadow-xs"
      title={`Live vær i ${weather.location} fra Yr / Met.no`}
    >
      {renderIcon()}
      <span>{weather.location}</span>
      <span className="font-bold text-primary">{weather.temperature}°C</span>
      <span className="text-foreground-subtle hidden sm:inline flex items-center gap-0.5">
        <Wind className="w-3 h-3" /> {weather.windSpeed} m/s
      </span>
    </div>
  );
}
