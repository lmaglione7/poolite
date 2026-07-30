// Real weather data via Open-Meteo (no API key required):
// https://open-meteo.com/en/docs · https://open-meteo.com/en/docs/geocoding-api

export interface CitySuggestion {
  name: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=5&language=it&country=IT`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('geocoding_failed');
  const json = await res.json();
  const results = (json.results ?? []) as any[];
  return results.map((r) => ({
    name: r.name,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherForecast {
  today: DailyWeather;
  tomorrow: DailyWeather;
  /** Direct solar radiation (W/m²) for each hour of "today", index 0 = hour 0. */
  hourlyRadiationToday: number[];
  hourlyRadiationTomorrow: number[];
}

export async function fetchForecast(lat: number, lon: number): Promise<WeatherForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,sunrise,sunset&hourly=direct_radiation&forecast_days=3&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('forecast_failed');
  const json = await res.json();

  const daily = json.daily;
  const hourly = json.hourly;
  const hoursPerDay = 24;

  const today: DailyWeather = {
    date: daily.time[0],
    tempMax: Math.round(daily.temperature_2m_max[0]),
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
  };
  const tomorrow: DailyWeather = {
    date: daily.time[1],
    tempMax: Math.round(daily.temperature_2m_max[1]),
    sunrise: daily.sunrise[1],
    sunset: daily.sunset[1],
  };

  const radiation: number[] = hourly.direct_radiation ?? [];
  return {
    today,
    tomorrow,
    hourlyRadiationToday: radiation.slice(0, hoursPerDay),
    hourlyRadiationTomorrow: radiation.slice(hoursPerDay, hoursPerDay * 2),
  };
}
