let temp = document.querySelector(".temp");
let highTemp = document.querySelector(".HighNotation");
let lowTemp = document.querySelector(".LowNotation");
let upperDescription = document.querySelector(".upperLine")
let address = document.querySelector(".rightPart")
let windSpeed = document.querySelector(".leftPart")
let form = document.querySelector('.input-form')
let formInput = document.querySelector('#input')
let inputButton = document.querySelector('input-button')
let timeBlock = document.querySelector(".timeBlock")
let dateBlock = document.querySelector(".date")
let yearBlock = document.querySelector(".yearDay .year")
let dayBlock = document.querySelector(".yearDay .day")
let humidityBlock = document.querySelector(".humidity")
let popCities = document.querySelector(".recentSearches")
let video = document.getElementById("backgroundVideo")
const directions = ['North', 'North East', 'East', 'South East', 'South', 'South West', 'West', 'North West'];
let countryCode;
const dateNames = [
    "Sunday", "Monday", "Tuesday",
    "Wednesday", "Thrusday", "Friday",
    "Saturday"
]
let myChart;

function getWindDirection(deg) {
    const index = Math.round(deg / 45) % 8;
    return directions[index];
}
function getVideoPath (desc) {
    if(desc.includes("clear"))
    {
        return "vids/clear.webm";
    }
    else if (desc.includes("clouds") || desc.includes("mist"))
    {
        return "vids/cloudy.webm";
    }
    else if (desc.includes("haze") )
    {
        return "vids/haze.webm";
    }
    else if (desc.includes("thunderstorm") || desc.includes("squalls"))
    {
        return "vids/stormy.webm";
    }
    else if (desc.includes("rain") ||desc.includes("drizzle"))
    {
        return "vids/rainy.webm";
    }
    else if(desc.includes("snow"))
    {
        return "vids/snowy.webm";
    }
    else if(desc.includes("fog") || desc.includes("smoke") || desc.includes("dust") || desc.includes("sand"))
    {
        return "vids/foggy.mp4"
    }
    else if(desc.includes("tornado") || desc.includes("ash"))
    {
        return "vids/extreme.webm"
    }
    else
    {
        return "vids/clear.webm";
    }
   
}




// i have to make the map object first here 
const map = L.map('map');
map.setView([22, 78], 4);//default position of india ig
//after that i have to add the map tiles to the map that we have creatd in here so in order to make this what we have to do is 
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
})
//this gonna add the tiles for the map in here 
tiles.addTo(map);

//now i have to add the marker and the circle for when we are having the position we can mark on it exactly 
let marker;
let circle;

