/* vista.js
Detecta el tamaño de pantalla y carga el CSS y JS específico de la vista.
Debe ejecutarse sin defer para aplicar estilos antes del primer pintado.

Vistas:
  < 768px      => movil    => negocio/tableroMovil/controlesMovil.js
  768-1024px   => tablet   => negocio/tableroTablet/controlesTablet.js
  > 1024px     => desktop  => negocio/tableroDesktop/controlesDesktop.js
*/

(function() {
    const w = window.innerWidth;
    console.log("vista.js: ancho de ventana", w);
    let vista;
    if      (w < 768)   vista = "movil";
    else if (w <= 1024) vista = "tablet";
    else                vista = "Desktop";

    document.documentElement.setAttribute("data-vista", vista);
    console.log("vista.js: detectada vista", vista);

    /* Carga el CSS específico de la vista */
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    if (vista === "desktop") {
        link.href = "../estilos/MICHAELtableroDesktop.css";
    } else {
        link.href = `../estilos/tablero${vista.charAt(0).toUpperCase() + vista.slice(1)}.css`;
    }
    link.onload  = () => console.log("vista.js: CSS cargado", link.href);
    link.onerror = () => console.error("vista.js: error al cargar CSS", link.href);
    document.head.appendChild(link);

    /* Carga el JS de controles desde la carpeta de su vista.
       Cada carpeta sigue la convención: tablero{Vista}/controles{Vista}.js */
    const nombreVista = vista.charAt(0).toUpperCase() + vista.slice(1);
    const script = document.createElement("script");
    if (vista === "desktop") {
        script.src = "../../negocio/MICHAELcontrolesDesktop.js";
    } else {
        script.src = `../../negocio/tablero${nombreVista}/controles${nombreVista}.js?v=${Date.now()}`;
    }
    script.defer = true;  // Necesario para que el DOM esté listo antes de ejecutar
    script.onload  = () => console.log("vista.js: JS de controles cargado", script.src);
    script.onerror = () => console.error("vista.js: error al cargar JS de controles", script.src);
    document.head.appendChild(script);
})();

// Agregar listener para cambios de tamaño de ventana (útil en dev tools)
window.addEventListener('resize', function() {
    const w = window.innerWidth;
    let nuevaVista;
    if      (w < 768)   nuevaVista = "movil";
    else if (w <= 1024) nuevaVista = "tablet";
    else                nuevaVista = "Desktop";

    const vistaActual = document.documentElement.getAttribute("data-vista");
    if (nuevaVista !== vistaActual) {
        console.log("vista.js: cambio de vista detectado, recargando página");
        window.location.reload();
    }
});