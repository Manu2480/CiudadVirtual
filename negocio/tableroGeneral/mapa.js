/* ================================================
MAPA.JS
Render del grid e interacción con celdas.
Compartido por todas las vistas.

Responsabilidades:
  - Construir el grid HTML según filas x columnas
  - Manejar clicks y drag&drop en celdas
  - Gestionar selección visual de celdas
  - Exponer API de zoom para vistas que la necesiten
  - Exponer API para que tablero.js actualice el modo

Dependencias: tablero.js, edificios.js, edificaciones.js,
              modal.js, notificaciones.js
================================================ */


/* ================================================ 
ESTADO INTERNO
================================================ */
const _mapaState = {
    nivelZoom:  1,
    zoomMin:    0.4,
    zoomMax:    2.5,
    zoomPaso:   0.15,
    celdaSelec: null,
    grid:       [],
};


/* ================================================
REFERENCIAS AL DOM
================================================ */
let _gridEl = null;
let _areaEl = null;


/* ================================================
NORMALIZAR ID
Los modelos generan ids únicos con contador (via1, casa2…).
Los normaliza al id del catálogo para que Edificios.obtener()
los encuentre correctamente al recargar desde localStorage.

Usa IdNormalizador centralizado para evitar duplicación.
================================================ */
function _normalizarId(id) {
    const normalizado = IdNormalizador.normalizar(id);
    if (Edificios.obtener(normalizado)) return normalizado;
    return normalizado;
}


/* ================================================
INICIALIZAR
================================================ */
function inicializar(filas, columnas, edificiosGuardados) {
    _gridEl = document.getElementById("mapa-grid");
    _areaEl = document.getElementById("area-mapa");

    if (!_gridEl) {
        console.error("mapa.js: no se encontró #mapa-grid en el DOM.");
        return;
    }

    filas    = (filas    && filas    > 0) ? filas    : 15;
    columnas = (columnas && columnas > 0) ? columnas : 15;

    document.documentElement.style.setProperty("--columnas", `${columnas}`);
    document.documentElement.style.setProperty("--filas",`${filas}`);
    _gridEl.innerHTML = "";

    _mapaState.grid = Array.from({ length: filas }, () =>
        Array.from({ length: columnas }, () => ({ tipo: "vacio" }))
    );

    (edificiosGuardados || []).forEach(ed => {
        if (ed?.ubicacion) {
            const { fila: f, columna: c } = ed.ubicacion;
            if (_mapaState.grid[f]?.[c] !== undefined) {
                _mapaState.grid[f][c] = { tipo: _normalizarId(ed.id) };
            }
        }
    });

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            _gridEl.appendChild(_crearCeldaEl(f, c, _mapaState.grid[f][c]));
        }
    }

    _registrarEventos();
}


