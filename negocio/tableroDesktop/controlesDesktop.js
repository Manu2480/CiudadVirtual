/* ================================================
MICHAELCONTROLESDESKTOP.JS
Controles específicos para la vista Desktop (HU-024)

Responsabilidades:
  - Controles de zoom estático (+/-)
  - Atajos de teclado (B, R, D, ESC, Space, S)
  - Sistema de arrastre del mapa (drag)
  - Indicador visual de modo activo
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
    indicadorModo: null,
    btnRuta: null
};


/* ================================================
   INICIALIZACIÓN
   vista.js inyecta este script dinámicamente, por lo que
   DOMContentLoaded puede dispararse antes o después de que
   tablero.js haya definido window.Tablero / window.Mapa.

   Solución: se expone _init() para que tablero.js la invoque
   una vez él mismo ha terminado. Si tablero.js ya terminó
   (window.__tableroListo === true), se auto-inicializa al cargar.
================================================ */
function _init() {
    console.log("controlesDesktop.js: Inicializando controles desktop...");

    _inicializarReferencias();
    _inicializarZoom();
    _inicializarArrastre();
    _inicializarAtajos();
    _crearIndicadorModo();
    _inicializarBotonRuta();

    // Cargar módulos adicionales
    _cargarModuloClima();
    _cargarModuloNoticias();
    _cargarModuloMenuConstruccion();
    _cargarModuloEstadisticas();
    _cargarModuloRecursos();

    console.log("controlesDesktop.js: Controles desktop inicializados.");
}

/* Si tablero.js ya terminó su DOMContentLoaded antes de que este
   script se cargara, se inicializa directamente. */
if (window.__tableroListo) {
    _init();
}



