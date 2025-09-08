import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
import type { HistoricalWeather } from "@/api/types";

interface WeatherForecastProps {
  data: HistoricalWeather;
  onSelectDate?: (date: string) => void;
}

export function WeatherForecast({ data, onSelectDate }: WeatherForecastProps) {
  const [selectedDate, setSelectedDate] = useState("");

  // Group by day
  const groupedByDay: Record<
    string,
    { temps: number[]; dewpoints: number[]; winds: number[] }
  > = {};

  if (data.points) {
    data.points.forEach((pt) => {
      const dateKey = pt.timestamp.slice(0, 10);
      groupedByDay[dateKey] ??= { temps: [], dewpoints: [], winds: [] };

      if (pt.temperature != null)
        groupedByDay[dateKey].temps.push(pt.temperature);
      if (pt.dewpoint != null)
        groupedByDay[dateKey].dewpoints.push(pt.dewpoint);
      if (pt.wind_x != null && pt.wind_y != null) {
        const windSpeed = Math.sqrt(pt.wind_x ** 2 + pt.wind_y ** 2);
        groupedByDay[dateKey].winds.push(windSpeed);
      }
    });
  }

  const dailySummaries = Object.entries(groupedByDay).map(([date, values]) => {
    const { temps, dewpoints, winds } = values;
    return {
      date,
      temp_min: temps.length ? Math.min(...temps) : 0,
      temp_max: temps.length ? Math.max(...temps) : 0,
      humidity:
        dewpoints.length && temps.length
          ? Math.round(
              (dewpoints.reduce((a, b) => a + b, 0) /
                dewpoints.length /
                (temps.reduce((a, b) => a + b, 0) / temps.length)) *
                100
            )
          : 0,
      wind: winds.length
        ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length)
        : 0,
    };
  });

  dailySummaries.sort((a, b) => b.date.localeCompare(a.date));

  useEffect(() => {
    if (dailySummaries.length > 0 && !selectedDate) {
      setSelectedDate(dailySummaries[0].date);
      onSelectDate?.(dailySummaries[0].date);
    }
  }, [dailySummaries, selectedDate, onSelectDate]);

  if (!data.points || data.points.length === 0) return null;

  const formatTemp = (t: number) => `${Math.round(t)}°`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-y-auto p-0 divide-y lg:p-4">
          {dailySummaries.map((day) => (
            <div
              key={day.date}
              onClick={() => {
                setSelectedDate(day.date);
                onSelectDate?.(day.date);
              }}
              className={`flex items-center justify-between py-2 px-2 cursor-pointer text-sm ${
                selectedDate === day.date
                  ? "bg-muted border-l-2 border-[primary]"
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Date */}
              <div>
                <p className="font-medium">{day.date}</p>
                <p className="text-xs text-muted-foreground">Historical</p>
              </div>

              {/* Temps */}
              <div className="flex gap-2 mx-4">
                <span className="flex items-center text-blue-500">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  {formatTemp(day.temp_min)}
                </span>
                <span className="flex items-center text-red-500">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  {formatTemp(day.temp_max)}
                </span>
              </div>

              {/* Humidity + Wind (compact) */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{day.humidity}%</span>
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{day.wind} m/s</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
