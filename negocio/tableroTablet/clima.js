function inicializar() {
    /* Tablero.Estado.ciudad puede no estar listo aún; reintenta */
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad?.latitud || !ciudad?.longitud) {
        setTimeout(inicializar, 300);
        return;
    }

    const api = new ApiClima();

    api.getDatosClima(ciudad.longitud, ciudad.latitud)
        .then(datos => {
            console.log("Clima recibido:", datos);
            const panelClima = document.getElementById("clima-tablet");
            if (panelClima){
                panelClima.innerHTML = `
                    <section class="panel panel--clima" id="panel-clima">
                        <h2 class="panel__titulo">${datos.condicion}</h2>
                        <i class="fi ${_iconoClima(datos.condicion)} clima-compacto__icono"></i>
                        <p class="datos-clima">temperatura: ${Math.round(datos.temperatura)}°C</p>
                        <p class="datos-clima">humedad: ${Math.round(datos.humedad)}%</p>
                        <h2 class="panel__titulo">viento</h2>
                        <p class="datos-clima">velocidad: ${Math.round(datos.viento.velocidad)}m/s</p>
                        <p class="datos-clima">dirección: ${Math.round(datos.viento.grados)}°</p>
                        <p class="datos-clima">ráfaga: ${Math.round(datos.viento.rafaga)}m/s</p>
                    </section>
                `;
            }
        })
        .catch(err => console.warn("ClimaTablet: no disponible.", err));
}

/* Mapea la descripción de OpenWeather a un icono de UIcons */
function _iconoClima(condicion = "") {
    const c = condicion.toLowerCase();
    if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
    if (c.includes("tormenta"))                          return "fi-br-thunderstorm";
    if (c.includes("nieve"))                             return "fi-br-snowflake";
    if (c.includes("niebla") || c.includes("neblina"))  return "fi-br-cloud-fog";
    if (c.includes("nube") || c.includes("nublado"))    return "fi-br-clouds";
    if (c.includes("parcialmente"))                      return "fi-br-cloud-sun";
    return "fi-br-sun";
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.ClimaTablet = { inicializar };