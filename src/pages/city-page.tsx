import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CurrentWeather } from "@/components/current-weather";
import { HourlyTemperature } from "@/components/hourly-temprature";
import { WeatherDetails } from "@/components/weather-details";
import { WeatherForecast } from "@/components/weather-forecast";
import WeatherSkeleton from "@/components/loading-skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { useStationsQuery, useHistoricalWeatherQuery } from "@/hooks/use-weather";

export function StationPage() {
  const { stationId } = useParams<{ stationId: string }>();

  const { data: stations, isLoading: stationsLoading } = useStationsQuery();
  const { data: historicalData, error, isLoading } = useHistoricalWeatherQuery(
    stationId ?? ""
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weather data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!historicalData || !stations || stationsLoading || isLoading) {
    return <WeatherSkeleton />;
  }

  const station = stations.find((s) => s.station_id === stationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {station?.station_name ?? stationId}
        </h1>
        {station && (
          <div className="flex gap-2">
            <FavoriteButton station={station} />
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <CurrentWeather data={historicalData} />
        <HourlyTemperature data={historicalData} />
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <WeatherDetails data={historicalData} />
          <WeatherForecast data={historicalData} />
        </div>
      </div>
    </div>
  );
}
