"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { onSearch: (city: string) => void; loading: boolean };

export function SearchForm({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const city = value.trim();
        if (city) onSearch(city);
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a city…"
        aria-label="City name"
      />
      <Button type="submit" disabled={loading}>
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}