import { Card, CardContent } from "./ui/card";
import { Droplets, Wind } from "lucide-react";
import type { HistoricalWeather } from "@/api/types";

interface CurrentWeatherProps {
  data: HistoricalWeather;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  if (!data || !data.points || data.points.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No weather data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = data.points[data.points.length - 1];
  const temp = latest.temperature ?? 0;
  const dewpoint = latest.dewpoint ?? 0;
  const windSpeed = Math.sqrt(
    (latest.wind_x ?? 0) ** 2 + (latest.wind_y ?? 0) ** 2
  );


  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Station: {data.station}
              </h2>
              <p className="text-sm text-muted-foreground">
                Last update: {latest.timestamp}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-7xl font-bold tracking-tighter">{temp}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Dewpoint</p>
                  <p className="text-sm text-muted-foreground">
                    {dewpoint.toFixed(1)}°
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Wind Speed</p>
                  <p className="text-sm text-muted-foreground">
                    {windSpeed.toFixed(1)} m/s
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Weather data from ASOS
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
