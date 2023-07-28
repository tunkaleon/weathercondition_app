const cityInput = document.querySelector(".city_input");
const searchButton = document.querySelector(".searchbox");
const currentCardsDiv = document.querySelector(".current-weather");
const locationButton = document.querySelector(".locationbox");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_key = "77a27033b3d82347f34397d7ed6662cf";

const createWeatherCard = (cityName, weatherItem , index) =>{
    if(index === 0){// current weather
        return`
            <div class="current-weather">
                <div class="details">
                    <h3>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}<sup>o</sup>C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <H4>Humiduty: ${weatherItem.main.humidity}%</H4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>
            </div>`;
    }
    else{
        return `                        
        <li class="card">
            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}<sup>o</sup>C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <H4>Humiduty: ${weatherItem.main.humidity}%</H4>
        </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_key}`;
    fetch(WEATHER_API_URL).then(res => res.json()).then(data =>{
        

        //Filter the forecasts to get only one forecast per day

        const uniqueForecastDays = [];
       const fivedaysforecast = data.list.filter(forecast => {
            const forecastDate =new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });
        //clearing previous weather data
        cityInput.value = "";
        currentCardsDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        //creating weather cards and adding them to the DOM
        fivedaysforecast.forEach((weatherItem, index )=>{
            if(index === 0){
                currentCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index)); 
            }
            else{
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index)); 
            }       
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");
    });
}
const getCityCoordinates = () =>{
    //get user entered city name and remove extra spaces
    const cityName = cityInput.value.trim(); 
    if(!cityName) return; //return if cityName is empty?
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_key}`;
    //get entered city coordinates
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
}
const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            const{latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_key}`;

            //get city name from coordinates using reverse geocoding API

            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const {name} = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occured while fetching city!");
            });
        },
        error =>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. please reset location permission to grant again");
            }
        }
    );
}
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
