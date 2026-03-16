/* ================================================
CELDA ADAPTABLE TABLET
Calcula el tamaño de celda para que el grid quepa
exactamente en el ancho del área del mapa sin scroll horizontal.

Dependencias: Tablero.Estado.columnas
================================================ */
function inicializar() {
    _ajustar();
    window.addEventListener("resize", _ajustar);
    mostrarIndices();
}

function _ajustar() {
    const columnas = window.Tablero?.Estado?.columnas;
    if (!columnas) {
        /* Tablero aún no está listo, reintenta */
        setTimeout(_ajustar, 100);
        return;
    }

    const areaMapa = document.getElementById("area-mapa");
    if (!areaMapa) return;

    const anchoDisponible = areaMapa.getBoundingClientRect().width || areaMapa.offsetWidth;

    // Tamaño de celda acotado entre 44 y 48px
    const tamCelda = Math.min(48, Math.max(44, Math.floor(anchoDisponible / columnas)));

    document.documentElement.style.setProperty("--tamano-celda", `${tamCelda}px`);
    console.log(`CeldaTablet: ${columnas} columnas, ancho ${anchoDisponible}px → celda ${tamCelda}px`);

    // Guardar para recalcular al rotar
    // Nota: _mapaState puede no existir si el módulo del mapa no lo expone globalmente.
    // Usamos un contenedor propio para evitar errores.
    window._celdasTabletState = window._celdasTabletState || {};
    window._celdasTabletState.columnasTablet = columnas;
}

function mostrarIndices() {

    const { filasVisibles, columnasVisibles } = calcularCeldasVisibles();

    const filasEl = document.getElementById("indices-filas");
    const colsEl  = document.getElementById("indices-columnas");

    filasEl.innerHTML = "";
    colsEl.innerHTML = "";

    for (let f = 0; f < filasVisibles; f++) {
        const div = document.createElement("div");
        div.className = "indice-fila";
        div.textContent = f;
        filasEl.appendChild(div);
    }

    for (let c = 0; c < columnasVisibles; c++) {
        const div = document.createElement("div");
        div.className = "indice-columna";
        div.textContent = c;
        colsEl.appendChild(div);
    }
}
function calcularCeldasVisibles() {

    // El contenedor real del grid en tablet es #mapa-container (no hay #viewport-mapa)
    const viewport = document.getElementById("viewport-mapa");
    if (!viewport) return { filasVisibles: 0, columnasVisibles: 0 };

    const ancho = viewport.clientWidth;
    const alto = viewport.clientHeight;

    const tamCelda = parseInt(
        getComputedStyle(document.documentElement)
        .getPropertyValue("--tamano-celda")
    );

    const columnasVisibles = Math.floor(ancho / tamCelda) -1;
    const filasVisibles = Math.floor(alto / tamCelda) -1;

    return { filasVisibles, columnasVisibles };
}

window.CeldasTablet = {
    inicializar,
    mostrarIndices
};