import { Card, CardContent } from "@/components/ui/card";
import { formatTemp, type Unit } from "@/lib/units";
import type { DailyForecast } from "@/lib/weather";
import { describeWeather } from "@/lib/weather-codes";

export function Forecast({ days, unit }: { days: DailyForecast[]; unit: Unit }) {
  return (
    <Card>
      <CardContent className="grid grid-cols-5 gap-2 py-4">
        {days.map((day) => {
          const { Icon, label } = describeWeather(day.code);
          const weekday = new Date(`${day.date}T00:00:00`).toLocaleDateString("en", {
            weekday: "short",
          });
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs text-muted-foreground">{weekday}</span>
              <Icon className="size-6" aria-label={label} />
              <span className="text-sm font-medium">{formatTemp(day.max, unit)}</span>
              <span className="text-xs text-muted-foreground">{formatTemp(day.min, unit)}</span>
              <span className="text-[10px] text-sky-500">{day.rainChance}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}