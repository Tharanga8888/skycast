"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentWeather } from "@/components/current-weather";
import { Forecast } from "@/components/forecast";
import { SearchForm } from "@/components/search-form";
import type { Unit } from "@/lib/units";
import { getWeather, searchCity, type Weather } from "@/lib/weather";

const CITY_KEY = "skycast:city";
const UNIT_KEY = "skycast:unit";

export function WeatherApp() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>(() => {
    const savedUnit = localStorage.getItem(UNIT_KEY);
    return savedUnit === "C" || savedUnit === "F" ? savedUnit : "C";
 });

  const load = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const place = await searchCity(city);
      setWeather(await getWeather(place));
      localStorage.setItem(CITY_KEY, city);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const city = localStorage.getItem(CITY_KEY) ?? "London";

    const timeoutId = setTimeout(() => {
        load(city);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [load]);

  function changeUnit(next: Unit) {
    setUnit(next);
    localStorage.setItem(UNIT_KEY, next);
  }

  return (
    <main className="mx-auto w-full min-w-90 max-w-105 space-y-3 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Skycast</h1>
        <div className="flex gap-1">
          {(["C", "F"] as const).map((u) => (
            <Button
              key={u}
              size="sm"
              variant={unit === u ? "default" : "outline"}
              onClick={() => changeUnit(u)}
            >
              °{u}
            </Button>
          ))}
        </div>
      </header>

      <SearchForm onSearch={load} loading={loading} />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && !weather ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        weather && (
          <>
            <CurrentWeather weather={weather} unit={unit} />
            <Forecast days={weather.daily} unit={unit} />
          </>
        )
      )}
    </main>
  );
}