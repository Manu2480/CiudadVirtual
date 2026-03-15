/* ================================================
MICHAELCONTROLESDESKTOP.JS
Controles específicos para la vista Desktop (HU-024)

Responsabilidades:
  - Controles de zoom estático (+/-)
  - Atajos de teclado (B, R, D, ESC, Space, S)
  - Sistema de arrastre del mapa (drag)
  - Indicador visual de modo activo
  - Tooltips dinámicos en edificios
  - Guardado de partida

El zoom es ESTÁTICO respecto al movimiento del mapa:
  - El zoom se aplica al grid mediante transform: scale()
  - El nivel de zoom NO cambia al arrastrar el mapa
  - Solo los botones +/- y teclas controlan el zoom
================================================ */


/* ================================================
   ESTADO INTERNO DEL CONTROLADOR
================================================ */
const _desktopState = {
    zoomActual: 1,
    zoomMin: 0.5,
    zoomMax: 2,
    zoomPaso: 0.25,
    zoomNiveles: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],

    // Estado del arrastre del mapa
    arrastrando: false,
    inicioX: 0,
    inicioY: 0,
    scrollInicioX: 0,
    scrollInicioY: 0,

    // Referencias al DOM
    areaMapa: null,
    gridMapa: null,
    btnZoomIn: null,
    btnZoomOut: null,
    controlesZoom: null,
    zoomIndicador: null,
    indicadorModo: null
};


/* ================================================
   INICIALIZACIÓN
   Se ejecuta cuando el DOM está listo.
================================================ */
document.addEventListener("DOMContentLoaded", () => {
    console.log("controlesDesktop.js: Inicializando controles desktop...");

    _inicializarReferencias();
    _inicializarZoom();
    _inicializarArrastre();
    _inicializarAtajos();
    _crearIndicadorModo();
    _inicializarTooltipsEdificios();

    console.log("controlesDesktop.js: Controles desktop inicializados.");
});


/* ================================================
   INICIALIZAR REFERENCIAS AL DOM
================================================ */
function _inicializarReferencias() {
    _desktopState.areaMapa = document.getElementById("area-mapa");
    _desktopState.gridMapa = document.getElementById("mapa-grid");
    _desktopState.btnZoomIn = document.getElementById("btn-zoom-in");
    _desktopState.btnZoomOut = document.getElementById("btn-zoom-out");
    _desktopState.controlesZoom = document.getElementById("controles-zoom");

    if (!_desktopState.areaMapa || !_desktopState.gridMapa) {
        console.error("controlesDesktop.js: No se encontraron elementos del mapa.");
        return;
    }
}


/* ================================================
   SISTEMA DE ZOOM ESTÁTICO
   El zoom se aplica al grid y permanece fijo
   durante el movimiento/arrastre del mapa.
================================================ */
function _inicializarZoom() {
    // Crear indicador de zoom
    _crearIndicadorZoom();

    // Event listeners para botones de zoom
    if (_desktopState.btnZoomIn) {
        _desktopState.btnZoomIn.addEventListener("click", () => _acercar());
    }

    if (_desktopState.btnZoomOut) {
        _desktopState.btnZoomOut.addEventListener("click", () => _alejar());
    }

    // Zoom con rueda del mouse (opcional, solo con Ctrl)
    _desktopState.areaMapa.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                _acercar();
            } else {
                _alejar();
            }
        }
    }, { passive: false });

    // Actualizar estado inicial de botones
    _actualizarBotonesZoom();
    _aplicarZoom(_desktopState.zoomActual);
}


