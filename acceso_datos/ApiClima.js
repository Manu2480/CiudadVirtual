class ApiClima{
    constructor(url = "https://api.openweathermap.org/data/2.5/weather"){
        this.url = url;
    }
    getJsonClima(longitud,latitud){
        return fetch(this.url + "?lat=" + latitud + "&lon=" + longitud + "&appid=04d788c84dd58f4a69861b7a9d1128eb&units=metric&lang=es", {
            method: "GET",
        }).then(function (res) {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            return res.json();
        });       
    }
    async getDatosClima(longitud,latitud){
        const datos = await this.getJsonClima(longitud,latitud);
        return{
            "temperatura":datos.main.temp,
            "condicion":datos.weather[0].description,
            "humedad":datos.main.humidity,
            "viento":{"velocidad": datos.wind.speed,
                "grados": datos.wind.deg,
                "rafaga": datos.wind.gust
            }
        };
    }

}