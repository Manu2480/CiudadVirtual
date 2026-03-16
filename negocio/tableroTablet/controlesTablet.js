/*
VISTA DE SERGIO
HU-023: Diseño Responsive - Vista Tablet
Como jugador en tablet
Quiero una interfaz optimizada para pantalla mediana
Para aprovechar el espacio disponible
Criterios de Aceptación:
• [x] En resoluciones 768px - 1024px:
o Layout en dos columnas: mapa (70%) + sidebar (30%)
o El mapa muestra grid completo sin scroll horizontal
o Panel de recursos en sidebar superior
o Menú de construcción en sidebar central
o Estadísticas en sidebar inferior
o Widget de clima y noticias en tabs laterales
• [x] Soporte para orientación vertical y horizontal
• [x] En horizontal: layout optimizado con sidebars izquierdo y derecho
• [x] En vertical: similar a móvil pero con más espacio
• [x] Tooltips más grandes al hacer hover
• [x] Modales ocupan 60% de la pantalla
• [x] Botones de tamaño medium (adecuados para touch)
Prioridad: Media
Dependencias: HU-023

*/
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

console.log("controlesTablet: cargado (readyState=", document.readyState, ")");

/* Ruta base relativa al HTML (presentacion/vistas/) */
const _BASE = "../../negocio/tableroTablet/";

const _MODULOS = [
    "celdasTablet.js",   /* primero: ajusta celda antes de que el mapa se pinte */
    "clima.js",
    "noticias.js",
    "sidebarTablet.js",
    "recursos.js"
];

/* Carga los scripts en orden y llama al callback cuando el último termina */
function _cargarModulos(modulos, onCompleto) {
    if (modulos.length === 0) { onCompleto(); return; }
    /*El caso base es que cuando el array de modulos está vacío, se avisa que ya cargaron todos los scripts y se sale con return*/
    const [primero, ...resto] = modulos;
    /*Primero toma el primer módulo del array, resto es el resto de los módulos */
    const script = document.createElement("script");
    script.src = _BASE + primero;
    script.onload = () => _cargarModulos(resto, onCompleto);
    /*Cuando el script carga, hace la siguiente llamada recursiva*/
    script.onerror = () => console.error("controlesTablet: error al cargar", script.src);
    document.head.appendChild(script);/*agrega el script al head del html*/
}

function _inicializarControlesTablet() {
    console.log("controlesTablet: inicialización (readyState=", document.readyState, ")");
    try {
        CeldasTablet.inicializar();
        ClimaTablet.inicializar();
        NoticiasTablet.inicializar();
        SidebarTablet.inicializar();
        RecursosTablet.inicializar();


        console.log("controlesTablet: inicialización completa");
    } catch (err) {
        console.error("controlesTablet: error durante inicialización", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    _cargarModulos(_MODULOS, _inicializarControlesTablet);
});