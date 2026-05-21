import { z } from "zod";

const OPEN_METEO_GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const weatherForecastInputSchema = z.object({
  destination: z
    .string()
    .min(2)
    .max(200)
    .describe("City, region, or destination name to geocode."),
  country: z.string().min(2).max(120).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

interface GeocodingResponse {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
}

interface ForecastResponse {
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
  };
}

export interface WeatherForecastDay {
  date: string;
  weatherCode?: number;
  temperatureMaxC?: number;
  temperatureMinC?: number;
  precipitationMm?: number;
  precipitationProbabilityMaxPct?: number;
}

export interface WeatherForecastResult {
  location: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  days: WeatherForecastDay[];
}

export function createWeatherForecastTool() {
  return {
    description:
      "Fetch real daily weather forecast data from Open-Meteo for trips starting soon. Use this when exact trip dates are within the forecast window to plan outdoor activities and weather-sensitive days.",
    inputSchema: weatherForecastInputSchema,
    execute: async ({
      destination,
      country,
      startDate,
      endDate,
    }: z.infer<typeof weatherForecastInputSchema>): Promise<WeatherForecastResult> => {
      const location = await geocodeDestination(destination, country);
      const forecast = await fetchForecast(
        location.latitude,
        location.longitude,
        startDate,
        endDate,
        location.timezone,
      );

      return {
        location: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        days: mapForecastDays(forecast),
      };
    },
  };
}

async function geocodeDestination(destination: string, country?: string) {
  const params = new URLSearchParams({
    name: [destination, country].filter(Boolean).join(", "),
    count: "1",
    language: "en",
    format: "json",
  });
  const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo geocoding failed: ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result) {
    throw new Error(`Open-Meteo could not geocode destination: ${destination}`);
  }
  return result;
}

async function fetchForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone?: string,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: timezone ?? "auto",
  });
  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo forecast failed: ${response.status}`);
  }
  return (await response.json()) as ForecastResponse;
}

function mapForecastDays(forecast: ForecastResponse): WeatherForecastDay[] {
  const daily = forecast.daily;
  if (!daily?.time) return [];

  return daily.time.map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index],
    temperatureMaxC: daily.temperature_2m_max?.[index],
    temperatureMinC: daily.temperature_2m_min?.[index],
    precipitationMm: daily.precipitation_sum?.[index],
    precipitationProbabilityMaxPct: daily.precipitation_probability_max?.[index],
  }));
}
