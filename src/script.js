

const userLocation= document.getElementById("userLocation");
const converter =document.getElementById("converter");
const weatherIcon= document.querySelector(".weatherIcon");
const temperature = document.querySelector(".temperature");
const feelslike =document.querySelector(".feelslike");
const description= document.querySelector(".description");

const date =document.querySelector(".date");
const city= document.querySelector(".city");

const HValue = document.querySelector("#HValue");
const WValue = document.querySelector("#WValue");
const SRValue = document.querySelector("#SRValue");
const SSValue = document.querySelector("#SSValue");
const CValue = document.querySelector("#CValue");
const UVValue = document.querySelector("#UVValue");
const PValue =document.querySelector("#PValue");

const Forecast= document.querySelector(".Forecast");
//Global variable temperature;

// -------------------------- get city name based on gps -----------------------------
function getCityName() {
    // Check if Geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            // Nominatim Reverse Geocoding API URL
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                console.log(data)

                // Get the city name from the address
                const city = data.address.city || data.address.town || data.address.village || "City not found";
                userLocation.value=city
                alert(`Current City: ${city}`) ;
                findUserLocation();

            } catch (error) {
                console.error("Error fetching city name:", error);
                document.getElementById("cityName").innerText = "Unable to fetch city name";
            }
        }, () => {
            alert("Unable to access your location");
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}


function findUserLocation(){

    Forecast.innerHTML="";
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=552fcd97b3254a8c9d282304241811&q=${userLocation.value}&days=8`)
    .then((res)=> res.json().then((data)=>{
        console.log(data)

        // ---------------- adding values to the divs--------------------------
        city.innerHTML= `${data.location.name},&nbsp${data.location.region},&nbsp${data.location.country}`;
        weatherIcon.style.background=`url(${data.current.condition.icon})`;
        date.innerHTML=`${convertDateFormat(data.location.localtime)}`;

        let temp =tempconvertor(data.current.temp_c, data.current.temp_f);
        let feels_like= feelsLikeConvertor(data.current.feelslike_c, data.current.feelslike_f)

        temperature.innerHTML=`${temp}`;
        feelslike.innerHTML=`Feels Like ${feels_like}`;
        description.innerHTML=`<i class=" fa-brands fa-cloudversify"> </i> &nbsp ${data.current.condition.text}`
        HValue.innerHTML=`${data.current.humidity} <span> %</span>`;
        WValue.innerHTML=`${data.current.wind_mph}<span> mph</span>`;
        
        SRValue.innerHTML=`${data.forecast.forecastday[0].astro.sunrise}`;
        SSValue.innerHTML=`${data.forecast.forecastday[0].astro.sunset}`;
        CValue.innerHTML=`${data.current.cloud}<span> %</span>`;
        UVValue.innerHTML=data.current.uv;
        PValue.innerHTML=`${data.current.pressure_mb}<span>mb</span>`;


        // ----------------- adding forecast values -----------------

        data.forecast.forecastday.slice(1).forEach(element => {
            let div= document.createElement("div");
            div.classList.add("forecast-child-divs")
            Forecast.appendChild(div);
            div.innerHTML+=`<p class="forecast-date"> ${convertDateFormat(element.date).split("",11).join("")}<p>`
            div.innerHTML+=`<img src=" ${element.day.condition.icon}"/>`
            div.innerHTML+=`<p class="forecast-des"> ${element.day.condition.text} </p>`
            div.innerHTML+=` <span class="forecast-temp-diff"> <span> Min ${tempconvertor(element.day.mintemp_c, element.day.mintemp_f)}</span> <span> Max ${tempconvertor(element.day.maxtemp_c, element.day.maxtemp_f)}</span> </span>`
            
        });

                })
                .catch((err) => console.error("Error in second fetch:", err))
            );

}


function tempconvertor(temp1, temp2){
    if(converter.value=="°C"){
       return `${temp1}<small>°C</small> `;
    }
    else{
        return `${temp2}<small>°F</small> `;
    }
}


function feelsLikeConvertor(ftemp1, ftemp2){
    if(converter.value=="°C"){
           return `${ftemp1}<small>°C</small> `;
        }
        else{
            return `${ftemp2}<small>°F</small> `;
        }
}



fetch(`http://api.weatherapi.com/v1/alerts.json?key=552fcd97b3254a8c9d282304241811&q=kolhapur`)
.then((res)=> res.json().then((data)=>console.log(data)))





function convertDateFormat(dateString) {
    // Create a new Date object from the input string
    const date = new Date(dateString);

    // Array of month names
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Extract the day, month, and year
    const day = date.getDate();
    const month = months[date.getMonth()]; // Get the month name
    const year = date.getFullYear();

    // Return the formatted date as "DD Month YYYY"
    return `${day} ${month} ${year}`;
}




// ------------------------------ get city name ----------------------------------