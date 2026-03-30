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
    const btnEliminarPartida = document.getElementById("btn-eliminar-partida");
    const btnExport = document.getElementById("btn-exportar-json");
    const btnRanking = document.getElementById("btn-ver-ranking");
    const inputDuracionTurno = document.getElementById("input-duracion-turno");
    const btnAplicarDuracionTurno = document.getElementById("btn-aplicar-duracion-turno");

    if (!btnMenu || !menu) return;

    /* Abrir / cerrar dropdown */
    btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        const abierto = menu.classList.toggle("abierto");
        menu.setAttribute("aria-hidden", !abierto);
    });

    /* Ver noticias */
    document.getElementById("btn-ver-noticias")?.addEventListener("click", () => {
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
        window.NoticiasMovil?._mostrarListaNoticias?.() ||
        window.NoticiasMovil?.mostrarLista?.();
    });

    /* Guardar en localStorage */
    btnLocal?.addEventListener("click", () => {
        Tablero.guardarPartida();
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    });

    /* Eliminar partida guardada */
    btnEliminarPartida?.addEventListener("click", () => {
        const confirmar = window.confirm("¿Deseas eliminar la partida guardada?");
        if (!confirmar) return;

        if (CiudadStorage?.limpiar) {
            CiudadStorage.limpiar();
        }

        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
        window.location.href = "index.html";
    });

    /* Exportar como JSON */
    btnExport?.addEventListener("click", () => {
        Tablero.exportarJSON();
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    });

    /* Ver Ranking */
    btnRanking?.addEventListener("click", () => {
        Ranking.mostrar();
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    });

    /* Inicializar valor de duración de turno */
    if (inputDuracionTurno && window.Tablero?.Estado?.ciudad) {
        inputDuracionTurno.value = Math.round(window.Tablero.Estado.ciudad.tiempoTurno / 1000);
    }

    /* Aplicar duración de turnos */
    btnAplicarDuracionTurno?.addEventListener("click", () => {
        const segundos = Number(inputDuracionTurno?.value);
        if (!Number.isFinite(segundos) || segundos <= 0) {
            Notificaciones.mostrar("Ingresa un valor válido (mayor a 0).", "error");
            return;
        }

        if (window.Tablero?.setDuracionTurno) {
            window.Tablero.setDuracionTurno(segundos);
            Notificaciones.mostrar(`Duración de turno ajustada a ${segundos} seg.`, "exito");
        }

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