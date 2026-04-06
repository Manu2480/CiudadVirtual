/* ================================================
CELDA ADAPTABLE TABLET
Calcula el tamaño de celda para que el grid quepa
exactamente en el ancho del área del mapa sin scroll horizontal.

Dependencias: Tablero.Estado.columnas
================================================ */
const divFoto = document.getElementById("foto-perfil");;
const ciudad =  Tablero.Estado.ciudad;
const genero = ciudad.genero;
const areaMapa = document.getElementById("area-mapa");
function inicializar() {
    if (!window.Tablero?.Estado?.ciudad) {
        setTimeout(inicializar, 30);
        return;
    }
    _ajustar();
    calcularCeldasVisibles(); 
    renderizarViewport();
    mostrarIndices();

    document.dispatchEvent(new Event("mapa:renderizado"));

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
    calcularCeldasVisibles();

    switch (direccion) {
        case "arriba":
            viewport.filaInicio = Math.max(0, viewport.filaInicio - (viewport.filasVisibles - 2));
            break;

        case "abajo":
            viewport.filaInicio = Math.min(filasMax - viewport.filasVisibles,
                viewport.filaInicio + (viewport.filasVisibles - 2));
            break;

        case "izquierda":
            viewport.colInicio = Math.max(0,
                viewport.colInicio - (viewport.columnasVisibles - 2));
            break;

        case "derecha": {
            const salto = viewport.columnasVisibles - 2;
            const limiteMax = colsMax - viewport.columnasVisibles;
            const intento = viewport.colInicio + salto;
            const resultado = Math.min(limiteMax, intento);
            viewport.colInicio = resultado;
            break;
        }
    }

    // Re-renderizar el viewport
    _clampViewport();
    rerender();
    document.dispatchEvent(new Event("mapa:renderizado"));
}
window.addEventListener("resize", () =>{
    _ajustar();
    calcularCeldasVisibles(); 
    renderizarViewport();
    mostrarIndices();
    document.dispatchEvent(new Event("mapa:renderizado"));
});
const viewport = {
    filaInicio: 0,
    colInicio: 0,
    filasVisibles: 0,
    columnasVisibles: 0
};
function _ajustar() {
    const columnas = window.Tablero?.Estado?.columnas +2;
    const filas    = window.Tablero?.Estado?.filas +2;//Agregar el +2 porque es el tamaño que ocuparian los indices y las flechas
    const TAM_DEFAULT = 55;


    if (!columnas || !filas) {
        setTimeout(_ajustar, 100);
        return;
    }

    const areaMapa = document.getElementById("area-mapa");
    if (!areaMapa) return;

    const rect = areaMapa.getBoundingClientRect();
    const anchoDisponible = rect.width;
    const altoDisponible  = rect.height;

    //calcular tamaño mínimo para que todo el mapa quepa
    const tamX = anchoDisponible / columnas;
    const tamY = altoDisponible / filas;

    const tamMinimo = Math.floor(Math.max(tamX, tamY));
    const tamCelda = Math.max(TAM_DEFAULT, tamMinimo);

    document.documentElement.style.setProperty("--tamano-celda", `${tamCelda}px`);

    // guardar para usarlo como límite de zoom
    window._celdasTabletState = window._celdasTabletState || {};
    window._celdasTabletState.tamMinimo = tamMinimo;

    console.log(`Celda dinámica: ${columnas}x${filas} → ${tamCelda}px`);
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
    const mapa = document.getElementById("area-mapa");

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

    viewport.columnasVisibles = Math.floor(ancho / tamCelda -2);
    viewport.filasVisibles = Math.floor(alto / tamCelda -2);
}
function renderizarViewport() {
    const gridEl = document.getElementById("mapa-grid");
    gridEl.innerHTML = "";

    const tamCelda = parseInt(
        getComputedStyle(document.documentElement)
        .getPropertyValue("--tamano-celda")
    ) || 44;

    const ancho = gridEl.parentElement.clientWidth;
    const alto  = gridEl.parentElement.clientHeight;

    viewport.columnasVisibles = Math.floor(ancho / tamCelda) + 1;
    viewport.filasVisibles    = Math.floor(alto / tamCelda) + 1;

    gridEl.style.gridTemplateColumns = `repeat(${viewport.columnasVisibles}, ${tamCelda}px)`;
    gridEl.style.gridTemplateRows    = `repeat(${viewport.filasVisibles}, ${tamCelda}px)`;

    const gridEstado = window.Mapa.getGrid();

    for (let f = 0; f < viewport.filasVisibles; f++) {
        for (let c = 0; c < viewport.columnasVisibles; c++) {

            const filaReal = viewport.filaInicio + f;
            const colReal  = viewport.colInicio + c;

            const estado = gridEstado?.[filaReal]?.[colReal] || { tipo: "vacio" };
            const celda = _crearCeldaEl(filaReal, colReal, estado);

            gridEl.appendChild(celda);
        }
    }
}
function fotoPerfil(){
    console.log(genero)
    if (genero === "hombre"){
        divFoto.innerHTML = `<img src="../../media/inicio/rey.png">`
    }
    else{
        divFoto.innerHTML = `<img src="../../media/inicio/reina.png">`
    }
}

function rerender() {
    calcularCeldasVisibles();
    _clampViewport();
    renderizarViewport();
    mostrarIndices();
    document.dispatchEvent(new Event("mapa:renderizado"));
}
function _clampViewport() {
    const gridEstado = window.Mapa.getGrid();
    const filasMax = gridEstado.length;
    const colsMax  = gridEstado[0]?.length || 0;

    viewport.filaInicio = Math.max(
        0,
        Math.min(viewport.filaInicio, filasMax - viewport.filasVisibles)
    );

    viewport.colInicio = Math.max(
        0,
        Math.min(viewport.colInicio, colsMax - viewport.columnasVisibles)
    );
}

window.CeldasTablet = {
    inicializar,
    mostrarIndices,
    renderizarViewport,
    rerender
};