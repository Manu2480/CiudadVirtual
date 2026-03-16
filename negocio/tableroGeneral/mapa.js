/* ================================================
MAPA.JS
Render del grid e interacción con celdas.

Responsabilidades:
  - Construir el grid HTML según filas x columnas del Estado
  - Manejar clicks en celdas y despachar al modo activo
  - Gestionar la selección visual de celdas
  - Exponer API para que tablero.js actualice el modo

Dependencias: tablero.js (Estado), edificios.js, edificaciones.js
================================================ */


/* ================================================
ESTADO INTERNO DEL MAPA
================================================ */
const _mapaState = {
    nivelZoom:    1,
    zoomMin:      0.4,
    zoomMax:      2.5,
    zoomPaso:     0.15,
    celdaSelec:   null,
    grid:         [],      /* grid interno [fila][col] = { tipo } */
};


/* ================================================
REFERENCIAS AL DOM
================================================ */
let _gridEl = null;  /* <div id="mapa-grid"> */
let _areaEl = null;  /* <section id="area-mapa"> */


/* ================================================
INICIALIZAR
Construye el grid según las dimensiones del Estado.
Llamado desde tablero.js al arrancar.
================================================ */
function inicializar(filas, columnas, edificiosGuardados, vias) {
    _gridEl = document.getElementById("mapa-grid");
    _areaEl = document.getElementById("area-mapa");

    if (!_gridEl) {
        console.error("mapa.js: no se encontró #mapa-grid en el DOM.");
        return;
    }

    /* Valores de seguridad si tablero.js no pudo leer las dimensiones */
    filas    = (filas    && filas    > 0) ? filas    : 15;
    columnas = (columnas && columnas > 0) ? columnas : 15;

    /* Construye un mapa de ubicacion -> edificio para pintar las celdas ocupadas */
    const mapaEdificios = {};
    (edificiosGuardados || []).forEach(ed => {
        if (ed?.ubicacion) {
            const clave = `${ed.ubicacion.fila}-${ed.ubicacion.columna}`;
            mapaEdificios[clave] = ed;
        }
    });

    _gridEl.style.gridTemplateColumns = `repeat(${columnas}, var(--tamano-celda))`;
    _gridEl.style.gridTemplateRows    = `repeat(${filas}, var(--tamano-celda))`;
    _gridEl.style.gridTemplateRows    = `repeat(${filas}, var(--tamano-celda))`;
    _gridEl.innerHTML = "";

    /* Inicializa el grid interno vacío */
    _mapaState.grid = Array.from({ length: filas }, () =>
        Array.from({ length: columnas }, () => ({ tipo: "vacio" }))
    );

    /* Marca las vías en el grid interno */
    if (vias && Array.isArray(vias)) {
        for (let f = 0; f < filas && f < vias.length; f++) {
            for (let c = 0; c < columnas && c < vias[f].length; c++) {
                if (vias[f][c] === 1) {
                    _mapaState.grid[f][c].tipo = "via";
                }
            }
        }
    }

    /* Rellena celdas con edificios guardados */
    Object.entries(mapaEdificios).forEach(([clave, ed]) => {
        const [f, c] = clave.split("-").map(Number);
        if (_mapaState.grid[f]?.[c] !== undefined) {
            _mapaState.grid[f][c] = { tipo: ed.id || "edificio" };
        }
    });

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            const celda = _crearCeldaEl(f, c, _mapaState.grid[f][c]);
            _gridEl.appendChild(celda);
        }
    }

    /* Registra los eventos de interacción */
    _registrarEventos();
}


/* ================================================
CREAR ELEMENTO DE CELDA
Devuelve un <div> con las clases y datos correctos
según el estado de la celda (vacío, agua, edificio).
================================================ */
function _crearCeldaEl(fila, col, estado) {
    const el = document.createElement("div");
    el.classList.add("celda");
    el.dataset.fila = fila;
    el.dataset.col  = col;
    el.setAttribute("role", "gridcell");

    if (estado.tipo === "agua") {
        el.classList.add("celda--agua");
        el.setAttribute("aria-label", "Agua");

    } else if (estado.tipo === "via") {
        el.classList.add("celda--via");
        el.setAttribute("aria-label", "Vía");

    } else if (estado.tipo !== "vacio") {
        /* La celda tiene un edificio */
        el.classList.add("celda--construida");
        const edificio = window.Edificios ? window.Edificios.obtener(estado.tipo) : null;
        if (edificio) {
            el.setAttribute("aria-label", edificio.nombre);
            const img = document.createElement("img");
            img.src   = edificio.imagen;
            img.alt   = edificio.nombre;
            img.classList.add("celda__edificio");
            el.appendChild(img);
        }
    } else {
        el.setAttribute("aria-label", "Celda vacía");
    }

    return el;
}


/* ================================================
REGISTRAR EVENTOS DE INTERACCIÓN
Click en celda según el modo activo.
================================================ */
function _registrarEventos() {
    /* Delegación de eventos: un solo listener en el grid */
    _gridEl.addEventListener("click", _manejarClickCelda);
    _gridEl.addEventListener("dragover", _manejarDragOver);
    _gridEl.addEventListener("dragleave", _manejarDragLeave);
    _gridEl.addEventListener("drop", _manejarDrop);
}

function _manejarDragLeave(e) {
    const celda = e.target.closest(".celda");
    if (celda) {
        celda.classList.remove("celda--dragover");
    }
}

