/*
VISTA DE SERGIO
HU-023: Diseño Responsive - Vista Tablet
Como jugador en tablet
Quiero una interfaz optimizada para pantalla mediana
Para aprovechar el espacio disponible
Criterios de Aceptación:
• [ ] En resoluciones 768px - 1024px:
o Layout en dos columnas: mapa (70%) + sidebar (30%)
o El mapa muestra grid completo sin scroll horizontal
o Panel de recursos en sidebar superior
o Menú de construcción en sidebar central
o Estadísticas en sidebar inferior
o Widget de clima y noticias en tabs laterales
• [ ] Soporte para orientación vertical y horizontal
• [ ] En horizontal: layout optimizado con sidebars izquierdo y derecho
• [ ] En vertical: similar a móvil pero con más espacio
• [ ] Tooltips más grandes al hacer hover
• [ ] Modales ocupan 60% de la pantalla
• [ ] Botones de tamaño medium (adecuados para touch)
Prioridad: Media
Dependencias: HU-023

*/
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
const _BASE = "../../negocio/tableroTablet/";

const _MODULOS = [
    "celdasTablet.js",   /* primero: ajusta celda antes de que el mapa se pinte */
    "sidebarTablet.js"
];

/* Carga los scripts en orden y llama al callback cuando el último termina */
function _cargarModulos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }
    /*El caso base es que cuando el array de modulos está vacío, se avisa que ya cargaron todos los scripts y se sale con return*/
    const [primero, ...resto] = modulos;
    /*Primero toma el primer módulo del array, resto es el resto de los módulos */
    const script = document.createElement("script");
    script.src = _BASE + primero;
    script.onload  = () => _cargarModulos(resto, onCompleto);
    /*Cuando el script carga, hace la siguiente llamada recursiva*/
    script.onerror = () => console.error("controlesTablet: error al cargar", script.src);
    document.head.appendChild(script);/*agrega el script al head del html*/
}

function _inicializarControlesMovil() {
    console.log("controlesMovil: inicialización (readyState=", document.readyState, ")");
    try {
        CeldaAdaptable.inicializar();
        TabsMovil.inicializar();
        RecursosMovil.inicializar();
        StatsMovil.inicializar();
        JoystickMovil.inicializar();
        MenuConstruccionMovil.inicializar();
        ZoomMovil.inicializar();
        ClimaMovil.inicializar();
        NoticiasMovil.inicializar();

        console.log("controlesMovil: inicialización completa");
    } catch (err) {
        console.error("controlesMovil: error durante inicialización", err);
    }
}

_cargarModulos(_MODULOS, _inicializarControlesMovil);

const sidebar = document.getElementById("sidebar-tablet");
const boton = document.getElementById("btn-sidebar-tablet");
const mapa = document.getElementById("area-mapa")
