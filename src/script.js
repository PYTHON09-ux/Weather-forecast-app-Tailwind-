// Global variables
const userLocation = document.getElementById("userLocation");
const converter = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelslike = document.querySelector(".feelslike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");
const errorContainer = document.getElementById("errorContainer");
const recentCitiesList = document.getElementById("recentCitiesList");

const HValue = document.querySelector("#HValue");
const WValue = document.querySelector("#WValue");
const SRValue = document.querySelector("#SRValue");
const SSValue = document.querySelector("#SSValue");
const CValue = document.querySelector("#CValue");
const UVValue = document.querySelector("#UVValue");
const PValue = document.querySelector("#PValue");

const Forecast = document.querySelector(".Forecast");

// Recent searches handling
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

function saveRecentSearch(cityName) {
    if (!recentSearches.includes(cityName)) {
        recentSearches.unshift(cityName);
        if (recentSearches.length > 5) {
            recentSearches.pop();
        }
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        updateRecentSearchesDropdown();
    }
}

function updateRecentSearchesDropdown() {
    recentCitiesList.innerHTML = '';
    recentSearches.forEach(city => {
        const li = document.createElement('li');
        li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
        li.textContent = city;
        li.onclick = () => {
            userLocation.value = city;
            findUserLocation();
            recentCitiesList.classList.add('hidden');
        };
        recentCitiesList.appendChild(li);
    });
}

// Show/hide dropdown on input focus
userLocation.addEventListener('focus', () => {
    if (recentSearches.length > 0) {
        recentCitiesList.classList.remove('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (!userLocation.contains(e.target) && !recentCitiesList.contains(e.target)) {
        recentCitiesList.classList.add('hidden');
    }
});

// Error handling function
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 3000);
}

// Input validation
function validateInput(location) {
    if (!location.trim()) {
        showError('Please enter a location');
        return false;
    }
    return true;
}

// Get city name based on GPS
function getCityName() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch location');
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || "City not found";
                userLocation.value = city;
                findUserLocation();
            } catch (error) {
                showError("Error fetching city name: " + error.message);
            }
        }, () => {
            showError("Unable to access your location");
        });
    } else {
        showError("Geolocation is not supported by your browser");
    }
}

async function findUserLocation() {
    if (!validateInput(userLocation.value)) return;

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=552fcd97b3254a8c9d282304241811&q=${userLocation.value}&days=8`);
        if (!response.ok) throw new Error('Location not found');
        
        const data = await response.json();
        updateWeatherUI(data);
        saveRecentSearch(userLocation.value);
    } catch (error) {
        showError(error.message);
    }
}

function updateWeatherUI(data) {
    // Clear previous forecast
    Forecast.innerHTML = "";

    // Update current weather
    city.innerHTML = `${data.location.name},&nbsp${data.location.region},&nbsp${data.location.country}`;
    weatherIcon.style.background = `url(${data.current.condition.icon})`;
    weatherIcon.classList.add("object-cover")
    date.innerHTML = `${convertDateFormat(data.location.localtime)}`;

    let temp = tempconvertor(data.current.temp_c, data.current.temp_f);
    let feels_like = feelsLikeConvertor(data.current.feelslike_c, data.current.feelslike_f);

    temperature.innerHTML = `${temp}`;
    feelslike.innerHTML = `Feels Like ${feels_like}`;
    description.innerHTML = `<i class="fa-brands fa-cloudversify"></i>&nbsp${data.current.condition.text}`;
    
    // Update highlights
    HValue.innerHTML = `${data.current.humidity}<span class="text-sm"> %</span>`;
    WValue.innerHTML = `${data.current.wind_mph}<span class="text-sm"> mph</span>`;
    SRValue.innerHTML = data.forecast.forecastday[0].astro.sunrise;
    SSValue.innerHTML = data.forecast.forecastday[0].astro.sunset;
    CValue.innerHTML = `${data.current.cloud}<span class="text-sm"> %</span>`;
    UVValue.innerHTML = data.current.uv;
    PValue.innerHTML = `${data.current.pressure_mb}<span class="text-sm"> mb</span>`;

    data.forecast.forecastday.slice(1).forEach(element => {
        console.log(element)
        const div = document.createElement("div");
        div.className = "bg-blue-50 p-3 se:p-4 rounded-lg";
        div.innerHTML = `
            <p class="text-gray-600 text-sm se:text-base text-center">${convertDateFormat(element.date).split("", 11).join("")}</p>
            <img src="${element.day.condition.icon}" class="w-12 h-12 se:w-16 se:h-16 mx-auto my-2"/>
            <p class="text-xs se:text-sm text-center text-gray-700 mb-2">${element.day.condition.text}</p>
            <div class="flex justify-between text-xs se:text-sm">
                <span>  <span class="font-bold">Min</span> ${tempconvertor(element.day.mintemp_c, element.day.mintemp_f)}</span>
                <span> <span class="font-bold">Max</span> ${tempconvertor(element.day.maxtemp_c, element.day.maxtemp_f)}</span>
            </div>
             <p class="text-xs se:text-sm text-left mb-2"> <span class="font-bold"> Humidity </span> ${element.day.avghumidity}</p>
             <p class="text-xs se:text-sm text-left mb-2"> <span class="font-bold">Wind </span>${element.day.maxwind_mph}</p>
        `;
        Forecast.appendChild(div);
    });
}

// Temperature conversion functions
function tempconvertor(temp1, temp2) {
    return converter.value == "°C" ? `${temp1}<small>°C</small>` : `${temp2}<small>°F</small>`;
}

function feelsLikeConvertor(ftemp1, ftemp2) {
    return converter.value == "°C" ? `${ftemp1}<small>°C</small>` : `${ftemp2}<small>°F</small>`;
}

// Date formatting
function convertDateFormat(dateString) {
    const date = new Date(dateString);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Temperature unit conversion listener
converter.addEventListener('change', () => {
    if (userLocation.value) {
        findUserLocation();
    }
});