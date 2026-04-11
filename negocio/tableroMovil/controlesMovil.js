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
    "zoom.js",        
    "joystick.js",
    "turnos.js",
    "noticias.js",
];

/* Módulos de tableroGeneral también usados en móviL*/
const _MODULOS_GENERAL = [
    "../../negocio/tableroGeneral/ruta.js",
    "../../negocio/tableroGeneral/menuConstruccion.js",
    "../../negocio/tableroGeneral/estadisticas.js",
    "../../negocio/tableroGeneral/panelClima.js",
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

/* Carga scripts con ruta absoluta (módulos compartidos de tableroGeneral) */
function _cargarModulosAbsolutos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }

    const [primero, ...resto] = modulos;
    const script = document.createElement("script");
    script.src = primero;
    script.onload  = () => _cargarModulosAbsolutos(resto, onCompleto);
    script.onerror = () => console.error("controlesMovil: error al cargar", script.src);
    document.head.appendChild(script);
}

function _inicializarControlesMovil() {
    console.log("controlesMovil: inicialización (readyState=", document.readyState, ")");
    try {
        // Log de verificación de objetos cargados
        console.log("TabsMovil disponible?", !!window.TabsMovil);
        console.log("RecursosMovil disponible?", !!window.RecursosMovil);
        console.log("StatsMovil disponible?", !!window.StatsMovil);
        console.log("ZoomMovil disponible?", !!window.ZoomMovil);
        console.log("JoystickMovil disponible?", !!window.JoystickMovil);
        console.log("MenuConstruccionMovil disponible?", !!window.MenuConstruccionMovil);
        console.log("TurnosMovil disponible?", !!window.TurnosMovil);
        console.log("ClimaMovil disponible?", !!window.panelClima);
        console.log("NoticiasMovil disponible?", !!window.NoticiasMovil);
        
        if (window.TabsMovil) {
            window.TabsMovil.inicializar();
            console.log("TabsMovil inicializado");
        } else {
            console.error("TabsMovil NO CARGADO");
        }
        
        if (window.RecursosMovil) window.RecursosMovil.inicializar();
        if (window.StatsMovil) window.StatsMovil.inicializar();
        if (window.ZoomMovil) window.ZoomMovil.inicializar();
        if (window.JoystickMovil) window.JoystickMovil.inicializar();
        if (window.MenuConstruccionMovil) window.MenuConstruccionMovil.inicializar();
        if (window.TurnosMovil) window.TurnosMovil.inicializar();
        if (window.panelClima) window.panelClima.inicializar();
        if (window.NoticiasMovil) window.NoticiasMovil.inicializar();

        console.log("controlesMovil: inicialización completa");
    } catch (err) {
        console.error("controlesMovil: error durante inicialización", err);
        console.error("Stack:", err.stack);
    }
}

_cargarModulos(_MODULOS, function() {
    if (_MODULOS_GENERAL.length > 0) {
        _cargarModulosAbsolutos(_MODULOS_GENERAL, _inicializarControlesMovil);
    } else {
        _inicializarControlesMovil();
    }
});