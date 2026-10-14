const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export type Place = {
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
};

export type DailyForecast = {
  date: string;
  code: number;
  max: number;
  min: number;
  rainChance: number;
};

export type Weather = {
  place: Place;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    cloudCover: number;
    code: number;
    isDay: boolean;
  };
  today: { sunrise: string; sunset: string; uvIndex: number };
  daily: DailyForecast[];
};

export class WeatherError extends Error {}

export async function searchCity(query: string): Promise<Place> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");

  const res = await fetch(url);
  if (!res.ok) throw new WeatherError("Could not reach the location service");

  const data = await res.json();
  const match = data.results?.[0];
  if (!match) throw new WeatherError(`No city found for "${query}"`);

  return {
    name: match.name,
    country: match.country ?? "",
    region: match.admin1,
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

export async function getWeather(place: Place): Promise<Weather> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,cloud_cover,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
    timezone: "auto",
    forecast_days: "6",
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new WeatherError("Could not load the forecast");
  const d = await res.json();

  return {
    place,
    current: {
      temp: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      windSpeed: d.current.wind_speed_10m,
      pressure: d.current.pressure_msl,
      cloudCover: d.current.cloud_cover,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    today: {
      sunrise: d.daily.sunrise[0],
      sunset: d.daily.sunset[0],
      uvIndex: d.daily.uv_index_max[0],
    },
    // index 0 is today, so the forecast shows the next 5 days
    daily: d.daily.time.slice(1).map((date: string, i: number) => ({
      date,
      code: d.daily.weather_code[i + 1],
      max: d.daily.temperature_2m_max[i + 1],
      min: d.daily.temperature_2m_min[i + 1],
      rainChance: d.daily.precipitation_probability_max[i + 1] ?? 0,
    })),
  };
}