//now on that form part i have to fix few of the things so that it starts to work normally 
//here i am making a function which will take the location of the users browser who is using this website of mine hehe
let getLocalTime = async () => {
    try {
        let pos = await localPromise();
        console.dir(pos);
        let lat = pos.coords.latitude
        let lon = pos.coords.longitude
        await chartFunc(lat, lon)
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5677107a89cab225ea0b9e92f6496b4e&units=metric`
        let response = await fetch(url);
        let data = await response.json();
        console.log("hello")
        console.dir(data)
        //Here i will be using the default location of the users browser to get the temp and the other info and display it on the website 
        const currTemp = data.main.temp;
        const humidity = data.main.humidity;
        let maxTemp = data.main.temp_max;
        let minTemp = data.main.temp_min;
        let desc = data.weather[0].description;
        let videoPath = getVideoPath(desc.toLowerCase());
        //now i have to utilize the video path in here  and then make the use out of this thing inhere 
        video.setAttribute("src",videoPath);
        if (minTemp == maxTemp) {
            maxTemp += 0.8;
            maxTemp = maxTemp.toFixed(2);
        }

        const tempString = currTemp + "°";
        const maxTempString = maxTemp + "°";
        const minTempString = minTemp + "°";
        highTemp.innerHTML = maxTempString;
        lowTemp.innerHTML = minTempString;
        temp.innerHTML = tempString;
        upperDescription.innerHTML = desc.toUpperCase();
        let p = document.createElement("p")
        p.innerText = humidity + "%";
        humidityBlock.append(p);
        const direction = getWindDirection(data.wind.deg);
        const speedKmh = (data.wind.speed * 3.6).toFixed(1);

        windSpeed.innerHTML = `${speedKmh} km/h from ${direction}`

        const url2 = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        response = await fetch(url2);
        data = await response.json();
        if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown"
            const country = data.address.country || "Unknown"
            address.innerHTML = `${city},${country}`
            //here ill call the function which will provide me with the list of the data and shows it to me in the list 
            countryCode = data.address.country_code;
            setList(data.address.country_code);
        }

        else {
            address.innerHTML = "Address Not Found"
        }

        let date = new Date()
        console.dir(date)
        setInterval(() => {
            date.setSeconds(date.getSeconds() + 1);
            let time = date.toLocaleTimeString("en-IN");
            timeBlock.innerHTML = time;
        }, 1000)
        let dateInput = date.getDate();
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sept", "Oct", "Nov", "Dec"
        ];
        let MonthInput = monthNames[date.getMonth()];
        dateBlock.innerHTML = `${dateInput} ${MonthInput}`
        yearBlock.innerHTML = date.getFullYear();
        dayBlock.innerHTML = dateNames[date.getDay()];
    }
    catch (e) {
        console.log(e)
    }

}
let setList = async (countryCode) => {
    let loadingscr = document.createElement("div")
    loadingscr.classList.add("loading");
    loadingscr.append("LOADING...");
    popCities.append(loadingscr);
    let url = `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode.toUpperCase()}/places?limit=4&sort=-population`
    let response = await fetch(url, {
        headers: {
            "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
            "x-rapidapi-key": "abd5fa1fc9msh69097604c1a1a35p1e60cdjsn26cd8f2202c9"
        }
    })
    let data = await response.json();

    let cities = getCities(data);

    //this is the cruicial async js moment in here hehe
    let temps = await Promise.all(cities.map(async (city) => {
        let temp = await getCityTemp(city);
        return temp;
    }))

    cities.forEach((city, index) => {
        let list = document.createElement("li");
        list.classList.add("children")
        let divCity = document.createElement("div")
        divCity.classList.add("cityName")
        divCity.innerText = city;
        let divTemp = document.createElement("div")
        divTemp.classList.add("temperature")
        divTemp.innerHTML = `${temps[index]}°`
        list.append(divCity);
        list.append(divTemp);
        popCities.append(list)
    });
    loadingscr.remove();
}




let getCities = (response) => {

    return response.data.map((city) => {
        return city.name;
    })
}

getCityTemp = async (cityName) => {



    try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`
        let response = await fetch(url);
        let data = await response.json();
        let lat = parseFloat(data[0].lat);
        let lon = parseFloat(data[0].lon);
        let url1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5677107a89cab225ea0b9e92f6496b4e&units=metric`
        let response1 = await fetch(url1);
        let data1 = await response1.json();
        return data1.main.temp;
    }
    catch (err) {
        alert(err)
    }


}

let localPromise = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("cant access the location")
        }
        else {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        }
    })


}

getLocalTime();
form.addEventListener('submit', function (event) {
    event.preventDefault();
    let cityInput = formInput.value;
    formInput.value = ''
    if (cityInput == '') {
        alert("Please enter the city name");
    }
    moveToCity(cityInput);

})

let moveToCity = async (cityInput) => {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${cityInput}`
    let response = await fetch(url);
    let data = await response.json();
    if (data.length == 0) {
        alert("City not found");
    }
    let lat = parseFloat(data[0].lat)
    let lon = parseFloat(data[0].lon);
    if (marker) {
        map.removeLayer(marker);
    }
    if (circle) {
        map.removeLayer(circle);
    }
    circle = L.circle([lat, lon], {
        color: "red",
        fillColor: '#f03',
        fillOpacity: 0.2,
        radius: 1000
    }).addTo(map);

    marker = L.marker([lat, lon]).addTo(map);
    if (data[0].addresstype == "country") {
        console.log("country")
        map.setView([lat, lon], 4);
    }
    else {
        console.log("city")
        map.setView([lat, lon], 11);
    }
    displayTemp(lat, lon, data);
}





