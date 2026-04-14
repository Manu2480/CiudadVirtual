
/* ================================================
CONTROLES TABLET — COORDINADOR
Punto de entrada de la vista tablet (768px - 1024px).
Cargado dinámicamente por vista.js.

Responsabilidades:
  - Cargar los submódulos de tableroTablet/ en orden
  - Inicializarlos una vez que todos estén listos

Submódulos (se cargan en este mismo archivo):
  celdasTablet.js, sidebarTablet.js, recursos.js, clima.js, noticias.js
================================================ */

/* Ruta base relativa al HTML (presentacion/vistas/) */
const _BASE = "../../negocio/tableroTablet/";

const _MODULOS = [
    "celdasTablet.js",
    "sidebarTablet.js",
];

/* Módulo unificado de construcción compartido con móvil */
const _MODULOS_GENERAL = [
    "../../negocio/tableroGeneral/menuConstruccion.js",
    "../../negocio/tableroGeneral/panelRecursos.js",
    "../../negocio/tableroGeneral/estadisticas.js",
    "../../negocio/tableroGeneral/panelClima.js",
    "../../negocio/tableroGeneral/panelNoticias.js",
];

/* Carga scripts con ruta relativa a _BASE */
function _cargarModulos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }
    const [primero, ...resto] = modulos;
    const script = document.createElement("script");
    script.src = _BASE + primero;
    script.onload  = () => _cargarModulos(resto, onCompleto);
    script.onerror = () => console.error("controlesTablet: error al cargar", script.src);
    document.head.appendChild(script);
}

/* Carga scripts con ruta absoluta (módulos compartidos) */
function _cargarModulosAbsolutos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }
    const [primero, ...resto] = modulos;
    const script = document.createElement("script");
    script.src = primero;
    script.onload  = () => _cargarModulosAbsolutos(resto, onCompleto);
    script.onerror = () => console.error("controlesTablet: error al cargar", script.src);
    document.head.appendChild(script);
}

function _inicializarControlesTablet() {
    try {
        CeldasTablet.inicializar();
        panelClima.inicializar();
        PanelNoticias.inicializar();
        SidebarTablet.inicializar();
        PanelRecursos.inicializar();
        Estadisticas.inicializar();
        MenuConstruccion.inicializar();
        _inicializarBotonRuta();
    } catch (err) {
        console.error("controlesTablet: error durante inicialización", err);
    }
}

function _inicializarBotonRuta() {
    botonRuta = document.getElementById("btn-ruta");
    if (!botonRuta) return;

    botonRuta.addEventListener("click", () => {
        if (!window.RutaMovil) {
            Notificaciones.mostrar("No se pudo iniciar la búsqueda de ruta.", "error");
            return;
        }

        if (window.RutaMovil.estaActivo && window.RutaMovil.estaActivo()) {
            window.RutaMovil.limpiarTodo();
        }
        window.RutaMovil.activar();
        Notificaciones.mostrar("Selecciona dos edificios para calcular la ruta.", "aviso");
    });

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        _cargarModulos(_MODULOS, function () {
            _cargarModulosAbsolutos(_MODULOS_GENERAL, _inicializarControlesTablet);
        });
    });
} else {
    _cargarModulos(_MODULOS, function () {
        _cargarModulosAbsolutos(_MODULOS_GENERAL, _inicializarControlesTablet);
    });
}