function _manejarDragOver(e) {
    e.preventDefault(); // Permitir drop
    e.dataTransfer.dropEffect = "copy";

    // Resaltar la celda sobre la que se está arrastrando
    const celda = e.target.closest(".celda");
    if (celda && !celda.classList.contains("celda--construida") && !celda.classList.contains("celda--agua")) {
        // Quitar clase de celdas anteriores
        document.querySelectorAll(".celda--dragover").forEach(el => el.classList.remove("celda--dragover"));
        celda.classList.add("celda--dragover");
    }
}

function _manejarDrop(e) {
    e.preventDefault();

    // Quitar resaltado
    document.querySelectorAll(".celda--dragover").forEach(el => el.classList.remove("celda--dragover"));

    const celda = e.target.closest(".celda");
    if (!celda) return;

    const fila = parseInt(celda.dataset.fila);
    const col = parseInt(celda.dataset.col);

    const edificioId = e.dataTransfer.getData("text/plain");
    if (edificioId) {
        _procesarDropConstruccion(celda, fila, col, edificioId);
    }
}

function _procesarDropConstruccion(celdaEl, fila, col, edificioId) {
    const estado = Tablero.Estado;
    if (!_mapaState.grid?.[fila]) return;
    const estadoCelda = _mapaState.grid[fila][col] || { tipo: "vacio" };

    if (estadoCelda.tipo === "vacio") {
        if (window.Edificaciones && typeof window.Edificaciones.construir === "function") {
            window.Edificaciones.construir(fila, col, edificioId, _mapaState.grid, _gridEl);
        } else {
            console.error("Edificaciones no disponible para construcción");
        }
    } else {
        // Mostrar notificación de error
        if (window.Notificaciones) {
            Notificaciones.mostrar("No se puede construir aquí. La celda ya está ocupada.", "error");
        }
    }
}

function _manejarClickCelda(e) {
    const celda = e.target.closest(".celda");
    if (!celda) return;

    const fila = parseInt(celda.dataset.fila);
    const col  = parseInt(celda.dataset.col);

    _procesarInteraccion(celda, fila, col);
}

function _procesarInteraccion(celdaEl, fila, col) {
    const estado      = Tablero.Estado;
    if (!_mapaState.grid?.[fila]) return;   /* grid aún no inicializado */
    const estadoCelda = _mapaState.grid[fila][col] || { tipo: "vacio" };

    switch (estado.modo) {

        case "normal":
            /* Click en edificio: abre modal de info */
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                const edificio = Edificios.obtener(estadoCelda.tipo);
                if (edificio) Modal.mostrarEdificio(edificio, fila, col);
            }
            /* Click en celda vacía: selecciona */
            else if (estadoCelda.tipo === "vacio") {
                _seleccionarCelda(celdaEl, fila, col);
            }
            break;

        case "construccion":
            if (estadoCelda.tipo === "vacio") {
                if (estado.edificioSeleccionado) {
                    /* Edificio ya seleccionado: construye */
                    Edificaciones.construir(fila, col, estado.edificioSeleccionado, _mapaState.grid, _gridEl);
                } else {
                    /* Sin edificio seleccionado: notifica para que la vista
                       muestre un selector. mapa.js no sabe qué vista es. */
                    document.dispatchEvent(new CustomEvent("mapa:celdaParaConstruir", {
                        detail: { fila, col, grid: _mapaState.grid, gridEl: _gridEl }
                    }));
                }
            }
            break;

        case "demolicion":
            /* Click en edificio: demuele */
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                Edificaciones.demoler(fila, col, _mapaState.grid, _gridEl);
            }
            break;
    }
}


/* ================================================
SELECCIONAR CELDA
Resalta visualmente la celda clickeada.
================================================ */
function _seleccionarCelda(celdaEl, fila, col) {
    /* Quita selección anterior */
    if (_mapaState.celdaSelec) {
        const anterior = _gridEl.querySelector(
            `[data-fila="${_mapaState.celdaSelec[0]}"][data-col="${_mapaState.celdaSelec[1]}"]`
        );
        if (anterior) anterior.classList.remove("celda--seleccionada");
    }

    celdaEl.classList.add("celda--seleccionada");
    _mapaState.celdaSelec = [fila, col];
}


/* ================================================
ACTUALIZAR MODO
Llamado desde tablero.js cuando cambia el modo.
Limpia la selección si corresponde.
================================================ */
function actualizarModo(nuevoModo) {
    if (nuevoModo === "normal") {
        /* Limpia cualquier celda seleccionada */
        if (_mapaState.celdaSelec) {
            const el = _gridEl.querySelector(
                `[data-fila="${_mapaState.celdaSelec[0]}"][data-col="${_mapaState.celdaSelec[1]}"]`
            );
            if (el) el.classList.remove("celda--seleccionada");
            _mapaState.celdaSelec = null;
        }
    }
}

/* ================================================
ZOOM
Aplica transform:scale al grid. El área scrollable
mantiene su tamaño — solo la cuadrícula escala.
================================================ */
function getZoom() {
    return _mapaState.nivelZoom;
}

function setZoom(nivel) {
    _mapaState.nivelZoom = Math.min(
        _mapaState.zoomMax,
        Math.max(_mapaState.zoomMin, nivel)
    );
    if (_gridEl) {
        _gridEl.style.transform       = `scale(${_mapaState.nivelZoom})`;
        _gridEl.style.transformOrigin = "top left";
    }
}

function acercar() {
    setZoom(_mapaState.nivelZoom + _mapaState.zoomPaso);
}

function alejar() {
    setZoom(_mapaState.nivelZoom - _mapaState.zoomPaso);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
function getGrid() {
    return _mapaState.grid;
}

window.Mapa = {
    inicializar,
    actualizarModo,
    getZoom,
    setZoom,
    acercar,
    alejar,
    getGrid,
};