/* ================================================
   CREAR INDICADOR DE ZOOM
   Muestra el nivel de zoom actual entre los botones.
================================================ */
function _crearIndicadorZoom() {
    if (!_desktopState.controlesZoom) return;

    // Verificar si ya existe el indicador
    const existente = _desktopState.controlesZoom.querySelector(".zoom-indicador");
    if (existente) {
        _desktopState.zoomIndicador = existente;
        return;
    }

    // Crear elemento indicador
    _desktopState.zoomIndicador = document.createElement("span");
    _desktopState.zoomIndicador.className = "zoom-indicador";
    _desktopState.zoomIndicador.textContent = `${Math.round(_desktopState.zoomActual * 100)}%`;

    // Insertar entre los botones de zoom
    const btnIn = _desktopState.controlesZoom.querySelector("#btn-zoom-in");
    const btnOut = _desktopState.controlesZoom.querySelector("#btn-zoom-out");

    if (btnOut && btnIn) {
        _desktopState.controlesZoom.insertBefore(_desktopState.zoomIndicador, btnIn);
    }
}


/* ================================================
   APLICAR ZOOM
   Aplica el zoom al grid y actualiza la UI.
================================================ */
function _aplicarZoom(nuevoZoom) {
    // Limitar zoom a los valores permitidos
    _desktopState.zoomActual = Math.min(
        _desktopState.zoomMax,
        Math.max(_desktopState.zoomMin, nuevoZoom)
    );

    // Aplicar transform al grid
    _desktopState.gridMapa.style.transform = `scale(${_desktopState.zoomActual})`;

    // Actualizar atributo data-zoom para CSS
    _desktopState.gridMapa.setAttribute("data-zoom", _desktopState.zoomActual);

    // Actualizar variable CSS
    document.documentElement.style.setProperty("--zoom-actual", _desktopState.zoomActual);

    // Actualizar indicador
    if (_desktopState.zoomIndicador) {
        _desktopState.zoomIndicador.textContent = `${Math.round(_desktopState.zoomActual * 100)}%`;
    }

    // Actualizar estado de botones
    _actualizarBotonesZoom();

    // Sincronizar con Mapa.js si está disponible
    if (window.Mapa && typeof window.Mapa.setZoom === "function") {
        window.Mapa.setZoom(_desktopState.zoomActual);
    }
}


/* ================================================
   ACERCAR / ALEJAR
   Incrementa o decrementa el zoom un paso.
================================================ */
function _acercar() {
    const indiceActual = _desktopState.zoomNiveles.findIndex(
        z => z >= _desktopState.zoomActual
    );

    if (indiceActual < _desktopState.zoomNiveles.length - 1) {
        _aplicarZoom(_desktopState.zoomNiveles[indiceActual + 1]);
    }
}

function _alejar() {
    const indiceActual = _desktopState.zoomNiveles.findIndex(
        z => z >= _desktopState.zoomActual
    );

    if (indiceActual > 0) {
        _aplicarZoom(_desktopState.zoomNiveles[indiceActual - 1]);
    } else {
        _aplicarZoom(_desktopState.zoomNiveles[0]);
    }
}


/* ================================================
   ACTUALIZAR BOTONES DE ZOOM
   Deshabilita los botones cuando se alcanzan
   los límites de zoom.
================================================ */
function _actualizarBotonesZoom() {
    if (_desktopState.btnZoomIn) {
        _desktopState.btnZoomIn.disabled = _desktopState.zoomActual >= _desktopState.zoomMax;
    }

    if (_desktopState.btnZoomOut) {
        _desktopState.btnZoomOut.disabled = _desktopState.zoomActual <= _desktopState.zoomMin;
    }
}


