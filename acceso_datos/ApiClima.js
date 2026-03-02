class ApiClima{
    constructor(url = "https://api.openweathermap.org/data/2.5/weather"){
        this.url = url;
    }
    getJsonClima(latitud,longitud){
        return fetch(this.url + "?lat=" + latitud + "&lon=" + longitud + "&appid=04d788c84dd58f4a69861b7a9d1128eb&units=metric&lang=es", {
            method: "GET",
        }).then(function (res) {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            return res.json();
        });       
    }

}

// ===== TEST =====
async function probar(){
    const api = new ApiClima();

    try{
        // Coordenadas de Manizales
        const clima = await api.getJsonClima(5.0703, -75.5138);

        console.log("✅ Clima obtenido:");
        console.log(clima);

        console.log("\n🌡 Temperatura:", clima.main.temp, "°C");
        console.log("☁ Estado:", clima.weather[0].description);

    }catch(error){
        console.error("❌ Error:", error);
    }
}

probar();