import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface StationErrorProps {
  stationId?: string;
  onRetry: () => void;
  isFetching: boolean;
  message?: string;
}

export function StationError({
  stationId,
  onRetry,
  isFetching,
  message = "Failed to fetch station weather data.",
}: StationErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>
          {message} {stationId ? ` (Station: ${stationId})` : ""}
        </p>
        <Button
          variant="outline"
          onClick={onRetry}
          className="w-fit"
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