/* ================================================
   SISTEMA DE ARRASTRE DEL MAPA (DRAG)
   Permite arrastrar el mapa con el mouse.
   El zoom permanece estático durante el arrastre.
================================================ */
function _inicializarArrastre() {
    if (!_desktopState.areaMapa) return;

    // Evento de inicio de arrastre
    _desktopState.areaMapa.addEventListener("mousedown", (e) => {
        // Solo arrastrar con clic izquierdo y fuera de botones
        if (e.button !== 0) return;
        if (e.target.closest(".btn-zoom") || e.target.closest(".controles-zoom")) return;

        // Verificar que no esté en modo construcción o demolición
        const estado = Tablero?.Estado;
        if (estado && estado.modo !== "normal") return;

        _desktopState.arrastrando = true;
        _desktopState.inicioX = e.clientX;
        _desktopState.inicioY = e.clientY;
        _desktopState.scrollInicioX = _desktopState.areaMapa.scrollLeft;
        _desktopState.scrollInicioY = _desktopState.areaMapa.scrollTop;

        _desktopState.areaMapa.style.cursor = "grabbing";
        e.preventDefault();
    });

    // Evento de movimiento durante arrastre
    document.addEventListener("mousemove", (e) => {
        if (!_desktopState.arrastrando) return;

        const deltaX = _desktopState.inicioX - e.clientX;
        const deltaY = _desktopState.inicioY - e.clientY;

        _desktopState.areaMapa.scrollLeft = _desktopState.scrollInicioX + deltaX;
        _desktopState.areaMapa.scrollTop = _desktopState.scrollInicioY + deltaY;
    });

    // Evento de fin de arrastre
    document.addEventListener("mouseup", () => {
        if (_desktopState.arrastrando) {
            _desktopState.arrastrando = false;
            _desktopState.areaMapa.style.cursor = "grab";
        }
    });

    // Prevenir selección de texto durante el arrastre
    _desktopState.areaMapa.addEventListener("dragstart", (e) => {
        e.preventDefault();
    });
}


/* ================================================
   ATAJO DE TECLADO
   Implementa los atajos especificados en HU-024:
   - B: Abrir menú de construcción
   - R: Modo construcción de vías
   - D: Modo demolición
   - ESC: Cancelar modo actual
   - Space: Pausar/Reanudar
   - S: Guardar partida
================================================ */
function _inicializarAtajos() {
    document.addEventListener("keydown", (e) => {
        // Ignorar si el usuario está escribiendo en un input
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        const estado = Tablero?.Estado;
        if (!estado) return;

        switch (e.key.toLowerCase()) {
            case "b":
                // Abrir menú de construcción
                e.preventDefault();
                _abrirMenuConstruccion();
                break;

            case "r":
                // Modo construcción de vías
                e.preventDefault();
                _activarModoVia();
                break;

            case "d":
                // Modo demolición
                e.preventDefault();
                _activarModoDemolicion();
                break;

            case "escape":
                // Cancelar modo actual
                e.preventDefault();
                _cancelarModo();
                break;

            case " ":
                // Pausar/Reanudar
                e.preventDefault();
                Tablero.togglePausa();
                break;

            case "s":
                // Guardar partida (solo con Ctrl)
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    Tablero.guardarPartida();
                }
                break;

            // Atajos de zoom con +/- y números
            case "+":
            case "=":
                e.preventDefault();
                _acercar();
                break;

            case "-":
            case "_":
                e.preventDefault();
                _alejar();
                break;

            case "0":
                // Reset zoom a 1
                e.preventDefault();
                _aplicarZoom(1);
                break;

            case "1":
            case "2":
            case "3":
            case "4":
                // Niveles de zoom: 1=50%, 2=100%, 3=150%, 4=200%
                e.preventDefault();
                const niveles = [0.5, 1, 1.5, 2];
                _aplicarZoom(niveles[parseInt(e.key) - 1]);
                break;
        }
    });
}


/* ================================================
   FUNCIONES DE ATAJOS
================================================ */
function _abrirMenuConstruccion() {
    // Enfocar el panel de construcción
    const panelConstruccion = document.getElementById("menu-construccion");
    if (panelConstruccion) {
        panelConstruccion.scrollIntoView({ behavior: "smooth" });

        // Animar highlight
        panelConstruccion.style.boxShadow = "0 0 20px rgba(26, 115, 232, 0.5)";
        setTimeout(() => {
            panelConstruccion.style.boxShadow = "";
        }, 1500);
    }

    // Mostrar notificación
    Notificaciones.mostrar("Menú de construcción abierto. Selecciona un edificio.", "aviso");
}


