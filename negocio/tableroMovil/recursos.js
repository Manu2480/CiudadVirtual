/* ================================================
RECURSOS MÓVIL
Panel de recursos colapsable en el header.

Responsabilidad:
  - Desplegar/colapsar el panel de recursos
    al pulsar el botón del header
  - Cerrar el panel al tocar fuera de él

Dependencias: (ninguna)
================================================ */

function inicializar() {
    const btn   = document.getElementById("btn-recursos-movil");
    const panel = document.getElementById("panel-recursos");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
        panel.classList.toggle("abierto");
        btn.setAttribute("aria-expanded", panel.classList.contains("abierto"));
    });

    /* Cierra el panel al tocar fuera */
    document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !panel.contains(e.target)) {
            panel.classList.remove("abierto");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.RecursosMovil = { inicializar };