let displayTemp = async (lat, lon, addressData) => {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=5677107a89cab225ea0b9e92f6496b4e&units=metric`
    const response = await fetch(url);
    const data = await response.json();
    console.dir(data);
    console.dir(data)
    const currTemp = data.main.temp;
    const humidity = data.main.humidity
    console.log(addressData)
    await chartFunc(lat, lon);
    //for showing the city and country 
    if (addressData[0].addresstype != "country") {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            let response = await fetch(url)
            let data = await response.json()
            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown"
                const country = data.address.country || "Unknown"
                address.innerHTML = `${city},${country}`
                console.dir(data)
                if (countryCode != data.address.country_code) {
                    popCities.innerHTML = "";
                    countryCode = data.address.country_code;
                    setList(data.address.country_code);
                }

            }
            else {
                address.innerHTML = "Address Not Found"
            }
        }
        catch (err) {
            console.log(err)
        }

    }
    else {
        address.innerHTML = addressData[0].name;
        let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        let data = await response.json()
        if (countryCode != data.address.country_code) {
            popCities.innerHTML = "";
            countryCode = data.address.country_code;
            setList(data.address.country_code);
        }

    }
    // for showing the compass and its direction and stuff...


    const direction = getWindDirection(data.wind.deg);
    const speedKmh = (data.wind.speed * 3.6).toFixed(1);

    windSpeed.innerHTML = `${speedKmh} km/h from ${direction}`

    let maxTemp = data.main.temp_max;
    let minTemp = data.main.temp_min;
    let desc = data.weather[0].description;
    let videoPath = getVideoPath(desc.toLowerCase());
    //now i have to utilize the video path in here  and then make the use out of this thing inhere 
    video.setAttribute("src",videoPath);
    if (minTemp == maxTemp) {
        maxTemp += 0.8;
        maxTemp = maxTemp.toFixed(2);
    }

    const tempString = currTemp + "°";
    const maxTempString = maxTemp + "°";
    const minTempString = minTemp + "°";
    highTemp.innerHTML = maxTempString;
    lowTemp.innerHTML = minTempString;
    temp.innerHTML = tempString;
    upperDescription.innerHTML = desc.toUpperCase();
    let img = document.createElement("img");
    img.setAttribute("src", "img/humidity.svg");
    humidityBlock.innerHTML = "";
    humidityBlock.append(img, `${humidity} %`)

}

//now the chart js shit is in here where i am required to make the funciton of integrating the chart here and making it looks good somehow 

//first i have to make the chart and somehow make the use of ts

let ctx = document.getElementById("tempChart").getContext("2d");

let chartFunc = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=5677107a89cab225ea0b9e92f6496b4e&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    // Step 1: Filter to only 4 times per day
    const filtered = data.list.filter(item => {
        const time = item.dt_txt.split(" ")[1];
        return ["00:00:00", "06:00:00", "12:00:00", "18:00:00"].includes(time);
    });

    // Step 2: Get temperatures
    let temps = filtered.map(item => item.main.temp);

    // Step 3: Smooth temperatures (simple moving average)
    const smoothTemps = temps.map((t, i, arr) => {
        if (i === 0 || i === arr.length - 1) return t;
        return (arr[i - 1] + t + arr[i + 1]) / 3;
    });

    // Step 4: Create labels
    const labels = filtered.map(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString("en-IN", { weekday: "short" });
        const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        return `${day} ${time}`;
    });

    const winds = filtered.map(item => {

        return {
            speed: (item.wind.speed * 3.6).toFixed(1),
            direction: getWindDirection(item.wind.deg)
        }
    })


    const humidities = filtered.map(item => {
        return item.main.humidity;
    })
    // Step 5: Create chart
    if (myChart) {
        myChart.destroy();
    }
    ctx = document.getElementById("tempChart").getContext("2d");
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature",
                data: smoothTemps,
                borderColor: "rgba(255, 0, 127, 0.5)",
                backgroundColor: "rgba(255, 0, 127, 0.5)",
                tension: 0.5,      // smooth curves
                pointRadius: 5,
                pointHoverRadius: 8
            },
            {
                label: "Humidity",
                data: humidities,
                borderColor: "rgba(0, 150, 255, 0.5)",
                backgroundColor: "rgba(0, 150, 255, 0.5)",
                tension: 0.5,
                pointRadius: 5,
                pointHoverRadius: 8
            },
            {
                label: "Winds",
                data: winds.map((wind) => {
                    return wind.speed
                }),
                borderColor: "rgba(0, 255, 0, 0.5)",
                backgroundColor: "rgba(0, 255, 0, 0.5)",
                tension: 0.5,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: tooltipItems => labels[tooltipItems[0].dataIndex],
                        label: tooltipItem => {
                            if (tooltipItem.dataset.label == "Temperature") {
                                return `${tooltipItem.formattedValue}°C`
                            }
                            else if (tooltipItem.dataset.label == "Humidity") {
                                return `${tooltipItem.formattedValue}%`
                            }
                            else {
                                let wind = winds[tooltipItem.dataIndex];
                                return `${wind.speed} km/hr ${wind.direction}`
                            }
                        }
                    },


                },
                legend: {
                    display: true,
                    labels : {
                        color : "black",
                        font :{
                            size :14,
                            weight : "bold"
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false,
                    grid: {
                        display: false,
                    },
                    min: -50,
                    max: 100,
                    ticks: {
                        callback: val => `${val}°C`
                    }
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        callback: function (value, index) {
                            return index % 4 === 0 ? labels[index].split(" ")[0] : labels[index].split(" ")[1];
                        },
                        color : "black",
                    }
                },
                
            }
        }
    })
};
