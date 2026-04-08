document.addEventListener('DOMContentLoaded', function() {
    fetch('city_coordinates.csv')
        .then(response => response.text())
        .then(data => {
            const cities = csvToJSON(data);
            populateDropdown(cities);
        });
});

function csvToJSON(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    return result;
}

function populateDropdown(cities) {
    const dropdown = document.getElementById('dropdown');
    cities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.textContent = city.city;
        cityElement.onclick = () => selectCity(city);
        dropdown.appendChild(cityElement);
    });
}

function showDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = 'block';
}

function selectCity(city) {
    document.getElementById('city-input').value = city.city;
    document.getElementById('dropdown').style.display = 'none';
    fetchForecast(city.latitude, city.longitude);
}

function fetchForecast(lat, lon) {
    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show loader

    const url = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none'; // Hide loader
            displayForecast(data.dataseries);
        })
        .catch(error => {
            loader.style.display = 'none'; // Hide loader on error
            console.error('Error fetching forecast:', error);
        });
}

function displayForecast(forecast) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ''; // Clear previous forecast

    // Group forecast data by weeks (Sunday to Saturday)
    const weeks = [];
    let currentWeek = [];

    forecast.slice(0, 7).forEach((day, index) => {
        const date = new Date(day.date.toString().slice(0, 4) + '-' + day.date.toString().slice(4, 6) + '-' + day.date.toString().slice(6, 8));
        
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayOfWeek = date.getDay();
        
        // Start a new week on Sunday
        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
        
        currentWeek.push({ date, day });
    });

    // Push the last week
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    // Display weeks
    weeks.forEach((week, weekIndex) => {
        // Create week header
        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        const startDate = week[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const endDate = week[week.length - 1].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        weekHeader.innerHTML = `<h2>Week ${weekIndex + 1} (${startDate} - ${endDate})</h2>`;
        container.appendChild(weekHeader);

        // Create week container
        const weekContainer = document.createElement('div');
        weekContainer.className = 'week-container';

        // Display days in the week
        week.forEach(({ date, day }) => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            const formattedDate = date.toLocaleDateString(undefined, options);

            const weatherImage = getWeatherImage(day.weather);

            card.innerHTML = `
                <img src="images/${weatherImage}" alt="${day.weather}">
                <h3>${formattedDate}</h3>
                <p>Min: ${day.temp2m.min}°C</p>
                <p>Max: ${day.temp2m.max}°C</p>
                <p>Weather: ${day.weather}</p>
            `;

            weekContainer.appendChild(card);
        });

        container.appendChild(weekContainer);
    });
}

function getWeatherImage(weather) {
    const weatherImages = {
        'clear': 'clear.png',
        'pcloudy': 'pcloudy.png',
        'mcloudy': 'mcloudy.png',
        'cloudy': 'cloudy.png',
        'humid': 'humid.png',
        'lightrain': 'lightrain.png',
        'oshower': 'oshower.png',
        'ishower': 'ishower.png',
        'lightsnow': 'lightsnow.png',
        'rain': 'rain.png',
        'snow': 'snow.png',
        'rainsnow': 'rainsnow.png',
        'tsrain': 'tsrain.png',
        'tstorm': 'tstorm.png',
        'fog': 'fog.png',
        'windy': 'windy.png'
    };

    return weatherImages[weather] || 'default.png';
}

// Hide the dropdown when clicking outside of it
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown');
    const input = document.getElementById('city-input');
    if (!input.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});