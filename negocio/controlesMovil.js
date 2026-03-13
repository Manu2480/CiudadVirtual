/* 
VISTA DE MANUELA
HU-022: Diseño Responsive - Vista Móvil
Como jugador en dispositivo móvil
Quiero que la interfaz se adapte a mi pantalla
Para poder jugar cómodamente desde mi teléfono
Criterios de Aceptación:
• [ ] En resoluciones < 768px:
o El mapa ocupa el 100% del ancho de la pantalla
o Los paneles se organizan verticalmente
o El menú de construcción se muestra como tabs en la parte inferior
o El panel de recursos se muestra como header colapsable
o Las estadísticas se acceden mediante botón flotante
• [ ] Controles táctiles optimizados:
o Botones de al menos 44x44px (target táctil mínimo)
o Tap en edificio para seleccionar
o Tap en celda vacía para construir
o Swipe horizontal para scroll del menú de edificios
[ ] El mapa es scrollable vertical y horizontalmente
• [ ] Zoom mediante pinch (dos dedos)
• [ ] El modal de información de edificio ocupa 80% de la pantalla
• [ ] Las notificaciones se muestran en la parte superior
• [ ] El widget de clima es compacto (icono + temperatura)
• [ ] Las noticias se muestran en carrusel horizontal
Prioridad: Alta
Dependencias: Todas las HUs de funcionalidad

*/

/* controlesMovil.js — PRUEBA
Solo se carga cuando data-vista="movil".
Verifica que vista.js inyectó este script correctamente.
*/

console.log("controlesMovil.js: cargado correctamente ");

document.addEventListener("DOMContentLoaded", () => {

    /* Verifica que los elementos clave del móvil existen */
    const tabs        = document.getElementById("tabs-movil");
    const btnStats    = document.getElementById("btn-stats-flotante");
    const btnRecursos = document.getElementById("btn-recursos-movil");
    const panelRec    = document.getElementById("panel-recursos");

    console.log("tabs-movil encontrado:",        !!tabs);
    console.log("btn-stats-flotante encontrado:", !!btnStats);
    console.log("btn-recursos-movil encontrado:", !!btnRecursos);

    /* Tabs: muestra el panel correspondiente al hacer click */
    if (tabs) {
        tabs.addEventListener("click", (e) => {
            const btn = e.target.closest(".tab");
            if (!btn) return;

            /* Marca la tab activa */
            tabs.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");

            const idPanel = btn.dataset.panel;
            console.log(`Tab clickeada: ${idPanel}`);

            /* TODO (producción): mostrar/ocultar panel correspondiente */
        });
    }

    /* Botón de recursos: toggle del panel en el header */
    if (btnRecursos && panelRec) {
        btnRecursos.addEventListener("click", () => {
            const visible = panelRec.style.display === "flex";
            panelRec.style.display = visible ? "none" : "flex";
            console.log(`Panel recursos: ${visible ? "ocultado" : "mostrado"}`);
        });
    }

    /* Botón flotante de estadísticas */
    if (btnStats) {
        btnStats.addEventListener("click", () => {
            console.log("Btn estadísticas clickeado");
            if (window.Modal) Modal.mostrarEstadisticas();
        });
    }

    /* Zoom con botones */
    document.getElementById("btn-zoom-in") ?.addEventListener("click", () => Mapa.acercar());
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => Mapa.alejar());

});