import {
  useStationsQuery,
  useHistoricalWeatherQuery,
} from "@/hooks/use-weather";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import WeatherSkeleton from "@/components/loading-skeleton";
import {
  defaultHistoricalData,
  defaultStation,
} from "@/components/fallback-station";
import { StationLayout } from "@/components/station-layout";
import { StationError } from "@/components/station-error";
import { useState, useEffect } from "react";

interface Station {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  station_network: string;
  timezone: string;
}

export function StationDashboard() {
  const [selectedDate, setSelectedDate] = useState("");
  const [nearestStation, setNearestStation] = useState<Station | null>(null);

  const {
    coordinates,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const { data: stations, isLoading: stationsLoading } = useStationsQuery();

  useEffect(() => {
    if (stations && coordinates) {
      const closest = stations.reduce<Station | null>((prev, st) => {
        const dist = Math.hypot(
          st.latitude - coordinates.lat,
          st.longitude - coordinates.lon
        );
        const prevDist = prev
          ? Math.hypot(
              prev.latitude - coordinates.lat,
              prev.longitude - coordinates.lon
            )
          : Infinity;
        return dist < prevDist ? st : prev;
      }, null);
      setNearestStation(closest);
    } else if (stations) {
      const gky = stations.find((st) => st.station_id === "GKY") ?? null;
      setNearestStation(gky);
    }
  }, [stations, coordinates]);

  const {
    data: historicalData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useHistoricalWeatherQuery(nearestStation?.station_id ?? "");

  const handleRefresh = () => {
    getLocation();
    refetch();
  };

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
  }, [historicalData, nearestStation?.station_id]);

  if (locationLoading || stationsLoading || isLoading) {
    return <WeatherSkeleton />;
  }

  if (error) {
    return (
      <>
        <StationError
          stationId={nearestStation?.station_id}
          onRetry={handleRefresh}
          isFetching={isFetching}
          message="Failed to fetch station weather data. Showing default values."
        />
        <StationLayout
          station={defaultStation}
          historicalData={defaultHistoricalData}
          selectedDate={selectedDate || "2025-09-07"}
          setSelectedDate={setSelectedDate}
          onRefresh={handleRefresh}
          isFetching={isFetching}
        />
      </>
    );
  }

  if (!historicalData) {
    return <WeatherSkeleton />;
  }

  if (!coordinates && nearestStation?.station_id === "GKY") {
    return (
      <>
        <Alert className="mb-4">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Location Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              Please enable location access to see your local station’s weather.
            </p>
            <Button variant="outline" onClick={getLocation} className="w-fit">
              <MapPin className="mr-2 h-4 w-4" />
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>

        <StationLayout
          station={nearestStation}
          historicalData={historicalData}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onRefresh={handleRefresh}
          isFetching={isFetching}
        />
      </>
    );
  }

  return (
    <StationLayout
      station={nearestStation ?? defaultStation}
      historicalData={historicalData ?? defaultHistoricalData}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onRefresh={handleRefresh}
      isFetching={isFetching}
    />
  );
}
