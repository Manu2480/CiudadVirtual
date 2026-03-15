/* ================================================
CLIMA MÓVIL
Widget compacto de clima en el header (icono + temperatura).

Responsabilidad:
  - Obtener las coordenadas de la ciudad desde Tablero
  - Consultar ApiClima con esas coordenadas
  - Inyectar el chip de clima antes del botón de recursos

Dependencias: tablero.js, apiClima.js
================================================ */

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
            const chip = document.createElement("span");
            chip.className = "clima-compacto";
            chip.title     = `${datos.condicion} · Humedad ${datos.humedad}%`;
            chip.innerHTML = `
                <i class="fi ${_iconoClima(datos.condicion)} clima-compacto__icono"></i>
                <span>${Math.round(datos.temperatura)}°C</span>
            `;

            const btnRec = document.getElementById("btn-recursos-movil");
            if (btnRec) btnRec.before(chip);
        })
        .catch(err => console.warn("ClimaMovil: no disponible.", err));
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
window.ClimaMovil = { inicializar };