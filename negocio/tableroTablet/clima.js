let panelClimaVertical = document.getElementById("clima-tablet-vertical"); 
let panelClimaHorizontal = document.getElementById("clima-tablet-horizontal");
let _ciudadClima = null;

function inicializar() {
    ActualizacionesPeriodicas.esperarConReintentos({
        condicion: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            return Boolean(ciudad?.latitud && ciudad?.longitud);
        },
        alCumplir: () => {
            _ciudadClima = window.Tablero?.Estado?.ciudad;

            ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
                id: "clima:tablet",
                accion: consultarClima,
                intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_CLIMA,
                ejecutarAhora: true,
            });
        },
        delayMs: ActualizacionesPeriodicas.INTERVALOS_MS.REINTENTO_CORTO,
    });
}
function consultarClima(){
    if (!_ciudadClima) return;

    ClimaService.obtenerClimaCiudad(_ciudadClima)
    .then(datos => {
        mostrarDatos(datos,panelClimaVertical, true);
        mostrarDatos(datos,panelClimaHorizontal, false);
    })
    .catch(err => console.warn("ClimaTablet: no disponible.", err));
    
}
function mostrarDatos(datos, panel, saltoDeLinea){
    if (panel && datos){
        panel.innerHTML = `
            <section class="panel panel--clima" id="panel-clima">
                <h2 class="panel__titulo">${saltoDeLinea ? " ": `<i class="fi ${ClimaService.iconoCondicion(datos.condicion)}"></i>`} ${datos.condicion} ${saltoDeLinea ? " ": `<i class="fi ${ClimaService.iconoCondicion(datos.condicion)}"></i>`}</h2>
                ${saltoDeLinea ? `<i class="fi ${ClimaService.iconoCondicion(datos.condicion)} clima-compacto__icono"></i>` : " "}
                <p class="datos-clima">temperatura:${saltoDeLinea ? "<br>" : " "} ${Math.round(datos.temperatura)}°C</p>
                <p class="datos-clima">humedad:${saltoDeLinea ? "<br>" : " "} ${Math.round(datos.humedad)}%</p>
                <${saltoDeLinea ? "h2" : "p"} class="panel__titulo">viento<${saltoDeLinea ? "/h2" : "/p"}>
                <p class="datos-clima">velocidad:${saltoDeLinea ? "<br>" : " "} ${Math.round(datos.viento.velocidad)}m/s</p>
                <p class="datos-clima">dirección:${saltoDeLinea ? "<br>" : " "} ${Math.round(datos.viento.grados)}°</p>
                <p class="datos-clima">ráfaga:${saltoDeLinea ? "<br>" : " "} ${Math.round(datos.viento.rafaga)}m/s</p>
            </section>
        `;// con ${saltoDeLinea ? "<br>" : " "} estoy insertando los saltos de linea solo si saltoDeLinea es true, lo mismo con lo de los íconos
    }
}

/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.ClimaTablet = { inicializar };