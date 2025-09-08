import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useStations } from "@/hooks/use-stations";
import { useSearchHistory } from "@/hooks/use-search-history";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";

const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function CitySearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  const { stations, loading } = useStations();
  const { addToHistory } = useSearchHistory();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.toLowerCase().trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const normalizedStations = useMemo(() => {
    return stations.map((st) => ({
      ...st,
      normName: normalize(st.station_name),
      alias: normalize(st.station_name.replace(/\(.*?\)/g, "")),
      idLower: st.station_id.toLowerCase(),
    }));
  }, [stations]);

  const filteredStations = useMemo(() => {
    if (!debouncedQuery || normalizedStations.length === 0) return [];
    return normalizedStations.filter(
      (st) =>
        st.normName.includes(debouncedQuery) ||
        st.alias.includes(debouncedQuery) ||
        st.idLower.startsWith(debouncedQuery)
    );
  }, [debouncedQuery, normalizedStations]);

  const handleSelect = (stationId: string) => {
    const station = stations.find((st) => st.station_id === stationId);
    if (!station) return;

    addToHistory.mutate({
      stationId: station.station_id,
      name: station.station_name,
      lat: station.latitude,
      lon: station.longitude,
      network: station.station_network,
      timezone: station.timezone,
    });

    setOpen(false);
    setQuery("");
    navigate(`/station/${station.station_id}`);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" /> Search stations...
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search stations</DialogTitle>
        <DialogDescription className="sr-only">
          Type a station name or ID to quickly navigate.
        </DialogDescription>

        <Command>
          <div className="flex items-center gap-2 px-2 py-2">
            <CommandInput
              placeholder="Search station by name or ID..."
              value={query}
              onValueChange={setQuery}
            />
          </div>

          <CommandList>
            {debouncedQuery && !loading && filteredStations.length === 0 && (
              <CommandEmpty>No stations found.</CommandEmpty>
            )}

            {filteredStations.slice(0, 50).map((st) => (
              <CommandItem
                key={st.station_id}
                value={`${st.station_name} ${st.station_id}`}
                onSelect={() => handleSelect(st.station_id)}
              >
                <Search className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{st.station_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {st.station_id}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
