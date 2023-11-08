const getWeatherData = async function(location, url) {
  try {
    const response = await fetch(`${url}&q=${location}`, {mode: 'cors'});
    if (!response.ok) {
      throw new Error (`${response.status} ${response.statusText}`)
    }
    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.log(error);
  } 
}

const getCurrentWeatherData = async function(location) {
  return getWeatherData(location, 'https://api.weatherapi.com/v1/current.json?key=3255cce3a50f471d96e232823230711');
}

const getForecastWeatherData = async function(location) {
  return getWeatherData(location, 'https://api.weatherapi.com/v1/forecast.json?key=3255cce3a50f471d96e232823230711&days=3');
}

const getProcessedWeatherObject = async function(location) {
  const weatherData = await getForecastWeatherData(location);
  const weatherObject = {
    location: {
      country: weatherData.location.country,
      name: weatherData.location.name
    },
    current: {
      condition: weatherData.current.condition.text,
      temp_c: weatherData.current.temp_c,
      temp_f: weatherData.current.temp_f,
      wind_mph: weatherData.current.wind_mph,
      wind_kph: weatherData.current.wind_kph
    },
    forecast: []
  }

  weatherData.forecast.forecastday.forEach((dayData) => {
    const dayObject = {
      date: dayData.date,
      day: {
        avgtemp_c: dayData.day.avgtemp_c,
        avgtemp_f: dayData.day.avgtemp_f,
        condition: dayData.day.condition.text,
        daily_chance_of_rain: dayData.day.daily_chance_of_rain,
        mintemp_c: dayData.day.mintemp_c,
        maxtemp_c: dayData.day.maxtemp_c,
        maxtemp_f: dayData.day.maxtemp_f,
        mintemp_f: dayData.day.mintemp_f,

      }
    };
    weatherObject.forecast.push(dayObject);
  });

  return weatherObject;
}

const DOMController = (function () {
  let metric = false;
  const locationInput = document.getElementById('location');
  const locationForm = document.querySelector('form');
  const locationH1 = document.getElementById('location-name');
  const currentConditionH3 = document.getElementById('current-condition');
  const currentTempP = document.getElementById('current-temp');
  const currentWindP = document.getElementById('current-wind');
  const unitSwitchBtn = document.getElementById('unit-switch-btn');
  const forecastContentDiv = document.getElementById('forecast-content');
  let weather;

  const render = function() {
    if (!weather) {
      return
    }
    console.log(weather);
    locationH1.textContent = `${weather.location.name}, ${weather.location.country}`;
    currentConditionH3.textContent = weather.current.condition;
    currentTempP.textContent = metric ? `${weather.current.temp_c} \u00B0C` : `${weather.current.temp_f} \u00B0F`;
    currentWindP.textContent = metric ? `${weather.current.wind_kph} kph` : `${weather.current.wind_mph} mph`;
    unitSwitchBtn.textContent = metric ? 'Imperial' : 'Metric';
    forecastContentDiv.textContent = '';
    weather.forecast.forEach((day) => {
      const dayDiv = document.createElement('div');
      const dateH3 = document.createElement('h3');
      const tempP = document.createElement('p');
      const tempAvP = document.createElement('p');
      const conditionH4 = document.createElement('h4');
      const rainChanceP = document.createElement('p');
      dateH3.textContent = day.date;
      conditionH4.textContent = day.day.condition;
      tempP.textContent = `Temperature: ${metric ? `${day.day.mintemp_c} - ${day.day.maxtemp_c} \u00B0C` : `${day.day.mintemp_f} - ${day.day.maxtemp_f} \u00B0F`}`;
      tempAvP.textContent = `Avg. Temperature: ${metric ? `${day.day.avgtemp_c} \u00B0C` : `${day.day.avgtemp_f}\u00B0F`}`;
      rainChanceP.textContent = `Chance of Rain: ${day.day.daily_chance_of_rain}%`

      
      dayDiv.appendChild(dateH3);
      dayDiv.appendChild(conditionH4);
      dayDiv.appendChild(tempP);
      dayDiv.appendChild(tempAvP);
      dayDiv.appendChild(rainChanceP);
      forecastContentDiv.appendChild(dayDiv);
    })
  }

  const updateLocation = function (e) {
    e.preventDefault();
    getProcessedWeatherObject(locationInput.value)
    .then((data) => {
      weather = data;
      locationInput.value = '';
      render();
    });
  }

  addEventListener('load', updateLocation);
  locationForm.addEventListener('submit', updateLocation);
  unitSwitchBtn.addEventListener('click', () => {
    metric = !metric;
    render();
  });

  render();

})();