/* ================================================
CREAR ELEMENTO DE CELDA
================================================ */
function _crearCeldaEl(fila, col, estado) {
    const el = document.createElement("div");
    el.classList.add("celda");
    el.dataset.fila = fila;
    el.dataset.col  = col;
    el.setAttribute("role", "gridcell");

    if (estado.tipo !== "vacio") {
        el.classList.add("celda--construida");
        const edificio = Edificios.obtener(estado.tipo);
        if (edificio) {
            el.setAttribute("aria-label", edificio.nombre);
            el.title = Edificios.tooltip ? Edificios.tooltip(edificio) : edificio.nombre;
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
REGISTRAR EVENTOS
================================================ */
function _registrarEventos() {
    _gridEl.addEventListener("click", _manejarClickCelda);

    /* Drag & Drop — usado por la vista desktop */
    _gridEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        const celda = e.target.closest(".celda");
        if (celda && !celda.classList.contains("celda--construida")) {
            document.querySelectorAll(".celda--dragover")
                .forEach(el => el.classList.remove("celda--dragover"));
            celda.classList.add("celda--dragover");
        }
    });

    _gridEl.addEventListener("drop", (e) => {
        e.preventDefault();
        document.querySelectorAll(".celda--dragover")
            .forEach(el => el.classList.remove("celda--dragover"));
        const celda = e.target.closest(".celda");
        const id    = e.dataTransfer?.getData("text/plain");
        if (celda && id) {
            const f = parseInt(celda.dataset.fila);
            const c = parseInt(celda.dataset.col);
            Edificaciones.construir(f, c, id, _mapaState.grid, _gridEl);
        }
    });
}


/* ================================================
MANEJAR CLICK EN CELDA
El comportamiento varía según el modo activo y la vista.
- modo normal:
    · desktop → abre modal de info del edificio
    · móvil   → notifica que vaya a Construir
- modo construccion:
    · si hay edificio seleccionado → construye directamente
    · si no → dispara evento para que la vista abra el catálogo
- modo demolicion → demuela directamente
================================================ */
function _manejarClickCelda(e) {
    const celda = e.target.closest(".celda");
    if (!celda) return;

    const fila = parseInt(celda.dataset.fila);
    const col  = parseInt(celda.dataset.col);

    if (!_mapaState.grid?.[fila]) return;
    const estadoCelda = _mapaState.grid[fila][col] || { tipo: "vacio" };
    const estado      = Tablero.Estado;

    switch (estado.modo) {

        case "normal": {
            const vista = document.documentElement.getAttribute("data-vista");
            if (vista === "movil") {
                /* En móvil cualquier click en el mapa redirige a Construir */
                Notificaciones.mostrar(
                    estadoCelda.tipo !== "vacio"
                        ? "Ve a la tab Construir para edificar o demoler."
                        : "Ve a la tab Construir para edificar.",
                    "aviso"
                );
            } else {
                /* Desktop: celda construida abre modal, vacía la selecciona */
                if (estadoCelda.tipo !== "vacio") {
                    const edificio = Edificios.obtener(estadoCelda.tipo);
                    if (edificio) Modal.mostrarEdificio(edificio, fila, col);
                } else {
                    _seleccionarCelda(celda, fila, col);
                }
            }
            break;
        }

        case "construccion":
            if (estadoCelda.tipo === "vacio") {
                if (estado.edificioSeleccionado) {
                    Edificaciones.construir(fila, col, estado.edificioSeleccionado, _mapaState.grid, _gridEl);
                } else {
                    /* Sin edificio seleccionado: notifica a la vista para
                       que muestre el selector. mapa.js no sabe qué vista es. */
                    document.dispatchEvent(new CustomEvent("mapa:celdaParaConstruir", {
                        detail: { fila, col, grid: _mapaState.grid, gridEl: _gridEl }
                    }));
                }
            } else {
                /* Click en edificio construido en modo construccion:
                   abre modal con info y opción de demoler */
                const edificio = Edificios.obtener(estadoCelda.tipo);
                if (edificio) Modal.mostrarEdificio(edificio, fila, col);
            }
            break;

        case "demolicion":
            if (estadoCelda.tipo !== "vacio") {
                const edificio = Edificios.obtener(estadoCelda.tipo);
                const instancia = Tablero.Estado.ciudad?.terreno?.ubicacionInfraestructura(fila, col);
                if (edificio) Modal.mostrarConfirmacionDemoler(fila, col, edificio, instancia);
            }
            break;

        case "ruta":
            /* Cualquier celda construida (edificio o vía) es seleccionable */
            if (estadoCelda.tipo !== "vacio") {
                document.dispatchEvent(new CustomEvent("mapa:celdaRuta", {
                    detail: { fila, col, tipo: estadoCelda.tipo, celdaEl: celda }
                }));
            }
            break;
    }
}


/* ================================================
SELECCIONAR CELDA
================================================ */
function _seleccionarCelda(celdaEl, fila, col) {
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
================================================ */
function actualizarModo(nuevoModo) {
    if ((nuevoModo === "normal" || nuevoModo === "ruta") && _mapaState.celdaSelec) {
        const el = _gridEl.querySelector(
            `[data-fila="${_mapaState.celdaSelec[0]}"][data-col="${_mapaState.celdaSelec[1]}"]`
        );
        if (el) el.classList.remove("celda--seleccionada");
        _mapaState.celdaSelec = null;
    }
    /* Las marcas celda--ruta-a, celda--ruta-b y celda--ruta
       las gestiona ruta.js mediante limpiarTodo(). No se tocan aquí. */
}


/* ================================================
ZOOM
API para vistas que manejan zoom (desktop con botones,
móvil con pinch desde zoom.js).
================================================ */
function setZoom(nivel) {
    _mapaState.nivelZoom = Math.min(
        _mapaState.zoomMax,
        Math.max(_mapaState.zoomMin, nivel)
    );
    if (_gridEl) {
        document.documentElement.style.setProperty("--zoom", _mapaState.nivelZoom);
    }
}

function getZoom()  { return _mapaState.nivelZoom; }
function acercar()  { setZoom(_mapaState.nivelZoom + _mapaState.zoomPaso); }
function alejar()   { setZoom(_mapaState.nivelZoom - _mapaState.zoomPaso); }
function getGrid()  { return _mapaState.grid; }


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Mapa = {
    inicializar,
    actualizarModo,
    setZoom,
    getZoom,
    acercar,
    alejar,
    getGrid,
};