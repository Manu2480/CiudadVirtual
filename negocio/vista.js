/* vista.js
Detecta el tamaño de pantalla y carga el CSS específico de la vista.
Debe ejecutarse sin defer para aplicar estilos antes del primer pintado.

Vistas:
  < 768px      → movil
  768-1024px   → tablet
  > 1024px     → desktop
*/

(function() {
    const w = window.innerWidth;
    let vista;
    if      (w < 768)   vista = "movil";
    else if (w <= 1024) vista = "tablet";
    else                vista = "Desktop";

    document.documentElement.setAttribute("data-vista", vista);
    console.log("vista.js: detectada vista", vista);

    /* Carga el CSS específico de la vista si existe */
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = `../estilos/tablero${vista}.css`;
    link.onload = () => console.log("vista.js: CSS cargado", link.href);
    link.onerror = () => console.error("vista.js: error al cargar CSS", link.href);
    document.head.appendChild(link);

    /* Carga el JS de controles específico de la vista si existe */
    const script = document.createElement("script");
    script.src   = `../../negocio/controles${vista}.js`;
    script.defer = true;
    script.onload = () => console.log("vista.js: JS de controles cargado", script.src);
    script.onerror = () => console.error("vista.js: error al cargar JS de controles", script.src);
    document.head.appendChild(script);
})();