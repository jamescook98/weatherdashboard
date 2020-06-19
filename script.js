
var apiKey = "12252e759fa1b709a8d5846e74ded817";
var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

var days = ["day1", "day2", "day3", "day4", "day5"];

$("#search-button").click(function () {
    deleter();
    var cityName = $("#search-value").val();
    getWeather(cityName);
});

$(function () {
    $(document).on("click", ".historyLi", function () {
        var cityName = $(this).text();
        $("#search-value").val(cityName);
        console.log("clicked" + cityName);
        console.log($("#search-value").val());
        deleter();
        getWeather(cityName);
    });
});

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


function getWeather(cityName) {
    var foundCity = findInHistory(cityName);
    if (foundCity !== null) {
        foundCity.parentNode.removeChild(foundCity);
        console.log("found");
    } else {
        var lis = document.getElementById("history").getElementsByTagName("li");
        if (lis !== null && lis.length >= 8) {
            foundCity = lis[lis.length - 1];
            foundCity.parentNode.removeChild(foundCity);
        }
    }

    $("#history").prepend('<li class="historyLi" id="' + cityName + 'Li">' + titleCase(cityName) + '</li>');

    updateHistory(cityName);

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
    queryURL = queryURL + cityName + "&appid=12252e759fa1b709a8d5846e74ded817";
    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var forecast = response.list[0];
        var todayIcon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + forecast.weather[0].icon + ".png");
        var todaysDate = moment().format('LL');

        $("#today").append($("<h3>").text(titleCase(cityName) + " (" + todaysDate + ")"));
        $("#today").append(todayIcon);
        $("#today").append($("<p>").text("Temperature: " + toFahrenheit(forecast.main.temp) + "°F"));
        $("#today").append($("<p>").text("Humidity: " + forecast.main.humidity + "%"));
        $("#today").append($("<p>").text("Wind Speed: " + forecast.wind.speed + " MPH"));
        UVIndex(response.city.coord.lat, response.city.coord.lon);

        $("#forecast").append($("<h3>").text("5 Day Forecast"));
        for (i = 0; i < days.length; i++) {
            var dayBoxId = "dayBox" + i;
            $("#forecast").append($('<div class="dayBox" id="' + dayBoxId + '">'));
            var dayBox = $("#" + dayBoxId);


            var fiveDayForecast = response.list[(8 * i)];

            dayBox.append($("<p>").text(moment().add(i + 1, 'days').format('LL')));
            var fiveDayIcon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + fiveDayForecast.weather[0].icon + ".png");
            dayBox.append(fiveDayIcon);
            dayBox.append($("<p>").text("Humidity: " + fiveDayForecast.main.humidity + "%"));
            dayBox.append($("<p>").text("Temp: " + toFahrenheit(fiveDayForecast.main.temp) + "°F"));
        }
    });
}

function deleter() {
    console.log("before delete");
    var today = $("#today");
    var forecast = $("#forecast");
    today.empty();
    forecast.empty();
    console.log("after delete");
}

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

function toFahrenheit(kelvin) {
    return (((parseFloat(kelvin) - 273.15) * (9 / 5)) + 32).toFixed(2);
}

function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}