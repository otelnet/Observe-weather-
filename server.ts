import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Default Mock/Sample HKO Weather Data for instant reliability
const SAMPLE_HKO_WEATHER = {
  location: {
    id: "hko_central",
    name: "Hong Kong Observatory (Tsim Sha Tsui)",
    region: "Kowloon",
    country: "Hong Kong SAR",
    lat: 22.3022,
    lon: 114.1747,
    elevation: 33,
    isHKO: true,
  },
  timestamp: new Date().toISOString(),
  temp: 28.4,
  feelsLike: 31.2,
  humidity: 82,
  pressure: 1008.5,
  windSpeed: 24,
  windGust: 42,
  windDirection: 110,
  windDirectionText: "East / Southeast",
  condition: "Partly Cloudy with Isolated Showers",
  conditionCode: "cloudy_rain",
  uvIndex: 7,
  visibility: 12.0,
  airQualityIndex: 2,
  rainfallPastHour: 2.5,
  hourlyForecast: [
    { time: "09:00", temp: 27.5, rainProb: 20, rainfall: 0.0, windSpeed: 20, condition: "Partly Cloudy" },
    { time: "11:00", temp: 29.1, rainProb: 35, rainfall: 0.5, windSpeed: 22, condition: "Isolated Showers" },
    { time: "13:00", temp: 30.5, rainProb: 45, rainfall: 2.0, windSpeed: 26, condition: "Scattered Rain" },
    { time: "15:00", temp: 29.8, rainProb: 50, rainfall: 3.5, windSpeed: 28, condition: "Thundershower" },
    { time: "17:00", temp: 28.9, rainProb: 30, rainfall: 1.0, windSpeed: 24, condition: "Showers" },
    { time: "19:00", temp: 27.8, rainProb: 15, rainfall: 0.0, windSpeed: 20, condition: "Partly Cloudy" },
    { time: "21:00", temp: 27.2, rainProb: 10, rainfall: 0.0, windSpeed: 18, condition: "Clear Night" },
  ],
  dailyForecast: [
    { date: "2026-08-03", dayName: "Today", maxTemp: 31, minTemp: 27, humidityMax: 90, humidityMin: 70, condition: "Showers & Thunderstorms", rainProb: 60, windDesc: "Moderate E to SE winds", uvIndexMax: 8 },
    { date: "2026-08-04", dayName: "Tue", maxTemp: 32, minTemp: 27, humidityMax: 88, humidityMin: 65, condition: "Sunny Intervals", rainProb: 30, windDesc: "Light E winds", uvIndexMax: 9 },
    { date: "2026-08-05", dayName: "Wed", maxTemp: 33, minTemp: 28, humidityMax: 85, humidityMin: 60, condition: "Very Hot with Sunny Periods", rainProb: 20, windDesc: "Light Variable winds", uvIndexMax: 10 },
    { date: "2026-08-06", dayName: "Thu", maxTemp: 31, minTemp: 26, humidityMax: 92, humidityMin: 72, condition: "Squally Thunderstorms", rainProb: 75, windDesc: "Fresh SE winds, gusty", uvIndexMax: 6 },
    { date: "2026-08-07", dayName: "Fri", maxTemp: 29, minTemp: 25, humidityMax: 95, humidityMin: 78, condition: "Heavy Rain", rainProb: 85, windDesc: "Fresh to Strong E to SE winds", uvIndexMax: 4 },
    { date: "2026-08-08", dayName: "Sat", maxTemp: 30, minTemp: 26, humidityMax: 90, humidityMin: 70, condition: "Showers Decreasing", rainProb: 40, windDesc: "Moderate E winds", uvIndexMax: 7 },
    { date: "2026-08-09", dayName: "Sun", maxTemp: 32, minTemp: 27, humidityMax: 85, humidityMin: 65, condition: "Sunny Intervals", rainProb: 25, windDesc: "Light to Moderate E winds", uvIndexMax: 8 },
  ],
  hkoWarnings: [
    {
      code: "WTCSGN1",
      name: "Standby Signal No. 1",
      type: "cyclone",
      level: "T1",
      issueTime: "2026-08-03T02:15:00Z",
      headline: "Standby Signal No. 1 in force. Tropical Depression over northern South China Sea.",
      details: "The tropical depression over the northern South China Sea is maintaining its distance. Member of the public should avoid water sports and stay alert to the latest bulletins.",
      severity: "moderate",
    },
    {
      code: "WTHUNDER",
      name: "Thunderstorm Warning",
      type: "thunderstorm",
      level: "Yellow",
      issueTime: "2026-08-03T07:30:00Z",
      headline: "Thunderstorm Warning issued. Violent gusts may affect Hong Kong.",
      details: "Squally thunderstorms are expected to affect Hong Kong. Gusts exceeding 70 km/h may reach offshore and high ground.",
      severity: "moderate",
    },
    {
      code: "WHOT",
      name: "Very Hot Weather Warning",
      type: "temperature",
      level: "Very Hot",
      issueTime: "2026-08-03T06:00:00Z",
      headline: "Very Hot Weather Warning in force. Risk of heat stroke.",
      details: "Drink plenty of water and refrain from prolonged over-exertion under direct sunlight.",
      severity: "minor",
    },
  ],
  specialTips: [
    "Special Weather Tips: A tropical depression in the northern South China Sea is moving north-northwest towards western Guangdong.",
    "Members of the public planning outdoor activities should check regional radar images and weather warnings.",
  ],
};

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Weather & HKO Alert Simulator API" });
});

