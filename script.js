
var apiKey = "12252e759fa1b709a8d5846e74ded817";
var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

var days = ["day1", "day2", "day3", "day4", "day5"];

//hit search, clears existing divs and gets the weather
$("#search-button").click(function () {
    deleter();
    var cityName = $("#search-value").val();
    getWeather(cityName);
});

//buttons in search history clickable to search that city
$(function () {
    $(document).on("click", ".historyLi", function () {
        var cityName = $(this).text();
        $("#search-value").val(cityName);
        deleter();
        getWeather(cityName);
    });
});

//checks to see if duplicate entries are present in search history
function findInHistory(cityName) {
    var lis = document.getElementById("history").getElementsByTagName("li");
    if (lis !== null) {
        for (i = 0; i < lis.length; i++) {
            if (lis[i].innerHTML == cityName) {
                return lis[i];
            }
        }
    }
    return null;
}

//adds searched city to search history
function updateHistory(cityName) {
    localStorage.setItem("lastCalled", cityName);
    var cityHistory = [];
    var lis = document.getElementById("history").getElementsByTagName("li");
    if (lis !== null) {
        for (i = 0; i < lis.length; i++) {
            cityHistory.push(lis[i].innerHTML);
        }
    }
    localStorage.setItem("history", JSON.stringify(cityHistory));
}

//fills search history out from locally stored searches
function populateFromHistory() {
    var cityHistory = JSON.parse(localStorage.getItem("history"));
    if (cityHistory !== null) {
        for (i = 0; i < cityHistory.length; i++) {
            var cityName = cityHistory[i];
            $("#history").append('<li class="historyLi" id="' + cityName + 'Li">' + titleCase(cityName) + '</li>');
        }
    }
    if (localStorage.getItem('lastCalled') !== null) {
        getWeather(localStorage.getItem('lastCalled'))
    }
}
$(document).ready(populateFromHistory());

//main function. gets and displays the weather
function getWeather(cityName) {
    //if you searched for something that's already in the history it won't add it again
    var foundCity = findInHistory(cityName);
    if (foundCity !== null) {
        foundCity.parentNode.removeChild(foundCity);
    } else {
        var lis = document.getElementById("history").getElementsByTagName("li");
        if (lis !== null && lis.length >= 8) {
            foundCity = lis[lis.length - 1];
            foundCity.parentNode.removeChild(foundCity);
        }
    }
    //otherwise it adds it
    $("#history").prepend('<li class="historyLi" id="' + cityName + 'Li">' + titleCase(cityName) + '</li>');
    updateHistory(cityName);

    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
    queryURL = queryURL + cityName + "&appid=12252e759fa1b709a8d5846e74ded817";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //retrieves JSON object, references specific parts and displays today's weather and UV index
        var forecast = response.list[0];
        var todayIcon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + forecast.weather[0].icon + ".png");
        var todaysDate = moment().format('LL');
        $("#today").append($("<h3>").text(titleCase(cityName) + " (" + todaysDate + ")"));
        $("#today").append(todayIcon);
        $("#today").append($("<p>").text("Temperature: " + toFahrenheit(forecast.main.temp) + "°F"));
        $("#today").append($("<p>").text("Humidity: " + forecast.main.humidity + "%"));
        $("#today").append($("<p>").text("Wind Speed: " + forecast.wind.speed + " MPH"));
        UVIndex(response.city.coord.lat, response.city.coord.lon);

        //dynamically generates a div for each of the following 5 days, then displays weather for each day
        $("#forecast").append($("<h3>").text("5 Day Forecast"));
        for (i = 0; i < days.length; i++) {
            var dayBoxId = "dayBox" + i;
            $("#forecast").append($('<div class="dayBox" id="' + dayBoxId + '">'));
            var dayBox = $("#" + dayBoxId);

            var fiveDayForecast = response.list[(8 * i)];
            var fiveDayIcon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + fiveDayForecast.weather[0].icon + ".png");
            dayBox.append($("<p>").text(moment().add(i + 1, 'days').format('LL')));
            dayBox.append(fiveDayIcon);
            dayBox.append($("<p>").text("Humidity: " + fiveDayForecast.main.humidity + "%"));
            dayBox.append($("<p>").text("Temp: " + toFahrenheit(fiveDayForecast.main.temp) + "°F"));
        }
    });
}

//empties existing weather displays to make room for new ones when a city is searched
function deleter() {
    var today = $("#today");
    var forecast = $("#forecast");
    today.empty();
    forecast.empty();
}

//gets UV index and creates a span with colored indicators based on severity
function UVIndex(latitude, longitude) {
    $.ajax({
        "url": "https://api.openweathermap.org/data/2.5/uvi?APPID=" + apiKey + "&lat=" + latitude + "&lon=" + longitude,
        "method": "GET"
    }).then(function (response) {
        var UVIndex = parseFloat(response.value).toFixed(2);
        var color;
        if (UVIndex <= 2) {
            color = "green";
        } else if (UVIndex <= 7) {
            color = "yellow";
        } else {
            color = "red";
        }

        var p = $("<p>");
        var span = $("<span>");
        span.css({ "background-color": color, "padding": "2px" });
        if (color == "red") {
            span.css({ "color": "white" });
        }
        span.text(UVIndex);
        p.append("UV Index: ").append(span);
        $("#today").append(p);
    });
}

//converts kelvin to fahrenheit
function toFahrenheit(kelvin) {
    return (((parseFloat(kelvin) - 273.15) * (9 / 5)) + 32).toFixed(2);
}

//converts lowercase to Title Case
function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}