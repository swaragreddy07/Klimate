import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import type { HistoricalWeather, Observation, WeatherPoint } from "@/api/types";

interface HourlyTemperatureProps {
  data: HistoricalWeather;
  selectedDate: string; // yyyy-MM-dd
}

export function HourlyTemperature({
  data,
  selectedDate,
}: HourlyTemperatureProps) {
  const rawData: (Observation | WeatherPoint)[] =
    data?.observations ?? data?.points ?? [];

  const validPoints = rawData.filter(
    (obs) =>
      obs.temperature !== null &&
      obs.temperature !== undefined &&
      !isNaN(Number(obs.temperature))
  );

  // Pre-group all data by date
  const groupedByDate = useMemo(() => {
    const map: Record<string, { time: string; temp: number }[]> = {};
    validPoints.forEach((obs) => {
      const dateKey = obs.timestamp.slice(0, 10);
      const time = obs.timestamp.split(" ")[1];
      map[dateKey] ??= [];
      map[dateKey].push({ time, temp: obs.temperature! });
    });
    return map;
  }, [validPoints]);

  const chartData = groupedByDate[selectedDate] ?? [];

  if (chartData.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>No Data ({selectedDate})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            No temperature data available for this date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Temperature ({selectedDate})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const { time, temp } = payload[0].payload;
                    return (
                      <div className="rounded bg-background p-2 shadow">
                        <p className="text-sm">Time: {time}</p>
                        <p className="text-sm">Temp: {temp}°</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
