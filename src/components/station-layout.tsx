import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CurrentWeather } from "@/components/current-weather";
import { HourlyTemperature } from "@/components/hourly-temprature";
import { WeatherDetails } from "@/components/weather-details";
import { WeatherForecast } from "@/components/weather-forecast";
import type { HistoricalWeather, Station } from "@/api/types";

interface StationLayoutProps {
  station: Pick<Station, "station_id" | "station_name">;
  historicalData: HistoricalWeather;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export function StationLayout({
  station,
  historicalData,
  selectedDate,
  setSelectedDate,
  onRefresh,
  isFetching,
}: StationLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          {station.station_name} ({station.station_id})
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <CurrentWeather data={historicalData} />
          <HourlyTemperature
            data={historicalData}
            selectedDate={selectedDate}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-start">
          <WeatherDetails data={historicalData} />
          <WeatherForecast
            data={historicalData}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
