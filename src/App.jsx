import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const API_KEY = "d85914d1b4e5a7d2223aee9ec1758319";

  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [search, setSearch] = useState("Meerut");
  const [unit, setUnit] = useState("metric");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    loadGPS();
  }, [unit]);

  function loadGPS() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        fetchWeatherByCity("Meerut");
      }
    );
  }

  async function fetchWeatherByCoords(lat, lon) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
    );
    const data = await res.json();

    if (data.cod === 200) {
      setWeather(data);
      fetchForecast(lat, lon);
      fetchAQI(lat, lon);
    }
  }

  async function fetchWeatherByCity(city) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`
    );
    const data = await res.json();

    if (data.cod === 200) {
      setWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
      fetchAQI(data.coord.lat, data.coord.lon);
    }
  }

  async function fetchForecast(lat, lon) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
    );
    const data = await res.json();

    if (data.cod === "200") {
      setHourly(data.list.slice(0, 8));

      const days = data.list.filter((x) =>
        x.dt_txt.includes("12:00:00")
      );

      setDaily(days.slice(0, 5));
    }
  }

  async function fetchAQI(lat, lon) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const data = await res.json();

    if (data.list?.length > 0) {
      setAqi(data.list[0].main.aqi);
    }
  }

  function icon(main) {
    const m = main.toLowerCase();

    if (m.includes("clear")) return "☀️";
    if (m.includes("cloud")) return "☁️";
    if (m.includes("rain")) return "🌧️";
    if (m.includes("snow")) return "❄️";

    return "🌤️";
  }

  const unitLabel = unit === "metric" ? "°C" : "°F";

  if (!weather) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="wrap">

        <div className="glass">
          <div className="brand">WeatherIQ</div>

          <div className="mono clock">
            {time.toLocaleTimeString()}
          </div>

          <div className="subtext">
            {time.toDateString()}
          </div>
        </div>

        <div className="glass">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchWeatherByCity(search);
            }}
            placeholder="Search city..."
          />
        </div>

        <div className="glass switchBox">
          <button
            className={`btn ${unit === "metric" ? "active" : ""}`}
            onClick={() => setUnit("metric")}
          >
            °C
          </button>

          <button
            className={`btn ${unit === "imperial" ? "active" : ""}`}
            onClick={() => setUnit("imperial")}
          >
            °F
          </button>
        </div>

        <div className="glass">
          <div className="mono city">{weather.name}</div>

          <div className="mainWeather">
            <div>
              <div className="mono temp">
                {Math.round(weather.main.temp)}
                {unitLabel}
              </div>

              <div className="subtext">
                {weather.weather[0].main}
              </div>
            </div>

            <div className="emoji">
              {icon(weather.weather[0].main)}
            </div>
          </div>
        </div>

        <div className="glass">
          <div className="sectionTitle">Air & Details</div>

          <div className="card">AQI: {aqi}</div>
          <div className="card">
            Visibility: {(weather.visibility / 1000).toFixed(1)} km
          </div>
          <div className="card">
            Humidity: {weather.main.humidity}%
          </div>
          <div className="card">
            Wind: {weather.wind.speed} m/s
          </div>
          <div className="card">
            Pressure: {weather.main.pressure}
          </div>
        </div>

        <div className="glass">
          <div className="sectionTitle">Hourly Forecast</div>

          <div className="scroll">
            {hourly.map((h, i) => (
              <div key={i} className="card hourCard">
                <div>
                  {new Date(h.dt_txt).toLocaleTimeString([], {
                    hour: "numeric",
                  })}
                </div>

                <div className="smallEmoji">
                  {icon(h.weather[0].main)}
                </div>

                <div className="mono">
                  {Math.round(h.main.temp)}°
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <div className="sectionTitle">Daily Forecast</div>

          {daily.map((day, i) => (
            <div key={i} className="card dailyCard">
              <div>
                {new Date(day.dt_txt).toDateString()}
              </div>

              <div>
                {icon(day.weather[0].main)}{" "}
                {Math.round(day.main.temp)}°
              </div>
            </div>
          ))}
        </div>

        <div className="glass">
          <div className="uvTitle">☀️ UV Index</div>

          <div className="mono bigText">
            8 High
          </div>

          <div className="subtext">
            Use sunscreen & cap outdoors
          </div>
        </div>

        <div className="glass">
          <div className="uvTitle">🌡️ Feels Like</div>

          <div className="mono bigText">
            {Math.round(weather.main.feels_like)}°
          </div>

          <div className="subtext">
            Feels hotter due to humidity
          </div>
        </div>

      </div>
    </div>
  );
}