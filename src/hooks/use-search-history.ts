import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

interface SearchHistoryItem {
  id: string;
  stationId: string;
  name: string;
  lat: number;
  lon: number;
  network: string;
  timezone: string;
  searchedAt: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>(
    "search-history",
    []
  );
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["search-history"],
    queryFn: () => history,
    initialData: history,
  });

  const addToHistory = useMutation({
    mutationFn: async (
      station: Omit<SearchHistoryItem, "id" | "searchedAt">
    ) => {
      const newSearch: SearchHistoryItem = {
        ...station,
        id: `${station.stationId}-${Date.now()}`,
        searchedAt: Date.now(),
      };

      // Remove duplicates and keep only last 10
      const filteredHistory = history.filter(
        (item) => item.stationId !== station.stationId
      );
      const newHistory = [newSearch, ...filteredHistory].slice(0, 10);

      setHistory(newHistory);
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["search-history"], newHistory);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      setHistory([]);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["search-history"], []);
    },
  });

  return {
    history: historyQuery.data ?? [],
    addToHistory,
    clearHistory,
  };
}
