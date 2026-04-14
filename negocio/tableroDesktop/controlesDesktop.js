/* ================================================
CONTROLES DESKTOP
Orquestador de la vista Desktop (HU-024)

Responsabilidades:
  - Cargar los submodulos de controles desktop
  - Exponer la API publica esperada por tablero.js
  - Mantener el estado compartido del controlador
================================================ */

(function () {
    const _desktopState = {
        zoomActual: 1,
        zoomMin: 0.5,
        zoomMax: 2,
        zoomPaso: 0.25,
        zoomNiveles: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],

        areaMapa: null,
        gridMapa: null,
        btnZoomIn: null,
        btnZoomOut: null,
        controlesZoom: null,
        zoomIndicador: null,
        indicadorModo: null,
        btnRuta: null
    };

    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};
    window.ControlesDesktopState = _desktopState;

    const _basePath = "../../negocio/tableroDesktop/controlesDesktop/";
    const _modulos = [
        "zoom.js",
        "ui.js",
        "modes.js",
        "modules.js",
        "shortcuts.js"
    ];

    let _cargaModulosPromise = null;
    let _initPromise = null;
    let _inicializado = false;

    function _cargarScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
            document.head.appendChild(script);
        });
    }

    function _asegurarModulos() {
        if (!_cargaModulosPromise) {
            _cargaModulosPromise = _modulos
                .map((modulo) => `${_basePath}${modulo}?v=${Date.now()}`)
                .reduce((cadena, src) => cadena.then(() => _cargarScript(src)), Promise.resolve());
        }

        return _cargaModulosPromise;
    }

    function _inicializarReferencias() {
        _desktopState.areaMapa = document.getElementById("area-mapa");
        _desktopState.gridMapa = document.getElementById("mapa-grid");
        _desktopState.btnZoomIn = document.getElementById("btn-zoom-in");
        _desktopState.btnZoomOut = document.getElementById("btn-zoom-out");
        _desktopState.controlesZoom = document.getElementById("controles-zoom");
        _desktopState.btnRuta = document.getElementById("btn-ruta");

        if (!_desktopState.areaMapa || !_desktopState.gridMapa) {
            console.error("controlesDesktop.js: No se encontraron elementos del mapa.");
            return false;
        }

        return true;
    }

    async function _init() {
        if (_initPromise) return _initPromise;

        _initPromise = (async () => {
            await _asegurarModulos();

            if (_inicializado) return;
            if (!_inicializarReferencias()) return;

            _namespace.zoom.inicializarZoom();
            _namespace.shortcuts.inicializarAtajos();
            _namespace.ui.crearIndicadorModo();
            _namespace.shortcuts.inicializarBotonRuta();

            _namespace.modules.cargarModuloClima();
            _namespace.modules.cargarModuloNoticias();
            _namespace.modules.cargarModuloMenuConstruccion();
            _namespace.modules.cargarModuloEstadisticas();
            _namespace.modules.cargarModuloRecursos();

            _inicializado = true;
        })().catch((error) => {
            console.error("controlesDesktop.js: error inicializando controles desktop", error);
            throw error;
        });

        return _initPromise;
    }

    if (window.__tableroListo) {
        _init();
    }

    window.ControlesDesktop = {
        init: _init,

        acercar: () => _namespace.zoom?.acercar?.(),
        alejar: () => _namespace.zoom?.alejar?.(),
        setZoom: (zoom) => _namespace.zoom?.aplicarZoom?.(zoom),
        getZoom: () => _desktopState.zoomActual,

        mostrarIndicadorModo: (tipo, mensaje) => _namespace.ui?.actualizarIndicadorModo?.(tipo, mensaje),
        ocultarIndicadorModo: () => _namespace.ui?.ocultarIndicadorModo?.()
    };
})();