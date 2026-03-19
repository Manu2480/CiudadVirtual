/* ================================================
CELDA ADAPTABLE TABLET
Calcula el tamaño de celda para que el grid quepa
exactamente en el ancho del área del mapa sin scroll horizontal.

Dependencias: Tablero.Estado.columnas
================================================ */
function inicializar() {
    _ajustar();
    calcularCeldasVisibles(); 
    renderizarViewport();
    mostrarIndices();
    fotoPerfil();
}
document.getElementById("arriba").addEventListener("click", () => moverViewport("arriba", 1));
document.getElementById("abajo").addEventListener("click", () => moverViewport("abajo", 1));
document.getElementById("izquierda").addEventListener("click", () => moverViewport("izquierda", 1));
document.getElementById("derecha").addEventListener("click", () => moverViewport("derecha", 1));
function moverViewport(direccion) {
    const gridEstado = window.Mapa.getGrid();
    const filasMax = gridEstado.length;
    const colsMax  = gridEstado[0]?.length || 0;

    switch (direccion) {
        case "arriba":
            viewport.filaInicio = Math.max(0, viewport.filaInicio - (viewport.columnasVisibles -2) );
            break;
        case "abajo":
            viewport.filaInicio = Math.min(filasMax - viewport.filasVisibles, viewport.filaInicio + (viewport.columnasVisibles -2));
            break;
        case "izquierda":
            viewport.colInicio = Math.max(0, viewport.colInicio - (viewport.filasVisibles -2));
            break;
        case "derecha":
            viewport.colInicio = Math.min(colsMax - viewport.columnasVisibles, viewport.colInicio + (viewport.filasVisibles -2));
            break;
    }

    // Re-renderizar el viewport
    renderizarViewport();
    mostrarIndices();
}
window.addEventListener("resize", () =>{
    _ajustar();
    calcularCeldasVisibles(); 
    renderizarViewport();
    mostrarIndices();
});
const viewport = {
    filaInicio: 0,
    colInicio: 0,
    filasVisibles: 0,
    columnasVisibles: 0
};
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
    calcularCeldasVisibles()

    const filasEl = document.getElementById("indices-filas");
    const colsEl  = document.getElementById("indices-columnas");

    filasEl.innerHTML = "";
    colsEl.innerHTML = "";

    for (let f = 0; f < viewport.filasVisibles; f++) {
        const div = document.createElement("div");
        div.className = "indice-fila";
        div.textContent = viewport.filaInicio + f + 1;
        filasEl.appendChild(div);
    }

    for (let c = 0; c < viewport.columnasVisibles; c++) {
        const div = document.createElement("div");
        div.className = "indice-columna";
        div.textContent = viewport.colInicio + c +1;
        colsEl.appendChild(div);
    }
}
function calcularCeldasVisibles() {
    const mapa = document.getElementById("viewport-mapa");
    if (!mapa){
        requestAnimationFrame(calcularCeldasVisibles);
        return;
    }


    const ancho = mapa.clientWidth;
    const alto = mapa.clientHeight;

    const tamCelda = parseInt(
        getComputedStyle(document.documentElement)
        .getPropertyValue("--tamano-celda")
    ) || 44;

    viewport.columnasVisibles = Math.floor(ancho / tamCelda);
    viewport.filasVisibles = Math.floor(alto / tamCelda);
}
function renderizarViewport() {
    const gridEl = document.getElementById("mapa-grid");
    gridEl.innerHTML = "";
    gridEl.style.display = "grid";

    // Tamaño de celda desde CSS
    const tamCelda = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tamano-celda")) || 44;

    // Tamaño del contenedor
    const ancho = gridEl.parentElement.clientWidth;
    const alto  = gridEl.parentElement.clientHeight;

    // Calcular cuántas celdas caben + 1 extra para mostrar pedacito
    viewport.columnasVisibles = Math.floor(ancho / tamCelda) + 1;
    viewport.filasVisibles    = Math.floor(alto / tamCelda) + 1;

    // Definir filas y columnas del grid
    gridEl.style.gridTemplateColumns = `repeat(${viewport.columnasVisibles}, ${tamCelda}px)`;
    gridEl.style.gridTemplateRows    = `repeat(${viewport.filasVisibles}, ${tamCelda}px)`;

    // Obtener estado actual del mapa
    const gridEstado = window.Mapa.getGrid();

    // Renderizar todas las celdas visibles incluyendo el extra
    for (let f = 0; f < viewport.filasVisibles; f++) {
        for (let c = 0; c < viewport.columnasVisibles; c++) {
            const filaReal = viewport.filaInicio + f;
            const colReal  = viewport.colInicio + c;

            const estado = gridEstado?.[filaReal]?.[colReal] || { tipo: "vacio" };

            const celda = document.createElement("div");
            celda.classList.add("celda");
            celda.dataset.fila = filaReal;
            celda.dataset.col  = colReal;

            if (estado.tipo !== "vacio") {
                celda.classList.add("celda--construida");
                const edificio = Edificios.obtener(estado.tipo);
                if (edificio) {
                    const img = document.createElement("img");
                    img.src = edificio.imagen;
                    img.alt = edificio.nombre;
                    img.classList.add("celda__edificio");
                    celda.appendChild(img);
                }
            }

            gridEl.appendChild(celda);
        }
    }
}
const divFoto = document.getElementById("foto-perfil");
const ciudad =  Tablero.Estado.ciudad;;
const genero = ciudad.genero;
function fotoPerfil(){
    console.log(genero)
    if (genero === "hombre"){
        divFoto.innerHTML = `<img src="../../media/inicio/rey.png">`
    }
    else{
        divFoto.innerHTML = `<img src="../../media/inicio/reina.png">`
    }
}

window.CeldasTablet = {
    inicializar,
    mostrarIndices
};