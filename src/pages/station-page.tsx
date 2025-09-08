import { useParams } from "react-router-dom";
import { useHistoricalWeatherQuery } from "@/hooks/use-weather";
import { useStations } from "@/hooks/use-stations";
import WeatherSkeleton from "@/components/loading-skeleton";
import { useState, useEffect } from "react";
import { StationError } from "@/components/station-error";
import { StationLayout } from "@/components/station-layout";
import {
  defaultStation,
  defaultHistoricalData,
} from "@/components/fallback-station";
import type { HistoricalWeather } from "@/api/types";

export function StationPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations } = useStations();
  const station = stations.find((st) => st.station_id === stationId);

  const {
    data: historicalData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useHistoricalWeatherQuery(stationId ?? "");

  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (historicalData?.points?.length) {
      const uniqueDates = Array.from(
        new Set(historicalData.points.map((pt) => pt.timestamp.slice(0, 10)))
      );
      uniqueDates.sort((a, b) => b.localeCompare(a));
      setSelectedDate(uniqueDates[0]);
    } else {
      setSelectedDate("");
    }
  }, [historicalData]);

  if (isLoading) return <WeatherSkeleton />;

  if (error) {
    return (
      <>
        <StationError
          stationId={stationId}
          onRetry={() => refetch()}
          isFetching={isFetching}
          message="Failed to fetch weather data. Showing default values."
        />
        <StationLayout
          station={defaultStation}
          historicalData={defaultHistoricalData}
          selectedDate={selectedDate || "2025-09-07"}
          setSelectedDate={setSelectedDate}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />
      </>
    );
  }

  if (!historicalData) return <WeatherSkeleton />;

  return (
    <StationLayout
      station={
        station ?? { station_id: stationId ?? "N/A", station_name: "Unknown" }
      }
      historicalData={historicalData as HistoricalWeather}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onRefresh={() => refetch()}
      isFetching={isFetching}
    />
  );
}
