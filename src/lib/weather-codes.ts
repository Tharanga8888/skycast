import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon,
  CloudRain, CloudSnow, CloudSun, Moon, Sun, type LucideIcon,
} from "lucide-react";

export function describeWeather(code: number, isDay = true) {
  const pick = (label: string, day: LucideIcon, night: LucideIcon = day) => ({
    label,
    Icon: isDay ? day : night,
  });

  if (code === 0) return pick("Clear sky", Sun, Moon);
  if (code <= 2) return pick("Partly cloudy", CloudSun, CloudMoon);
  if (code === 3) return pick("Overcast", Cloud);
  if (code <= 48) return pick("Fog", CloudFog);
  if (code <= 57) return pick("Drizzle", CloudDrizzle);
  if (code <= 67) return pick("Rain", CloudRain);
  if (code <= 77) return pick("Snow", CloudSnow);
  if (code <= 82) return pick("Rain showers", CloudRain);
  if (code <= 86) return pick("Snow showers", CloudSnow);
  return pick("Thunderstorm", CloudLightning);
}