import { Droplets, Gauge, Sun, Sunrise, Sunset, Wind, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatTemp, type Unit } from "@/lib/units";
import type { Weather } from "@/lib/weather";
import { describeWeather } from "@/lib/weather-codes";

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// Open-Meteo returns local ISO times like "2026-10-13T06:12"
const time = (iso: string) => iso.slice(11, 16);

export function CurrentWeather({ weather, unit }: { weather: Weather; unit: Unit }) {
  const { place, current, today } = weather;
  const { label, Icon } = describeWeather(current.code, current.isDay);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {place.name}
              {place.country && <span className="text-muted-foreground">, {place.country}</span>}
            </h2>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <Icon className="size-12 text-primary" aria-hidden />
        </div>

        <div className="flex items-end gap-3">
          <span className="text-6xl font-bold tracking-tighter">
            {formatTemp(current.temp, unit)}
          </span>
          <span className="pb-2 text-sm text-muted-foreground">
            Feels like {formatTemp(current.feelsLike, unit)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
          <Stat icon={Wind} label="Wind" value={`${Math.round(current.windSpeed)} km/h`} />
          <Stat icon={Gauge} label="Pressure" value={`${Math.round(current.pressure)} hPa`} />
          <Stat icon={Sun} label="UV index" value={String(Math.round(today.uvIndex))} />
          <Stat icon={Sunrise} label="Sunrise" value={time(today.sunrise)} />
          <Stat icon={Sunset} label="Sunset" value={time(today.sunset)} />
        </div>
      </CardContent>
    </Card>
  );
}