/* ================================================
MAPA.JS
Render del grid y lógica de interacción con celdas.
Compartido por todas las vistas.

Responsabilidades:
  - Construir el grid HTML según filas x columnas del Estado
  - Manejar click/tap en celdas (construir, seleccionar, demoler)
  - Aplicar zoom (usado por controles de cada vista)
  - Exponer API para que tablero.js actualice el estado del grid

Dependencias: tablero.js (Estado), edificios.js
================================================ */


/* ================================================
ESTADO INTERNO DEL MAPA
================================================ */
const _mapaState = {
    nivelZoom:    1,       /* factor de escala actual */
    zoomMin:      0.4,
    zoomMax:      2.5,
    zoomPaso:     0.15,    /* incremento por cada click de zoom */
    celdaSelec:   null,    /* índice [fila][col] de la celda seleccionada */
    grid:         [],      /* grid interno [fila][col] = { tipo } */
};


/* ================================================
REFERENCIAS AL DOM
================================================ */
let _gridEl   = null;  /* <div id="mapa-grid"> */
let _areaEl   = null;  /* <section id="area-mapa"> */


/* ================================================
INICIALIZAR
Construye el grid según las dimensiones del Estado.
Llamado desde tablero.js al arrancar.
================================================ */
function inicializar(filas, columnas, edificiosGuardados) {
    _gridEl = document.getElementById("mapa-grid");
    _areaEl = document.getElementById("area-mapa");

    if (!_gridEl) {
        console.error("mapa.js: no se encontró #mapa-grid en el DOM.");
        return;
    }

    /* Valores de seguridad si tablero.js no pudo leer las dimensiones */
    filas    = (filas    && filas    > 0) ? filas    : 15;
    columnas = (columnas && columnas > 0) ? columnas : 15;

    /* En tablet el tamaño de celda se ajusta para que el grid quepa sin scroll horizontal */
    const vista = document.documentElement.getAttribute("data-vista");
    if (vista === "tablet") {
        _ajustarCeldaParaTablet(columnas);
    }

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
    _gridEl.innerHTML = "";

    /* Inicializa el grid interno vacío */
    _mapaState.grid = Array.from({ length: filas }, () =>
        Array.from({ length: columnas }, () => ({ tipo: "vacio" }))
    );

    /* Rellena las celdas ocupadas desde los edificios guardados */
    Object.entries(mapaEdificios).forEach(([clave, ed]) => {
        const [f, c] = clave.split("-").map(Number);
        if (_mapaState.grid[f] && _mapaState.grid[f][c] !== undefined) {
            _mapaState.grid[f][c] = { tipo: ed.id || "edificio", edificio: ed };
        }
    });

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {

            const estadoCelda = _mapaState.grid[f][c];
            const celda = _crearCeldaEl(f, c, estadoCelda);
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

    } else if (estado.tipo !== "vacio") {
        /* La celda tiene un edificio */
        el.classList.add("celda--construida");
        const edificio = Edificios.obtener(estado.tipo);
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
Click/tap en celda según el modo activo.
================================================ */
function _registrarEventos() {
    /* Delegación de eventos: un solo listener en el grid */
    _gridEl.addEventListener("click", _manejarClickCelda);
    _gridEl.addEventListener("touchend", _manejarTouchCelda, { passive: true });
}

function _manejarClickCelda(e) {
    const celda = e.target.closest(".celda");
    if (!celda) return;

    const fila = parseInt(celda.dataset.fila);
    const col  = parseInt(celda.dataset.col);

    _procesarInteraccion(celda, fila, col);
}

function _manejarTouchCelda(e) {
    /* En móvil el touchend puede no generar click si hubo un leve movimiento.
       Aquí interpretamos el toque como tap y procesamos la interacción. */
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const t = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const celda = el?.closest(".celda");
    if (!celda) return;

    const fila = parseInt(celda.dataset.fila);
    const col  = parseInt(celda.dataset.col);

    _procesarInteraccion(celda, fila, col);
}

function _procesarInteraccion(celdaEl, fila, col) {
    const estado      = Tablero.Estado;
    const estadoCelda = _mapaState.grid[fila]?.[col] || { tipo: "vacio" };

    console.log("mapa: interacción", { modo: estado.modo, fila, col, tipo: estadoCelda.tipo });

    switch (estado.modo) {

        case "normal":
            /* Tap en edificio: abre modal de info */
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                const edificio = Edificios.obtener(estadoCelda.tipo);
                if (edificio) Modal.mostrarEdificio(edificio, fila, col);
            }
            /* Tap en celda vacía: selecciona + abre el menú de construcción en móvil */
            else if (estadoCelda.tipo === "vacio") {
                _seleccionarCelda(celdaEl, fila, col);
                _abrirMenuConstruccionMovil();
            }
            break;

        case "construccion":
            /* Tap en celda vacía: construye el edificio seleccionado */
            if (estadoCelda.tipo === "vacio" && estado.edificioSeleccionado) {
                construirEdificio(fila, col, estado.edificioSeleccionado);
            }
            break;

        case "demolicion":
            /* Tap en edificio: demuele */
            if (estadoCelda.tipo !== "vacio" && estadoCelda.tipo !== "agua") {
                demolerEdificio(fila, col);
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
CONSTRUIR EDIFICIO
Coloca un edificio en la celda indicada y actualiza
el Estado y el DOM.
================================================ */
function construirEdificio(fila, col, idEdificio) {
    const edificio = Edificios.obtener(idEdificio);
    if (!edificio) return;

    /* Verifica recursos */
    if (!Recursos.puedeConstructir(edificio)) {
        Notificaciones.mostrar(`No tienes suficiente dinero para construir ${edificio.nombre}.`, "error");
        return;
    }

    /* Actualiza el grid interno */
    _mapaState.grid[fila][col] = { tipo: idEdificio };

    /* Actualiza el DOM */
    const celdaEl = _gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (celdaEl) {
        celdaEl.innerHTML = "";
        celdaEl.classList.add("celda--construida");
        celdaEl.classList.remove("celda--seleccionada");

        const img = document.createElement("img");
        img.src   = edificio.imagen;
        img.alt   = edificio.nombre;
        img.classList.add("celda__edificio");
        celdaEl.appendChild(img);
        celdaEl.setAttribute("aria-label", edificio.nombre);
    }

    /* Descuenta recursos */
    Recursos.cobrarConstruccion(edificio);

    Notificaciones.mostrar(`${edificio.nombre} construido.`, "exito");
}


/* ================================================
DEMOLER EDIFICIO
Elimina el edificio de la celda y restaura la celda vacía.
================================================ */
function demolerEdificio(fila, col) {
    const tipo = _mapaState.grid[fila][col].tipo;
    const edificio = Edificios.obtener(tipo);

    _mapaState.grid[fila][col] = { tipo: "vacio" };

    const celdaEl = _gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (celdaEl) {
        celdaEl.innerHTML = "";
        celdaEl.classList.remove("celda--construida");
        celdaEl.setAttribute("aria-label", "Celda vacía");
    }

    Notificaciones.mostrar(
        edificio ? `${edificio.nombre} demolido.` : "Edificio demolido.",
        "aviso"
    );
}


/* ================================================
ACTUALIZAR MODO
Llamado desde tablero.js cuando cambia el modo.
Actualiza el cursor y limpia la selección si corresponde.
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

/* En móvil, al tocar una celda vacía abrimos automáticamente la tab "Construir" */
function _abrirMenuConstruccionMovil() {
    const vista = document.documentElement.getAttribute("data-vista");
    console.log("mapa: intentar abrir menú construcción móvil (vista)", vista);
    if (vista !== "movil") return;

    const tab = document.querySelector("#tabs-movil .tab[data-panel=\"menu-construccion\"]");
    if (tab) {
        console.log("mapa: haciendo click en tab de construcción");
        tab.click();
    } else {
        console.warn("mapa: no se encontró tab de construcción, forzando menú directamente");
        _mostrarMenuConstruccionMovil();
    }
}

function _mostrarMenuConstruccionMovil() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) {
        console.warn("mapa: no se encontró #menu-construccion");
        return;
    }

    /* Si está dentro del sidebar oculto, lo movemos al body */
    const sidebar = menu.closest(".sidebar--izquierdo");
    if (sidebar) document.body.appendChild(menu);

    /* Asegura que el panel esté visible */
    menu.classList.add("abierto");
    menu.style.display = "block";
    menu.style.position = "fixed";
    menu.style.top = "var(--alto-encabezado)";
    menu.style.bottom = "var(--alto-tabs)";
    menu.style.left = "0";
    menu.style.right = "0";
    menu.style.zIndex = "2000";
    menu.style.background = "rgba(255,255,255,0.98)";
    menu.style.border = "2px solid rgba(0,0,0,0.25)";

    /* Si no está poblado, creamos el listado de edificios (fallback) */
    if (!menu.querySelector(".construccion-lista") && window.Edificios && window.Tablero) {
        const lista = document.createElement("div");
        lista.className = "construccion-lista";

        Edificios.todos().forEach(edificio => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "construccion-item";
            btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo}`);
            btn.innerHTML = `
                <img src="${edificio.imagen}" alt="" class="construccion-item__imagen" />
                <span class="construccion-item__nombre">${edificio.nombre}</span>
                <span class="construccion-item__costo">$${edificio.costo}</span>
            `;
            btn.addEventListener("click", () => {
                Tablero.seleccionarEdificio(edificio.id);
                window.Notificaciones?.mostrar(`Seleccionado: ${edificio.nombre}. Toca una celda vacía para construir.`, "aviso");
            });
            lista.appendChild(btn);
        });

        menu.appendChild(lista);
        console.log("mapa: menú de construcción fallback generado", { items: lista.childElementCount });
    }
}


/* ================================================
AJUSTE DE CELDA PARA TABLET
Calcula el tamaño de celda para que el grid quepa
exactamente en el ancho del área del mapa sin scroll horizontal.
Solo se llama cuando data-vista="tablet".
================================================ */
function _ajustarCeldaParaTablet(columnas) {
    /* Ancho disponible del área del mapa (ya tiene su 70% del layout aplicado) */
    const anchoArea = _areaEl.getBoundingClientRect().width || _areaEl.offsetWidth;

    if (anchoArea <= 0) {
        /* El área aún no tiene dimensiones (p.ej. aún no pintó el layout).
           Reintenta en el siguiente frame. */
        requestAnimationFrame(() => _ajustarCeldaParaTablet(columnas));
        return;
    }

    /* Tamaño de celda = ancho disponible dividido entre el número de columnas.
       Se acota entre 20px (mínimo legible) y 48px (tamaño base de desktop). */
    const tamano = Math.min(48, Math.max(20, Math.floor(anchoArea / columnas)));
    document.documentElement.style.setProperty("--tamano-celda", `${tamano}px`);

    /* Guarda el número de columnas para recalcular si cambia la orientación */
    _mapaState.columnasTablet = columnas;
}


/* ================================================
ZOOM
Usado por controles de cada vista:
- Desktop: botones +/- y rueda del ratón
- Móvil/Tablet: pinch gesture (controles-movil.js / controles-tablet.js)
================================================ */
function acercar() {
    _aplicarZoom(_mapaState.nivelZoom + _mapaState.zoomPaso);
}

function alejar() {
    _aplicarZoom(_mapaState.nivelZoom - _mapaState.zoomPaso);
}

function _aplicarZoom(nuevoZoom) {
    /* En tablet el zoom no puede superar 1 (el grid ya ocupa el ancho exacto).
       Alejar sí está permitido para ver el mapa completo con más perspectiva. */
    const vista   = document.documentElement.getAttribute("data-vista");
    const zoomMax = vista === "tablet" ? 1 : _mapaState.zoomMax;

    _mapaState.nivelZoom = Math.min(zoomMax,
                           Math.max(_mapaState.zoomMin, nuevoZoom));
    _gridEl.style.transform = `scale(${_mapaState.nivelZoom})`;
}

function setZoom(valor) {
    _aplicarZoom(valor);
}

function getZoom() {
    return _mapaState.nivelZoom;
}


/* ================================================
RECALCULAR TAMAÑO DE CELDA EN TABLET AL ROTAR/REDIMENSIONAR
En tablet la orientación puede cambiar (HU-023), lo que modifica
el ancho disponible del área del mapa y requiere recalcular la celda.
================================================ */
window.addEventListener("resize", () => {
    const vista = document.documentElement.getAttribute("data-vista");
    if (vista === "tablet" && _mapaState.columnasTablet) {
        _ajustarCeldaParaTablet(_mapaState.columnasTablet);
    }
});


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Mapa = {
    inicializar,
    construirEdificio,
    demolerEdificio,
    actualizarModo,
    acercar,
    alejar,
    setZoom,
    getZoom,
};