// API: Hong Kong Observatory Real-Time Weather & Warnings
app.get("/api/hko/weather", async (req, res) => {
  try {
    // Attempt live fetch from official Hong Kong Observatory Open Data endpoints
    const rhrPromise = fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en", { signal: AbortSignal.timeout(3000) });
    const warnPromise = fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en", { signal: AbortSignal.timeout(3000) });
    const fndPromise = fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en", { signal: AbortSignal.timeout(3000) });

    const [rhrRes, warnRes, fndRes] = await Promise.allSettled([rhrPromise, warnPromise, fndPromise]);

    let liveData = { ...SAMPLE_HKO_WEATHER };

    if (rhrRes.status === "fulfilled" && rhrRes.value.ok) {
      const rhr = await rhrRes.value.json();
      if (rhr.temperature?.data?.[0]?.value) {
        liveData.temp = rhr.temperature.data[0].value;
      }
      if (rhr.humidity?.data?.[0]?.value) {
        liveData.humidity = rhr.humidity.data[0].value;
      }
      if (rhr.rainfall?.data?.[0]?.max) {
        liveData.rainfallPastHour = rhr.rainfall.data[0].max;
      }
      if (rhr.uvindex?.data?.[0]?.value) {
        liveData.uvIndex = rhr.uvindex.data[0].value;
      }
      if (rhr.icon?.[0]) {
        liveData.condition = rhr.specialReferredText || "Official HKO Weather Observation";
      }
    }

    if (warnRes.status === "fulfilled" && warnRes.value.ok) {
      const warnObj = await warnRes.value.json();
      const activeWarnings: any[] = [];
      Object.entries(warnObj).forEach(([key, val]: [string, any]) => {
        if (val && val.name) {
          activeWarnings.push({
            code: key,
            name: val.name,
            type: val.code?.includes("TC") ? "cyclone" : val.code?.includes("RAIN") ? "rainstorm" : "special",
            level: val.actionCode || "Active",
            issueTime: val.issueTime || new Date().toISOString(),
            headline: `${val.name} in force.`,
            details: `Official HKO Warning issued at ${val.issueTime || "recent hours"}.`,
            severity: val.code?.includes("TC8") || val.code?.includes("BLACK") ? "extreme" : "moderate",
          });
        }
      });
      if (activeWarnings.length > 0) {
        liveData.hkoWarnings = activeWarnings;
      }
    }

    if (fndRes.status === "fulfilled" && fndRes.value.ok) {
      const fndObj = await fndRes.value.json();
      if (fndObj.weatherForecast?.length) {
        liveData.dailyForecast = fndObj.weatherForecast.map((item: any, idx: number) => ({
          date: item.forecastDate,
          dayName: item.week?.substring(0, 3) || `Day ${idx + 1}`,
          maxTemp: item.forecastMaxtemp?.value || 30,
          minTemp: item.forecastMintemp?.value || 25,
          humidityMax: item.forecastMaxrh?.value || 90,
          humidityMin: item.forecastMinrh?.value || 70,
          condition: item.forecastWeather || "Sunny Intervals",
          rainProb: item.PSR === "High" ? 80 : item.PSR === "Medium High" ? 60 : 30,
          windDesc: item.forecastWind || "Moderate Winds",
          uvIndexMax: 8,
        }));
      }
    }

    res.json(liveData);
  } catch (err) {
    console.warn("HKO API fetch fallback used:", err);
    res.json(SAMPLE_HKO_WEATHER);
  }
});

