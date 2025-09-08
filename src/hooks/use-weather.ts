import { useQuery } from "@tanstack/react-query";
import { weatherAPI } from "@/api/weather";

export const WEATHER_KEYS = {
  stations: ["stations"] as const,
  historical: (stationId: string) => ["historical", stationId] as const,
} as const;

export function useStationsQuery() {
  return useQuery({
    queryKey: WEATHER_KEYS.stations,
    queryFn: () => weatherAPI.getStations(),
  });
}


export function useHistoricalWeatherQuery(stationId: string | null) {
  return useQuery({
    queryKey: WEATHER_KEYS.historical(stationId ?? ""),
    queryFn: () => (stationId ? weatherAPI.getHistoricalWeather(stationId) : null),
    enabled: !!stationId,
  });
}
