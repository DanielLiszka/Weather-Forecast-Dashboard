// API Key and Document Selectors
var APIKey="cc19080514601fa86afcd7346a5baad5";
var city="";
var SelectedCity = $("#search-city");
var currentHumidty= $("#humidity");
var SearchedCity=[];
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");

//create empty divs to populate results 
function onPageLoad(){
    var parent_div = document.getElementById("parent-div");
    var top_div = document.createElement('div')
    top_div.className = "col-sm-12" 
    top_div.id = "future-weather"
    parent_div.appendChild(top_div)
    var h3 = document.createElement('h3')
    h3.innerHTML = "5 Day Forecast: "
    top_div.appendChild(h3)
    var row = document.createElement('div')
    row.className = "row text-light"
    top_div.appendChild(row)
    for (var i = 0; i < 5; i++){
        var new_div = document.createElement('div')
        new_div.className = "col-sm-2 bg-primary text-white  ml-2 "
        row.appendChild(new_div)
        var firstp = document.createElement('p')
        firstp.id = "mainDate" + i
        new_div.appendChild(firstp)
        var secondp = document.createElement('p')
        secondp.id = "mainImg" + i 
        new_div.appendChild(secondp)
        var p_temp = document.createElement('p')
        p_temp.innerHTML = "Temp:" + "<span id=" + "mainTemp" + i + "></span>"
        new_div.appendChild(p_temp)
        var humidity = document.createElement('p')
        humidity.innerHTML = "Humidity: " + "<span id=" + "mainHumidity" + i + "></span>"
        new_div.append(humidity)
    }
}

//obtain UV information
function uvInfo(longitude,latitude){
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+latitude+"&lon="+longitude;
    $.ajax({ url:uvqURL, }).then(function(response){ $(currentUvindex).html(response.value);
                if (response.value > 6){
                $(currentUvindex).attr("class","current bg-danger py-2 px-2 text-white")}
                else if (response.value <3) {  $(currentUvindex).attr("class","current bg-warning py-2 px-2 text-white")   }
                else {  $(currentUvindex).attr("class","current bg-success py-2 px-2 text-white")}
            });
}
    
// add previously stored data on page refresh if it exists 
function firstload (){
    if (localStorage.getItem("cityname")){
        onPageLoad();
    }
}

firstload();

// click events 
$("#search-button").on("click",WeatherPresentation);
$(document).on("click",PastHistory);
$(window).on("load",LastItem);
$("#clear-history").on("click",RemoveAllHistory);

//Main Weather API to get five day forecast 
function forecast(cityid){
    var dayover= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({ url:queryforcastURL,
    }).then(function(response){
        
        for (var i=0 ; i<5 ;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#mainDate"+i).html(date);
            $("#mainImg"+i).html("<img src="+iconurl+">");
            $("#mainTemp"+i).html(tempF+"&#8457");
            $("#mainHumidity"+i).html(humidity+"%");
        }
        
    });
}

//get past history
function PastHistory(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        Day0Forecast(city);
    }

}

//add and modify list items 
function LastItem(){
    $("ul").empty();
    var SearchedCity = JSON.parse(localStorage.getItem("cityname"));
    if(SearchedCity!==null){
        SearchedCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<SearchedCity.length;i++){
            var listEl= $("<li>"+ SearchedCity[i].toUpperCase()+"</li>");
            $(listEl).attr("class","list-group-item");
            $(listEl).attr("data-value",SearchedCity[i].toUpperCase());
            $(".list-group").append(listEl);
        }
        city=SearchedCity[i-1];
        Day0Forecast(city);
    }

}

//present the weather info to user
function WeatherPresentation(event){
    event.preventDefault();
    if(document.getElementById("future-weather") == null){ onPageLoad()
        ;}
        if(SelectedCity.val().trim()!==""){
        city=SelectedCity.val().trim();
        Day0Forecast(city);
    }
}

//remove all history 
function RemoveAllHistory(event){
    event.preventDefault();
    SearchedCity=[];
    window.localStorage.clear();
    document.location.reload();
}
//current forecast
function Day0Forecast(city){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        console.log(response);
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");


        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        $(currentHumidty).html(response.main.humidity+"%");
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        uvInfo(response.coord.lon,response.coord.lat);
        forecast(response.id);
        SearchedCity=JSON.parse(localStorage.getItem("cityname"));
        if (SearchedCity==null){
            SearchedCity=[];
            SearchedCity.push(city.toUpperCase()
            );
            localStorage.setItem("cityname",JSON.stringify(SearchedCity));
            var listEl= $("<li>"+ city.toUpperCase()+"</li>");
            $(listEl).attr("class","list-group-item");
            $(listEl).attr("data-value", city.toUpperCase());
            $(".list-group").append(listEl);
        }
        else {
            var final = 0;
            for (var i=0; i<SearchedCity.length; i++){
                if(city.toUpperCase()===SearchedCity[i]){
                    final = -1;
                } else {final = 1}
            }
            if(final>0){
                SearchedCity.push(city.toUpperCase());
                localStorage.setItem("cityname",JSON.stringify(SearchedCity));
                var listEl= $("<li>"+ city.toUpperCase()+"</li>");
                $(listEl).attr("class","list-group-item");
                $(listEl).attr("data-value",city.toUpperCase());
                $(".list-group").append(listEl);
            }
         }
    });}













