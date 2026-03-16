/* ================================================
   MAPA.JS - VERSIÓN "OBJETO ÚNICO"
   Todo (vías y edificios) se trata como un objeto del catálogo.
   ================================================ */

const _mapaState = {
    nivelZoom: 1,
    zoomMin: 0.4,
    zoomMax: 2.5,
    zoomPaso: 0.15,
    celdaSelec: null,
    grid: []
};

let _gridEl = null;
let _areaEl = null;

// Normalizador: asegura que "via1", "casa2", etc., busquen su imagen base
function _normalizarId(id) {
    if (!id) return "edificio";
    if (window.Edificios?.obtener(id)) return id;

    const _prefijos = {
        "via": "via",
        "casa": "casa",
        "apartamento": "apartamento",
        "tienda": "tienda",
        "centrocomercial": "centro-comercial",
        "fabrica": "fabrica",
        "granja": "granja",
        "hospital": "hospital",
        "bombero": "bombero",
        "policia": "policia",
        "parque": "parque",
        "luz": "planta-electrica",
        "agua": "planta-hidraulica",
    };
    const prefijo = id.replace(/\d+$/, "").toLowerCase();
    return _prefijos[prefijo] || id;
}

function inicializar(filas, columnas, edificiosGuardados) {
    _gridEl = document.getElementById("mapa-grid");
    _areaEl = document.getElementById("area-mapa");

    if (!_gridEl) return;

    filas = filas || 15;
    columnas = columnas || 15;

    _gridEl.style.gridTemplateColumns = `repeat(${columnas}, var(--tamano-celda))`;
    _gridEl.style.gridTemplateRows = `repeat(${filas}, var(--tamano-celda))`;
    _gridEl.innerHTML = "";

    // Inicializar grid vacío
    _mapaState.grid = Array.from({ length: filas }, () =>
        Array.from({ length: columnas }, () => ({ tipo: "vacio" }))
    );

    // Llenar el grid (Vías y Edificios entran aquí por igual)
    (edificiosGuardados || []).forEach(ed => {
        if (ed?.ubicacion) {
            const { fila: f, columna: c } = ed.ubicacion;
            if (_mapaState.grid[f]?.[c]) {
                _mapaState.grid[f][c] = { tipo: _normalizarId(ed.id) };
            }
        }
    });

    // Renderizar celdas
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            _gridEl.appendChild(_crearCeldaEl(f, c, _mapaState.grid[f][c]));
        }
    }

    _registrarEventos();
}

function _crearCeldaEl(fila, col, estado) {
    const el = document.createElement("div");
    el.className = "celda";
    el.dataset.fila = fila;
    el.dataset.col = col;

    if (estado.tipo === "agua") {
        el.classList.add("celda--agua");
    } 
    // Aquí ya NO hay "else if (tipo === via)"
    else if (estado.tipo !== "vacio") {
        el.classList.add("celda--construida");
        
        // BUSCA EN EL CATÁLOGO (vías, casas, etc.)
        const edificio = window.Edificios?.obtener(estado.tipo);
        if (edificio) {
            const img = document.createElement("img");
            img.src = edificio.imagen;
            img.className = "celda__edificio";
            el.appendChild(img);
        }
    }
    return el;
}

/* --- EVENTOS (Drag&Drop y Clicks) --- */

function _registrarEventos() {
    _gridEl.addEventListener("click", _manejarClickCelda);
    
    // Drag & Drop genérico
    _gridEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        const celda = e.target.closest(".celda");
        if (celda && !celda.classList.contains("celda--construida")) {
            document.querySelectorAll(".celda--dragover").forEach(el => el.classList.remove("celda--dragover"));
            celda.classList.add("celda--dragover");
        }
    });

    _gridEl.addEventListener("drop", (e) => {
        e.preventDefault();
        document.querySelectorAll(".celda--dragover").forEach(el => el.classList.remove("celda--dragover"));
        const celda = e.target.closest(".celda");
        const id = e.dataTransfer.getData("text/plain");
        if (celda && id) {
            const f = parseInt(celda.dataset.fila);
            const c = parseInt(celda.dataset.col);
            window.Edificaciones?.construir(f, c, id, _mapaState.grid, _gridEl);
        }
    });
}

function _manejarClickCelda(e) {
    const celda = e.target.closest(".celda");
    if (!celda) return;
    const f = parseInt(celda.dataset.fila);
    const c = parseInt(celda.dataset.col);
    
    const modo = window.Tablero?.Estado?.modo;
    const estadoCelda = _mapaState.grid[f][c];

    switch (modo) {
        case "normal":
            // Si hay algo (vía o casa), abrir modal
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                const ed = window.Edificios?.obtener(estadoCelda.tipo);
                if (ed) window.Modal?.mostrarEdificio(ed, f, c);
            } else {
                _seleccionarCelda(celda, f, c);
            }
            break;

        case "construccion":
            if (estadoCelda.tipo === "vacio") {
                const selec = window.Tablero.Estado.edificioSeleccionado;
                if (selec) window.Edificaciones.construir(f, c, selec, _mapaState.grid, _gridEl);
            }
            break;

        case "demolicion":
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                window.Edificaciones.demoler(f, c, _mapaState.grid, _gridEl);
            }
            break;
    }
}

function _seleccionarCelda(celdaEl, fila, col) {
    _gridEl.querySelector(".celda--seleccionada")?.classList.remove("celda--seleccionada");
    celdaEl.classList.add("celda--seleccionada");
    _mapaState.celdaSelec = [fila, col];
}

// API Pública de Zoom
window.Mapa = {
    inicializar,
    actualizarModo: (modo) => {
        if (modo === "normal") {
            _gridEl.querySelector(".celda--seleccionada")?.classList.remove("celda--seleccionada");
            _mapaState.celdaSelec = null;
        }
    },
    setZoom: (nivel) => {
        _mapaState.nivelZoom = Math.min(_mapaState.zoomMax, Math.max(_mapaState.zoomMin, nivel));
        _gridEl.style.transform = `scale(${_mapaState.nivelZoom})`;
        _gridEl.style.transformOrigin = "top left";
    },
    acercar: () => window.Mapa.setZoom(_mapaState.nivelZoom + _mapaState.zoomPaso),
    alejar: () => window.Mapa.setZoom(_mapaState.nivelZoom - _mapaState.zoomPaso),
    getGrid: () => _mapaState.grid
};