/* ================================================
   INICIALIZAR REFERENCIAS AL DOM
================================================ */
function _inicializarReferencias() {
    _desktopState.areaMapa = document.getElementById("area-mapa");
    _desktopState.gridMapa = document.getElementById("mapa-grid");
    _desktopState.btnZoomIn = document.getElementById("btn-zoom-in");
    _desktopState.btnZoomOut = document.getElementById("btn-zoom-out");
    _desktopState.controlesZoom = document.getElementById("controles-zoom");
    _desktopState.btnRuta = document.getElementById("btn-ruta");

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
   SISTEMA DE ARRASTRE DEL MAPA (DRAG/PAN)
   Permite mover el mapa con el mouse mientras
   mantiene el zoom estático (no afectado por drag).
================================================ */
function _inicializarArrastre() {
    if (!_desktopState.areaMapa) return;

    let arrastrando = false;
    let inicioX = 0;
    let inicioY = 0;
    let scrollInicioX = 0;
    let scrollInicioY = 0;

    _desktopState.areaMapa.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;  // Solo botón izquierdo
        if (e.target.closest(".btn-zoom") || e.target.closest(".controles-zoom")) return;

        arrastrando = true;
        inicioX = e.clientX;
        inicioY = e.clientY;
        scrollInicioX = _desktopState.areaMapa.scrollLeft;
        scrollInicioY = _desktopState.areaMapa.scrollTop;
        _desktopState.areaMapa.classList.add("area-mapa--arrastrando");
    });

    document.addEventListener("mousemove", (e) => {
        if (!arrastrando) return;

        const deltaX = e.clientX - inicioX;
        const deltaY = e.clientY - inicioY;

        _desktopState.areaMapa.scrollLeft = scrollInicioX - deltaX;
        _desktopState.areaMapa.scrollTop = scrollInicioY - deltaY;
    });

    document.addEventListener("mouseup", () => {
        if (arrastrando) {
            arrastrando = false;
            _desktopState.areaMapa.classList.remove("area-mapa--arrastrando");
        }
    });
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

    // Aplicar zoom cambiando el tamaño de celda
    const nuevoTamano = 48 * _desktopState.zoomActual;
    document.documentElement.style.setProperty("--tamano-celda", `${nuevoTamano}px`);

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
                e.preventDefault();
                Tablero.exportarJSON();
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
        panelConstruccion.classList.add("menu-construccion--destacado");
        setTimeout(() => {
            panelConstruccion.classList.remove("menu-construccion--destacado");
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
    window.RutaMovil?.limpiarTodo();
    _ocultarIndicadorModo();
    Notificaciones.mostrar("Modo cancelado.", "aviso");
}

function _inicializarBotonRuta() {
    if (!_desktopState.btnRuta) return;

    _desktopState.btnRuta.addEventListener("click", () => {
        if (!window.RutaMovil) {
            Notificaciones.mostrar("No se pudo iniciar la búsqueda de ruta.", "error");
            return;
        }

        if (window.RutaMovil.estaActivo && window.RutaMovil.estaActivo()) {
            window.RutaMovil.limpiarTodo();
        }
        window.RutaMovil.activar();
        _actualizarIndicadorModo("ruta", "Modo ruta: selecciona origen y destino (ESC para cancelar)");
        Notificaciones.mostrar("Selecciona dos edificios para calcular la ruta.", "aviso");
    });

    document.addEventListener("ruta:completada", () => {
        _ocultarIndicadorModo();
    });
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
    _desktopState.indicadorModo.className = "indicador-modo indicador-modo--oculto";

    // Insertar en el DOM
    document.body.appendChild(_desktopState.indicadorModo);
}


function _actualizarIndicadorModo(tipo, mensaje) {
    if (!_desktopState.indicadorModo) return;

    _desktopState.indicadorModo.textContent = mensaje;
    _desktopState.indicadorModo.className = `indicador-modo${tipo === "demolicion" ? " indicador-modo--demolicion" : ""}`;
    _desktopState.indicadorModo.classList.remove("indicador-modo--oculto");
}


function _ocultarIndicadorModo() {
    if (!_desktopState.indicadorModo) return;
    _desktopState.indicadorModo.classList.add("indicador-modo--oculto");
}


function _cargarModuloClima() {
    const script = document.createElement("script");
    script.src = "../../negocio/tableroDesktop/clima.js";
    script.onload = () => {
        if (window.ClimaDesktop) {
            window.ClimaDesktop.inicializar();
        }
    };
    document.head.appendChild(script);
}


function _cargarModuloNoticias() {
    const script = document.createElement("script");
    script.src = "../../negocio/tableroDesktop/noticias.js";
    script.onload = () => {
        if (window.NoticiasDesktop) {
            window.NoticiasDesktop.inicializar();
        }
    };
    document.head.appendChild(script);
}


function _cargarModuloMenuConstruccion() {
    const script = document.createElement("script");
    script.src = "../../negocio/tableroGeneral/menuConstruccion.js"; /* usamos el archivo unificado */
    script.onload = () => {
        if (window.MenuConstruccionDesktop) {
            window.MenuConstruccionDesktop.inicializar();
        }
    };
    document.head.appendChild(script);
}


function _cargarModuloEstadisticas() {
    const script = document.createElement("script");
    script.src = "../../negocio/tableroGeneral/estadisticas.js";
    script.onload = () => {
        if (window.EstadisticasDesktop) {
            window.EstadisticasDesktop.inicializar();
        }
    };
    document.head.appendChild(script);
}


function _cargarModuloRecursos() {
    const script = document.createElement("script");
    script.src = "../../negocio/tableroGeneral/panelRecursos.js";
    script.onload = () => {
        if (window.RecursosDesktop) {
            window.RecursosDesktop.inicializar();
        }
    };
    document.head.appendChild(script);
}


/* ================================================
   EXPOSICIÓN GLOBAL PARA INTEGRACIÓN
================================================ */
window.ControlesDesktop = {
    // Inicialización (llamada desde tablero.js)
    init: _init,

    // Control de zoom
    acercar: _acercar,
    alejar: _alejar,
    setZoom: _aplicarZoom,
    getZoom: () => _desktopState.zoomActual,

    // Indicador de modo
    mostrarIndicadorModo: _actualizarIndicadorModo,
    ocultarIndicadorModo: _ocultarIndicadorModo
};