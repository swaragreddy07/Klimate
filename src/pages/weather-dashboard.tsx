import {
  useStationsQuery,
  useHistoricalWeatherQuery,
} from "@/hooks/use-weather";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle } from "lucide-react";
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

  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const { data: stations, isLoading: stationsLoading } = useStationsQuery();

  let nearestStation: Station | null = null;
  if (stations && coordinates) {
    nearestStation = stations.reduce<Station | null>((closest, st) => {
      const dist = Math.hypot(
        st.latitude - coordinates.lat,
        st.longitude - coordinates.lon
      );
      const closestDist = closest
        ? Math.hypot(
            closest.latitude - coordinates.lat,
            closest.longitude - coordinates.lon
          )
        : Infinity;
      return dist < closestDist ? st : closest;
    }, null);
  }

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

  // Location error
  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Location Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{locationError}</p>
          <Button variant="outline" onClick={getLocation} className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No coordinates or station
  if (!coordinates || !nearestStation) {
    return (
      <Alert>
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
    );
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

  return (
    <StationLayout
      station={nearestStation}
      historicalData={historicalData}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onRefresh={handleRefresh}
      isFetching={isFetching}
    />
  );
}
