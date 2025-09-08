import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Compass, Gauge, Droplets } from "lucide-react";
import type { HistoricalWeather } from "@/api/types";

interface WeatherDetailsProps {
  data: HistoricalWeather;
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  if (!data.points || data.points.length === 0) {
    return null;
  }

  const latest = data.points[data.points.length - 1];

  const getWindDirection = (x: number, y: number) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((angle + 360) % 360) / 45) % 8;
    return directions[index];
  };

  const details = [
    {
      title: "Wind Direction",
      value: `${getWindDirection(latest.wind_x ?? 0, latest.wind_y ?? 0)}`,
      icon: Compass,
      color: "text-green-500",
    },
    {
      title: "Pressure",
      value: latest.pressure ? `${latest.pressure} hPa` : "N/A",
      icon: Gauge,
      color: "text-purple-500",
    },
    {
      title: "Precipitation",
      value: latest.precip ? `${latest.precip} mm` : "0 mm",
      icon: Droplets,
      color: "text-blue-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.title}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <detail.icon className={`h-5 w-5 ${detail.color}`} />
              <div>
                <p className="text-sm font-medium leading-none">
                  {detail.title}
                </p>
                <p className="text-sm text-muted-foreground">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
