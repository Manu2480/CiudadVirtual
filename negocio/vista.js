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
    else                vista = "desktop";

    document.documentElement.setAttribute("data-vista", vista);

    /* Carga el CSS específico de la vista si existe */
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = `../estilos/tablero${vista}.css`;
    document.head.appendChild(link);

    /* Carga el JS de controles específico de la vista si existe */
    const script = document.createElement("script");
    script.src   = `../../negocio/controles${vista}.js`;
    script.defer = true;
    document.head.appendChild(script);
})();