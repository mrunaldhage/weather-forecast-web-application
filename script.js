const userLocation = document.getElementById("userLocation"),
  converter = document.getElementById("converter"),
  weatherIcon = document.querySelector(".weatherIcon"),
  temperature = document.querySelector(".temperature"),
  feelsLike = document.querySelector(".feelsLike"),
  description = document.querySelector(".description"),
  date = document.querySelector(".date"),
  city = document.querySelector(".city"),

  HValue = document.getElementById("HValue"),
  WValue = document.getElementById("WValue"),
  SRValue = document.getElementById("SRValue"),
  SSValue = document.getElementById("SSValue"),
  CValue = document.getElementById("CValue"),
  UVValue = document.getElementById("UVValue"),
  PValue = document.getElementById("PValue"),

  Forecast = document.querySelector(".Forecast");

const API_KEY = "YOUR_OPENWEATHER_API_KEY";

const WEATHER_API =
  `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;

const FORECAST_API =
  `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}`;

/* ---------- HELPER FUNCTIONS ---------- */
function getCityDateTime(offset) {
  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  return new Date(utc + offset * 1000);
}

function formatTime(dt, offset) {
  const time = new Date((dt + offset) * 1000);
  return time.toUTCString().slice(-12, -4);
}

/* ---------- MAIN FUNCTION ---------- */
function findUserLocation() {

  if (!userLocation.value.trim()) {
    alert("Please enter a city name");
    return;
  }

  Forecast.innerHTML = "<p style='text-align:center'>Loading...</p>";

  fetch(`${WEATHER_API}&q=${userLocation.value}`)
    .then(res => res.json())
    .then(data => {

      if (data.cod !== 200) {
        alert(data.message);
        return;
      }

      /* ---------- LEFT PANEL ---------- */
      city.innerHTML = `${data.name}, ${data.sys.country}`;

      let temp = data.main.temp;
      let feels = data.main.feels_like;

      if (converter.value === "°F") {
        temp = (temp * 9) / 5 + 32;
        feels = (feels * 9) / 5 + 32;
        temperature.innerHTML = Math.round(temp) + "°F";
        feelsLike.innerHTML = "Feels like " + Math.round(feels) + "°F";
      } else {
        temperature.innerHTML = Math.round(temp) + "°C";
        feelsLike.innerHTML = "Feels like " + Math.round(feels) + "°C";
      }

      description.innerHTML =
        `<i class="fa-solid fa-cloud"></i> ` +
        data.weather[0].description;

      weatherIcon.style.background =
        `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;

      const localDate = getCityDateTime(data.timezone);
      date.innerHTML = localDate.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      /* ---------- HIGHLIGHTS ---------- */
      HValue.innerHTML = data.main.humidity + "%";
      WValue.innerHTML = data.wind.speed + " m/s";
      CValue.innerHTML = data.clouds.all + "%";
      PValue.innerHTML = data.main.pressure + " hPa";

      SRValue.innerHTML = formatTime(data.sys.sunrise, data.timezone);
      SSValue.innerHTML = formatTime(data.sys.sunset, data.timezone);

      UVValue.innerHTML = "N/A"; // Free API limitation

      /* ---------- FORECAST ---------- */
      fetch(`${FORECAST_API}&q=${userLocation.value}`)
        .then(res => res.json())
        .then(forecast => {

          Forecast.innerHTML = "";
          const daily = {};

          forecast.list.forEach(item => {
            const local = new Date((item.dt + data.timezone) * 1000);
            const key = local.toDateString();

            if (!daily[key]) {
              daily[key] = {
                date: local,
                temps: [],
                icon: item.weather[0].icon,
                desc: item.weather[0].description
              };
            }
            daily[key].temps.push(item.main.temp);
          });

          Object.values(daily).slice(0, 7).forEach(day => {
            let min = Math.min(...day.temps);
            let max = Math.max(...day.temps);

            if (converter.value === "°F") {
              min = (min * 9) / 5 + 32;
              max = (max * 9) / 5 + 32;
            }

            Forecast.innerHTML += `
              <div class="forecast-item">
                <p>${day.date.toDateString()}</p>
                <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png">
                <p>${day.desc}</p>
                <p>${Math.round(min)}° - ${Math.round(max)}°</p>
              </div>`;
          });
        });
    })
    .catch(() => alert("Error fetching weather data"));
}

/* ---------- EVENTS ---------- */
converter.addEventListener("change", () => {
  if (userLocation.value) findUserLocation();
});

userLocation.addEventListener("keypress", e => {
  if (e.key === "Enter") findUserLocation();
});
