/*
CLIMA DESKTOP
Widget de clima en el sidebar derecho.
*/
function cargarClima(widget, ciudad) {
    ClimaService.obtenerClimaCiudad(ciudad)
        .then(datos => {
            widget.innerHTML = `
                <div class="modulo-header">
                    <h2 class="panel__titulo">Clima</h2>
                </div>
                <div class="clima-contenido">
                    <div class="clima-icono">
                        <i class="fi ${ClimaService.iconoCondicion(datos.condicion)}"></i>
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
                        <div class="clima_div"><i>Ráfaga:</i> ${datos.viento.rafaga} m/s</div>
                    </div>
                </div>
            `;
        })
        .catch(err => {
            console.warn("ClimaDesktop: no disponible", err);
            widget.innerHTML = `
                <div class="modulo-header">
                    <h2 class="panel__titulo">Clima</h2>
                </div>
                <p>No disponible</p>
            `;
        });
}


function inicializar() {
    ActualizacionesPeriodicas.esperarConReintentos({
        condicion: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            const widget = document.getElementById("widget-clima");
            return Boolean(widget && ciudad?.latitud && ciudad?.longitud);
        },
        alCumplir: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            const widget = document.getElementById("widget-clima");
            if (!widget || !ciudad) return;

            ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
                id: "clima:desktop",
                accion: () => cargarClima(widget, ciudad),
                intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_CLIMA,
                ejecutarAhora: true,
            });
        },
        maxIntentos: 10,
        delayMs: ActualizacionesPeriodicas.INTERVALOS_MS.REINTENTO_CORTO,
    });
}

window.ClimaDesktop = { inicializar };