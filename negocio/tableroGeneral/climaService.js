(function() {
    function obtenerClimaCiudad(ciudad) {
        if (!ciudad?.latitud || !ciudad?.longitud) {
            return Promise.reject(new Error("Ciudad sin coordenadas para consulta de clima."));
        }

        const api = new ApiClima();
        return api.getJsonClima(ciudad.longitud, ciudad.latitud).then(datos => {
            const temperatura = datos?.main?.temp ?? null;
            const condicion = datos?.weather?.[0]?.description ?? "";
            const humedad = datos?.main?.humidity ?? null;
            const velocidadViento = datos?.wind?.speed ?? null;
            const gradosViento = datos?.wind?.deg ?? null;
            const rafagaViento = datos?.wind?.gust ?? null;
            return new Clima(
                temperatura,
                condicion,
                humedad,
                velocidadViento,
                gradosViento,
                rafagaViento,
            );
        });
    }

    function iconoCondicion(condicion = "") {
        const c = condicion.toLowerCase();
        if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
        if (c.includes("tormenta")) return "fi-br-thunderstorm";
        if (c.includes("nieve")) return "fi-br-snowflake";
        if (c.includes("niebla") || c.includes("neblina")) return "fi-br-cloud-fog";
        if (c.includes("nube") || c.includes("nublado") || c.includes("nuboso")) return "fi-br-clouds";
        if (c.includes("parcialmente")) return "fi-br-cloud-sun";
        return "fi-br-sun";
    }

    window.ClimaService = {
        obtenerClimaCiudad,
        iconoCondicion,
    };
})();