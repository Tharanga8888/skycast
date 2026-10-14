"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentWeather } from "@/components/current-weather";
import { Forecast } from "@/components/forecast";
import { SearchForm } from "@/components/search-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Unit } from "@/lib/units";
import { getWeather, searchCity, type Weather } from "@/lib/weather";

const CITY_KEY = "skycast:city";
const UNIT_KEY = "skycast:unit";
const DEFAULT_CITY = "London";

async function fetchWeatherForCity(city: string): Promise<Weather> {
  const place = await searchCity(city);
  return getWeather(place);
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

export function WeatherApp() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true); // the first load starts right away
  const [error, setError] = useState<string | null>(null);
  const [storedUnit, setStoredUnit] = useLocalStorage(UNIT_KEY, "C");
  const unit: Unit = storedUnit === "F" ? "F" : "C";

  // Used when the user searches
  const search = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      setWeather(await fetchWeatherForCity(city));
      localStorage.setItem(CITY_KEY, city);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: setState only happens in async callbacks, never synchronously
  useEffect(() => {
    let cancelled = false;

    fetchWeatherForCity(localStorage.getItem(CITY_KEY) ?? DEFAULT_CITY)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              onClick={() => setStoredUnit(u)}
            >
              °{u}
            </Button>
          ))}
        </div>
      </header>

      <SearchForm onSearch={search} loading={loading} />

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