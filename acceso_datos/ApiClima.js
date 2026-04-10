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
        return this.crearClima(datos);
    }

    crearViento(diccionario){
        const velocidadViento = diccionario.speed ?? null;
        const gradosViento = diccionario.deg ?? null;
        const rafagaViento = diccionario.gust ?? null;
        return new Viento(velocidadViento,gradosViento,rafagaViento);
    }

    crearClima(diccionario){
        const datosViento = diccionario.wind;
        const viento = this.crearViento(datosViento)
        const temperatura = diccionario.main.temp;
        const condicion = diccionario.weather[0].description;
        const humedad = diccionario.main.humidity;
        return new Clima(temperatura,condicion,humedad,viento);
    }

}