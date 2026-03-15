/* ================================================
STATS MÓVIL
Botón flotante que abre el modal de estadísticas.

Responsabilidad:
  - Registrar el click del botón flotante
  - Delegar la apertura del modal a Modal.mostrarEstadisticas()

Dependencias: modal.js
================================================ */

function inicializar() {
    const btn = document.getElementById("btn-stats-flotante");
    if (!btn) return;

    btn.addEventListener("click", () => {
        window.Modal?.mostrarEstadisticas();
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.StatsMovil = { inicializar };