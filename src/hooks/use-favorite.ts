// src/hooks/use-favorites.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

export interface FavoriteStation {
  id: string;              
  station_id: string;      
  station_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  station_network: string;
  timezone: string;
  addedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteStation[]>(
    "favorites",
    []
  );
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favorites,
    initialData: favorites,
    staleTime: Infinity,
  });

  const addFavorite = useMutation({
    mutationFn: async (station: Omit<FavoriteStation, "id" | "addedAt">) => {
      const newFavorite: FavoriteStation = {
        ...station,
        id: station.station_id,
        addedAt: Date.now(),
      };

      // Prevent duplicates
      const exists = favorites.some((fav) => fav.id === newFavorite.id);
      if (exists) return favorites;

      const newFavorites = [...favorites, newFavorite];
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (stationId: string) => {
      const newFavorites = favorites.filter((st) => st.id !== stationId);
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favorites: favoritesQuery.data,
    addFavorite,
    removeFavorite,
    isFavorite: (stationId: string) =>
      favorites.some((st) => st.station_id === stationId),
  };
}
