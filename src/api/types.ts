export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  coord: Coordinates;
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  name: string;
  dt: number; // timestamp
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: WeatherData["main"];
    weather: WeatherData["weather"];
    wind: WeatherData["wind"];
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface Station {
  station_id: string;
  latitude: number;
  longitude: number;
  elevation: number;
  station_name: string;
  station_network: string;
  timezone: string;
}


export interface Observation {
  timestamp: string;       
  temperature: number;     
  dewpoint: number;        
  wind_speed: number;      
  wind_direction: string; 
  pressure: number | null; 
  precipitation: number;   
}

export interface WeatherPoint {
  timestamp: string;        
  temperature: number | null;
  wind_x: number | null;
  wind_y: number | null;
  dewpoint: number | null;
  pressure: number | null;
  precip: number | null;
}

export interface HistoricalWeather {
  station: string;
  start_date?: string;
  end_date?: string;
  points_count?: number;

  observations?: Observation[];  
  points?: WeatherPoint[];      
}
