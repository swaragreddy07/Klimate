import { useEffect, useState } from "react";
import { weatherAPI } from "@/api/weather";
import type { Station } from "@/api/types";

let cachedStations: Station[] | null = null; 

export function useStations() {
  const [stations, setStations] = useState<Station[]>(cachedStations || []);
  const [loading, setLoading] = useState(!cachedStations);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedStations) return;

    setLoading(true);
    weatherAPI
      .getStations()
      .then((data) => {
        cachedStations = data;
        setStations(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stations, loading, error };
}
