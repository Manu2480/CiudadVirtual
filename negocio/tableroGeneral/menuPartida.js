/* ================================================
MENU PARTIDA
Dropdown del encabezado con opciones de guardado.

Responsabilidades:
  - Abrir/cerrar el dropdown al pulsar el botón
  - Guardar partida en localStorage
  - Exportar partida como JSON descargable
  - Cerrar al tocar fuera

Dependencias: tablero.js (guardarPartida, exportarJSON)
================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const btnMenu   = document.getElementById("btn-menu-partida");
    const menu      = document.getElementById("menu-partida");
    const btnLocal  = document.getElementById("btn-guardar-local");
    const btnExport = document.getElementById("btn-exportar-json");

    if (!btnMenu || !menu) return;

    /* Abrir / cerrar dropdown */
    btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        const abierto = menu.classList.toggle("abierto");
        menu.setAttribute("aria-hidden", !abierto);
    });

    /* Guardar en localStorage */
    btnLocal?.addEventListener("click", () => {
        Tablero.guardarPartida();
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    });

    /* Exportar como JSON */
    btnExport?.addEventListener("click", () => {
        Tablero.exportarJSON();
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    });

    /* Cerrar al tocar fuera */
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btnMenu.contains(e.target)) {
            menu.classList.remove("abierto");
            menu.setAttribute("aria-hidden", "true");
        }
    });
});


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.MenuPartida = {};