// API: Global Coordinates Weather Generator / Proxy
app.get("/api/global/weather", async (req, res) => {
  const { lat = "22.3193", lon = "114.1694", name = "Global Location" } = req.query;
  const latNum = parseFloat(lat as string);
  const lonNum = parseFloat(lon as string);

  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const fetchRes = await fetch(openMeteoUrl, { signal: AbortSignal.timeout(4000) });
    if (fetchRes.ok) {
      const om = await fetchRes.json();
      const current = om.current || {};
      const daily = om.daily || {};
      const hourly = om.hourly || {};

      const weatherData = {
        location: {
          id: `loc_${latNum.toFixed(2)}_${lonNum.toFixed(2)}`,
          name: name as string,
          region: `Coordinates (${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°)`,
          country: "Global",
          lat: latNum,
          lon: lonNum,
          elevation: 50,
          isHKO: Math.abs(latNum - 22.3) < 0.5 && Math.abs(lonNum - 114.1) < 0.5,
        },
        timestamp: new Date().toISOString(),
        temp: current.temperature_2m ?? 24.5,
        feelsLike: current.apparent_temperature ?? 25.0,
        humidity: current.relative_humidity_2m ?? 65,
        pressure: current.surface_pressure ?? 1012.0,
        windSpeed: current.wind_speed_10m ?? 12,
        windGust: current.wind_gusts_10m ?? 20,
        windDirection: current.wind_direction_10m ?? 180,
        windDirectionText: getWindDirText(current.wind_direction_10m ?? 180),
        condition: current.rain > 1.0 ? "Rainy" : current.precipitation > 0.1 ? "Light Rain" : "Partly Cloudy",
        conditionCode: current.rain > 1.0 ? "heavy_rain" : "cloudy",
        uvIndex: 6,
        visibility: 10.0,
        airQualityIndex: 2,
        rainfallPastHour: current.rain ?? 0,
        hourlyForecast: (hourly.time || []).slice(0, 12).map((t: string, i: number) => ({
          time: t.substring(11, 16),
          temp: hourly.temperature_2m?.[i] ?? 24,
          rainProb: hourly.precipitation_probability?.[i] ?? 10,
          rainfall: hourly.precipitation?.[i] ?? 0,
          windSpeed: hourly.wind_speed_10m?.[i] ?? 10,
          condition: (hourly.precipitation?.[i] ?? 0) > 0.5 ? "Showers" : "Partly Cloudy",
        })),
        dailyForecast: (daily.time || []).slice(0, 7).map((d: string, i: number) => ({
          date: d,
          dayName: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
          maxTemp: daily.temperature_2m_max?.[i] ?? 26,
          minTemp: daily.temperature_2m_min?.[i] ?? 18,
          humidityMax: 85,
          humidityMin: 55,
          condition: (daily.precipitation_sum?.[i] ?? 0) > 5 ? "Rain / Thunder" : "Sunny Intervals",
          rainProb: daily.precipitation_probability_max?.[i] ?? 20,
          windDesc: `${daily.wind_speed_10m_max?.[i] ?? 15} km/h max wind`,
          uvIndexMax: 7,
        })),
        specialTips: [`Live atmospheric data derived from global meteorology stations at (${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°)`],
      };

      return res.json(weatherData);
    }
  } catch (e) {
    console.warn("Global Open-Meteo fallback:", e);
  }

  // Pure deterministic fallback for global location
  res.json({
    location: {
      id: `loc_${latNum.toFixed(2)}_${lonNum.toFixed(2)}`,
      name: name as string,
      region: "Global Station",
      country: "International",
      lat: latNum,
      lon: lonNum,
      elevation: 20,
      isHKO: false,
    },
    timestamp: new Date().toISOString(),
    temp: 25.0,
    feelsLike: 26.2,
    humidity: 70,
    pressure: 1013.2,
    windSpeed: 16,
    windGust: 28,
    windDirection: 135,
    windDirectionText: "Southeast",
    condition: "Partly Cloudy",
    conditionCode: "cloudy",
    uvIndex: 6,
    visibility: 10.0,
    airQualityIndex: 2,
    rainfallPastHour: 0,
    hourlyForecast: [
      { time: "12:00", temp: 25, rainProb: 15, rainfall: 0, windSpeed: 14, condition: "Partly Cloudy" },
      { time: "15:00", temp: 26, rainProb: 20, rainfall: 0, windSpeed: 16, condition: "Sunny Intervals" },
      { time: "18:00", temp: 24, rainProb: 10, rainfall: 0, windSpeed: 12, condition: "Fair" },
    ],
    dailyForecast: [
      { date: "2026-08-03", dayName: "Today", maxTemp: 27, minTemp: 21, humidityMax: 80, humidityMin: 60, condition: "Partly Cloudy", rainProb: 20, windDesc: "Light Breeze", uvIndexMax: 7 },
      { date: "2026-08-04", dayName: "Tue", maxTemp: 28, minTemp: 22, humidityMax: 82, humidityMin: 58, condition: "Sunny", rainProb: 10, windDesc: "Moderate Breeze", uvIndexMax: 8 },
    ],
  });
});

