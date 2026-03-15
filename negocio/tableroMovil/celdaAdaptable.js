/* ================================================
CELDA ADAPTABLE MÓVIL
Ajusta el tamaño de celda para que el grid llene
exactamente el alto visible entre encabezado y tabs.

Responsabilidad:
  - Calcular el alto disponible real en px
  - Dividirlo entre el número de filas del mapa
  - Aplicar el resultado a --tamano-celda en :root
  - Recalcular si el usuario rota el dispositivo

Dependencias: tablero.js (Tablero.Estado.filas)
================================================ */

function inicializar() {
    _ajustar();
    window.addEventListener("resize", _ajustar);
}

function _ajustar() {
    const filas = window.Tablero?.Estado?.filas;
    if (!filas) {
        /* Tablero aún no está listo, reintenta */
        setTimeout(_ajustar, 100);
        return;
    }

    const altoEncabezado = parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue("--alto-encabezado")
    ) || 60;

    const altoTabs = parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue("--alto-tabs")
    ) || 56;

    const altoDisponible = window.innerHeight - altoEncabezado - altoTabs;
    const tamCelda = Math.floor(altoDisponible / filas);

    document.documentElement.style.setProperty(
        "--tamano-celda", `${tamCelda}px`
    );

    console.log(`CeldaAdaptable: ${filas} filas, alto ${altoDisponible}px → celda ${tamCelda}px`);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.CeldaAdaptable = { inicializar };