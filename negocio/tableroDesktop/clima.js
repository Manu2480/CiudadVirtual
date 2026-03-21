/*
CLIMA DESKTOP
Widget de clima en el sidebar derecho.
*/

function inicializar() {
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad?.latitud || !ciudad?.longitud) {
        setTimeout(inicializar, 300);
        return;
    }

    const api = new ApiClima();
    const widget = document.getElementById("widget-clima");
    if (!widget) return;

    api.getDatosClima(ciudad.longitud, ciudad.latitud)
        .then(datos => {
            widget.querySelector("h2")?.remove();
            widget.innerHTML = `
                <div class="modulo-header"><h2 class="panel__titulo">Clima</h2></div>
                <div class="clima-contenido">
                    <div class="clima-icono">
                        <i class="fi ${_iconoClima(datos.condicion)}"></i>
                    </div>
                    <div class="clima-temperatura">${Math.round(datos.temperatura)}°C</div>
                    <div class="clima-descripcion">${datos.condicion}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 8px;">
                        Humedad: ${datos.humedad}%
                    </div>
                    <div class="clima-viento">
                        <div class="clima_div"><i class="fi fi-br-wind"></i> Viento</div>
                        <div class="clima_div"><i>Velocidad:</i> ${datos.viento.velocidad} m/s</div>
                        <div class="clima_div"><i>Dirección:</i> ${datos.viento.grados}°</div>
                        <div class="clima_div"><i>Ráfaga:</i></i> ${datos.viento.rafaga} m/s</div>
                    </div>
                </div>
            `;
        })
        .catch(err => {
            console.warn("ClimaDesktop: no disponible", err);
            widget.querySelector("h2")?.remove();
            widget.innerHTML = `<h2 class="panel__titulo">Clima</h2><p>No disponible</p>`;
        });
}

function _iconoClima(condicion = "") {
    const c = condicion.toLowerCase();
    if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
    if (c.includes("tormenta")) return "fi-br-thunderstorm";
    if (c.includes("nieve")) return "fi-br-snowflake";
    if (c.includes("niebla") || c.includes("neblina")) return "fi-br-cloud-fog";
    if (c.includes("nube") || c.includes("nublado") || c.includes("nuboso")) return "fi-br-clouds";
    if (c.includes("parcialmente")) return "fi-br-cloud-sun";
    return "fi-br-sun";
}

window.ClimaDesktop = { inicializar };