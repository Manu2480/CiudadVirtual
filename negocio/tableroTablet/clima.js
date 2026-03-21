let panelClimaVertical = document.getElementById("clima-tablet-vertical"); 
let panelClimaHorizontal = document.getElementById("clima-tablet-horizontal");
const apiClima = new ApiClima();

function inicializar() {
    /* Tablero.Estado.ciudad puede no estar listo aún; reintenta */
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad?.latitud || !ciudad?.longitud) {
        setTimeout(inicializar, 300); //se vuelve a inicializar en 300ms
        return;
    }
    consultarClima() //se consulta el clima
    setInterval(consultarClima,1800000) //se inicia el ciclo de consulta cada 30 minutos
}
function consultarClima(){
    apiClima.getDatosClima(ciudad.longitud, ciudad.latitud)
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
                <h2 class="panel__titulo">${saltoDeLinea ? " ": `<i class="fi ${_iconoClima(datos.condicion)}"></i>`} ${datos.condicion} ${saltoDeLinea ? " ": `<i class="fi ${_iconoClima(datos.condicion)}"></i>`}</h2>
                ${saltoDeLinea ? `<i class="fi ${_iconoClima(datos.condicion)} clima-compacto__icono"></i>` : " "}
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
/* Mapea la descripción de OpenWeather a un icono de UIcons */
function _iconoClima(condicion = "") {
    const c = condicion.toLowerCase();
    if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
    if (c.includes("tormenta"))                          return "fi-br-thunderstorm";
    if (c.includes("nieve"))                             return "fi-br-snowflake";
    if (c.includes("niebla") || c.includes("neblina"))  return "fi-br-cloud-fog";
    if (c.includes("nube") || c.includes("nublado") || c.includes("nuboso"))    return "fi-br-clouds";
    if (c.includes("parcialmente"))                      return "fi-br-cloud-sun";
    return "fi-br-sun";
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.ClimaTablet = { inicializar };