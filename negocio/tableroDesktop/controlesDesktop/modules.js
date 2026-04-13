(function () {
    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};

    function _cargarModulo(src, onload) {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            if (typeof onload === "function") onload();
        };
        document.head.appendChild(script);
    }

    function _cargarModuloClima() {
        _cargarModulo("../../negocio/tableroGeneral/panelClima.js", () => {
            if (window.panelClima) {
                window.panelClima.inicializar();
            }
        });
    }

    function _cargarModuloNoticias() {
        _cargarModulo("../../negocio/tableroGeneral/panelNoticias.js", () => {
            if (window.PanelNoticias) {
                window.PanelNoticias.inicializar();
            }
        });
    }

    function _cargarModuloMenuConstruccion() {
        _cargarModulo("../../negocio/tableroGeneral/menuConstruccion.js", () => {
            if (window.MenuConstruccion) {
                window.MenuConstruccion.inicializar();
            }
        });
    }

    function _cargarModuloEstadisticas() {
        _cargarModulo("../../negocio/tableroGeneral/estadisticas.js", () => {
            if (window.Estadisticas) {
                window.Estadisticas.inicializar();
            }
        });
    }

    function _cargarModuloRecursos() {
        _cargarModulo("../../negocio/tableroGeneral/panelRecursos.js", () => {
            if (window.PanelRecursos) {
                window.PanelRecursos.inicializar();
            }
        });
    }

    _namespace.modules = {
        cargarModuloClima: _cargarModuloClima,
        cargarModuloNoticias: _cargarModuloNoticias,
        cargarModuloMenuConstruccion: _cargarModuloMenuConstruccion,
        cargarModuloEstadisticas: _cargarModuloEstadisticas,
        cargarModuloRecursos: _cargarModuloRecursos
    };
})();