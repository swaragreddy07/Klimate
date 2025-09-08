import { API_CONFIG } from "./config";
import type { Station, HistoricalWeather } from "./types";

class WeatherAPI {
  private async fetchData<T>(
    url: string,
    retries = 3,
    backoff = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Weather API Error: ${response.status} ${response.statusText}`
          );
        }

        try {
          return await response.json();
        } catch {
          throw new Error("Invalid JSON response from Weather API");
        }
      } catch (error) {
        if (attempt < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, backoff * 2 ** attempt)
          );
          continue;
        }
        throw error;
      }
    }

    throw new Error("Max retries reached for Weather API");
  }

  async getStations(): Promise<Station[]> {
    const url = `${API_CONFIG.BASE_URL}/stations`;
    return this.fetchData<Station[]>(url);
  }

  async getHistoricalWeather(stationId: string): Promise<HistoricalWeather> {
    const url = `${API_CONFIG.BASE_URL}/historical_weather?station=${stationId}`;
    return this.fetchData<HistoricalWeather>(url);
  }
}

export const weatherAPI = new WeatherAPI();
