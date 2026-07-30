import { useCallback, useEffect, useState } from 'react';
import { fetchForecast, WeatherForecast } from '../lib/weather';
import { estimateCost, poolVolumeM3, recommendedHours, sunniestWindow, formatHourRange, CostEstimate } from '../lib/poolMath';
import { usePoolProfile } from '../state/PoolProfileContext';
import { useDevState } from '../state/DevStateContext';

const MONZA = { lat: 45.5845, lon: 9.2744, name: 'Monza' };

export interface DayPlan {
  dateISO: string;
  tempMax: number;
  hourRange: string;
  startHour: number;
  cost: CostEstimate;
}

export function useWeatherCost() {
  const profile = usePoolProfile();
  const dev = useDevState();
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const lat = profile.cityLat ?? MONZA.lat;
  const lon = profile.cityLon ?? MONZA.lon;
  const cityName = profile.city ?? MONZA.name;

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const f = await fetchForecast(lat, lon);
      setForecast(f);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    load();
  }, [load]);

  const netError = dev.forceNetError || error;

  const volume = poolVolumeM3(profile.size ?? 'M', profile.dims);
  const pump = profile.pump ?? '1';
  const hours = recommendedHours(volume, pump);

  let today: DayPlan | null = null;
  let tomorrow: DayPlan | null = null;

  if (forecast) {
    const win = sunniestWindow(forecast.hourlyRadiationToday, 0, hours);
    today = {
      dateISO: forecast.today.date,
      tempMax: forecast.today.tempMax,
      hourRange: formatHourRange(win.startHour, win.endHour),
      startHour: win.startHour,
      cost: estimateCost(volume, pump),
    };
    const winT = sunniestWindow(forecast.hourlyRadiationTomorrow, 0, hours);
    tomorrow = {
      dateISO: forecast.tomorrow.date,
      tempMax: forecast.tomorrow.tempMax,
      hourRange: formatHourRange(winT.startHour, winT.endHour),
      startHour: winT.startHour,
      cost: estimateCost(volume, pump),
    };
  }

  return { loading, netError, today, tomorrow, cityName, retry: load };
}