function _activarModoVia() {
    // Verificar que el edificio "vía" existe
    const via = Edificios?.obtener("via");
    if (!via) {
        Notificaciones.mostrar("No se encontró el tipo de vía.", "error");
        return;
    }

    // Activar modo construcción con vía seleccionada
    Tablero.seleccionarEdificio("via");
    _actualizarIndicadorModo("construccion", "Modo: Construir Vía (ESC para cancelar)");
    Notificaciones.mostrar("Modo construcción de vías activado.", "exito");
}


function _activarModoDemolicion() {
    Tablero.activarModo("demolicion");
    _actualizarIndicadorModo("demolicion", "Modo: Demolición (ESC para cancelar)");
    Notificaciones.mostrar("Modo demolición activado. Haz clic en un edificio para demoler.", "aviso");
}


function _cancelarModo() {
    Tablero.cancelarModo();
    _ocultarIndicadorModo();
    Notificaciones.mostrar("Modo cancelado.", "aviso");
}


/* ================================================
   INDICADOR VISUAL DE MODO ACTIVO
   Muestra un banner cuando está activo un modo
   especial (construcción o demolición).
================================================ */
function _crearIndicadorModo() {
    // Verificar si ya existe
    const existente = document.getElementById("indicador-modo");
    if (existente) {
        _desktopState.indicadorModo = existente;
        return;
    }

    // Crear elemento
    _desktopState.indicadorModo = document.createElement("div");
    _desktopState.indicadorModo.id = "indicador-modo";
    _desktopState.indicadorModo.className = "indicador-modo";
    _desktopState.indicadorModo.style.display = "none";

    // Insertar en el DOM
    document.body.appendChild(_desktopState.indicadorModo);
}


function _actualizarIndicadorModo(tipo, mensaje) {
    if (!_desktopState.indicadorModo) return;

    _desktopState.indicadorModo.textContent = mensaje;
    _desktopState.indicadorModo.className = `indicador-modo${tipo === "demolicion" ? " indicador-modo--demolicion" : ""}`;
    _desktopState.indicadorModo.style.display = "block";
}


function _ocultarIndicadorModo() {
    if (!_desktopState.indicadorModo) return;
    _desktopState.indicadorModo.style.display = "none";
}


/* ================================================
   TOOLTIPS DINÁMICOS EN EDIFICIOS
   Añade el atributo data-nombre a las celdas
   con edificios para mostrar tooltips.
================================================ */
function _inicializarTooltipsEdificios() {
    // Observar cambios en el grid para añadir tooltips a nuevos edificios
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains("celda--construida")) {
                    _añadirTooltipEdificio(node);
                }
            });
        });
    });

    if (_desktopState.gridMapa) {
        observer.observe(_desktopState.gridMapa, {
            childList: true,
            subtree: true
        });
    }

    // Añadir tooltips a edificios existentes
    setTimeout(() => {
        const celdasConstruidas = document.querySelectorAll(".celda--construida");
        celdasConstruidas.forEach(celda => _añadirTooltipEdificio(celda));
    }, 500);
}


function _añadirTooltipEdificio(celda) {
    // Obtener el tipo de edificio del estado del mapa
    const fila = parseInt(celda.dataset.fila);
    const col = parseInt(celda.dataset.col);

    // Intentar obtener el nombre del edificio
    const img = celda.querySelector(".celda__edificio");
    if (img && img.alt) {
        celda.setAttribute("data-nombre", img.alt);
    }
}


/* ================================================
   EXPOSICIÓN GLOBAL PARA INTEGRACIÓN
================================================ */
window.ControlesDesktop = {
    // Control de zoom
    acercar: _acercar,
    alejar: _alejar,
    setZoom: _aplicarZoom,
    getZoom: () => _desktopState.zoomActual,

    // Indicador de modo
    mostrarIndicadorModo: _actualizarIndicadorModo,
    ocultarIndicadorModo: _ocultarIndicadorModo
};