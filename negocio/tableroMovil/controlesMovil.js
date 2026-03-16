/* ================================================
CONTROLES MOVIL — COORDINADOR
Punto de entrada de la vista móvil (< 768px).
Cargado dinámicamente por vista.js.

Responsabilidades:
  - Cargar los submódulos de tableroMovil/ en orden
  - Inicializarlos una vez que todos estén listos

Submódulos (se cargan en este mismo archivo):
  tabs.js, recursos.js, stats.js, joystick.js,
  menuConstruccion.js, zoom.js, clima.js, noticias.js
================================================ */

console.log("controlesMovil: cargado (readyState=", document.readyState, ")");

/* Ruta base relativa al HTML (presentacion/vistas/) */
const _BASE = "../../negocio/tableroMovil/";

const _MODULOS = [
    "tabs.js",
    "recursos.js",
    "stats.js",
    "zoom.js",        /* zoom antes que joystick para que sus listeners tengan prioridad en pinch */
    "joystick.js",
    "menuConstruccion.js",
    "clima.js",
    "noticias.js",
];

/* Carga los scripts en orden y llama al callback cuando el último termina */
function _cargarModulos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }

    const [primero, ...resto] = modulos;
    const script = document.createElement("script");
    script.src = _BASE + primero;
    script.onload  = () => _cargarModulos(resto, onCompleto);
    script.onerror = () => console.error("controlesMovil: error al cargar", script.src);
    document.head.appendChild(script);
}

function _inicializarControlesMovil() {
    console.log("controlesMovil: inicialización (readyState=", document.readyState, ")");
    try {
        TabsMovil.inicializar();
        RecursosMovil.inicializar();
        StatsMovil.inicializar();
        ZoomMovil.inicializar();
        JoystickMovil.inicializar();
        MenuConstruccionMovil.inicializar();
        ClimaMovil.inicializar();
        NoticiasMovil.inicializar();

        console.log("controlesMovil: inicialización completa");
    } catch (err) {
        console.error("controlesMovil: error durante inicialización", err);
    }
}

_cargarModulos(_MODULOS, _inicializarControlesMovil);