// API: Global City & Country Geocoding Search (Powered by Open-Meteo Geocoding)
app.get("/api/global/search", async (req, res) => {
  const { q = "" } = req.query;
  const query = (q as string).trim();

  if (!query) {
    return res.json({ locations: [] });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=en&format=json`;
    const response = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });

    if (response.ok) {
      const data = await response.json();
      const results = (data.results || []).map((item: any) => {
        const country = item.country || "Global";
        const region = item.admin1 || item.country || "District";
        const name = item.name || query;
        const lat = item.latitude;
        const lon = item.longitude;
        const isHK = country.toLowerCase().includes("hong kong") || (Math.abs(lat - 22.3) < 0.4 && Math.abs(lon - 114.1) < 0.4);

        return {
          id: `geo_${item.id || Math.random().toString(36).substring(2, 7)}`,
          name: `${name}`,
          region: region,
          country: country,
          lat: lat,
          lon: lon,
          elevation: Math.round(item.elevation || 15),
          isHKO: isHK,
        };
      });

      return res.json({ locations: results });
    }
  } catch (err) {
    console.warn("Geocoding API search fallback:", err);
  }

  return res.json({ locations: [] });
});

// API: AI Gemini Weather Scenario Analysis & Regional Trend Forecasting
app.post("/api/gemini/weather-analysis", async (req, res) => {
  try {
    const { mode, simulationParams, regionalParams } = req.body;

    if (mode === "simulation") {
      const prompt = `You are a Senior Meteorological Specialist and Climate Risk Analyst.
Analyze this user-defined weather simulation scenario and historical parameter setup:
Location: ${simulationParams.locationName} (Lat: ${simulationParams.lat}, Lon: ${simulationParams.lon}, Elevation: ${simulationParams.elevationMeters}m)
Parameters:
- Base Temp: ${simulationParams.baseTempC}°C (Offset: ${simulationParams.tempOffsetC}°C)
- Sea Surface Temp (SST): ${simulationParams.seaSurfaceTempC}°C
- Central Pressure Drop: ${simulationParams.centralPressureDropHpa} hPa (Min pressure ~ ${1013.25 - simulationParams.centralPressureDropHpa} hPa)
- Relative Humidity: ${simulationParams.relativeHumidityPct}%
- Wind Shear: ${simulationParams.windShearKts} knots
- CO2 Baseline: ${simulationParams.co2Ppm} ppm
- Urban Heat Island Factor: ${simulationParams.urbanHeatIslandFactor}

Please provide a concise, structured expert assessment in JSON format with the following key fields:
1. "overview": A 2-sentence summary of the physics and thermodynamic severity.
2. "comparisonToHistorical": Compare this simulation to real historical severe weather events (e.g. Typhoon Mangkhut 2018, Saola 2023, Black Rainstorm, 100-year heatwaves).
3. "coastalAndSurgeImpact": Detailed assessment of storm surge, wave run-up, and coastal flooding risk.
4. "urbanInfrastructureRisk": Aviation shutdowns, power grid resilience, landslide hazards, and building curtain wall safety.
5. "disasterPreparednessAdvice": 4 actionable mitigation recommendations for emergency services and civil defense.

Respond ONLY with valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return res.json({ success: true, result: JSON.parse(response.text || "{}") });
    } else if (mode === "trend_forecast") {
      const prompt = `You are a Global Climate Modeling Specialist specializing in IPCC regional trend projections.
Provide a regional climate trend forecast for:
Region: ${regionalParams.regionName} (Coordinates: ${regionalParams.coordinates})
Horizon: ${regionalParams.targetHorizon || "2040"}

Please analyze:
1. "summary": Executive summary of climate trends for this region towards ${regionalParams.targetHorizon}.
2. "temperatureAndPrecipitationTrend": Annual mean temp change, extreme heat day frequency, and torrential rainfall shifts.
3. "severeWeatherShift": Typhoon/hurricane frequency & intensity changes, storm surge elevation risks.
4. "socioEconomicVulnerability": Critical infrastructure, water security, coastal erosion, and agriculture risks.
5. "strategicAdaptations": 4 high-priority regional climate adaptation and coastal defense strategies.

Respond ONLY with valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return res.json({ success: true, result: JSON.parse(response.text || "{}") });
    }

    res.status(400).json({ error: "Invalid mode. Expected 'simulation' or 'trend_forecast'." });
  } catch (err: any) {
    console.error("Error calling Gemini API:", err);
    res.status(500).json({
      error: "Failed to generate AI weather analysis",
      details: err.message || String(err),
    });
  }
});

function getWindDirText(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Start Server with Vite Middleware in Dev Mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
