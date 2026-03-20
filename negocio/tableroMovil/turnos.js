/* ================================================
TURNOS MÓVIL
Menú compacto para ajustar duración y pausar/reanudar turnos.
================================================ */

const TurnosMovil = (function() {
    function inicializar() {
        const btnMenu = document.getElementById("btn-turnos-movil");
        const menu = document.getElementById("menu-turnos-movil");
        const inputDuracion = document.getElementById("input-turnos-movil-duracion");
        const btnAplicar = document.getElementById("btn-turnos-movil-aplicar");
        const btnPausar = document.getElementById("btn-turnos-movil-pausar");
        const btnReanudar = document.getElementById("btn-turnos-movil-reanudar");

        if (!btnMenu || !menu) return;

        if (inputDuracion && window.Tablero?.Estado?.ciudad) {
            inputDuracion.value = Math.round(window.Tablero.Estado.ciudad.tiempoTurno / 1000);
        }

        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            const abierto = menu.classList.toggle("abierto");
            menu.setAttribute("aria-hidden", String(!abierto));
        });

        btnAplicar?.addEventListener("click", () => {
            const segundos = Number(inputDuracion?.value);
            if (!Number.isFinite(segundos) || segundos <= 0) {
                Notificaciones.mostrar("Ingresa un valor válido (mayor a 0).", "error");
                return;
            }

            window.Tablero?.setDuracionTurno?.(segundos);
            Notificaciones.mostrar(`Duración de turno ajustada a ${segundos} seg.`, "exito");
            _cerrarMenu(menu);
        });

        btnPausar?.addEventListener("click", () => {
            if (!window.Tablero?.Estado?.pausado) {
                window.Tablero?.togglePausa?.();
            }
            _cerrarMenu(menu);
        });

        btnReanudar?.addEventListener("click", () => {
            if (window.Tablero?.Estado?.pausado) {
                window.Tablero?.togglePausa?.();
            }
            _cerrarMenu(menu);
        });

        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && !btnMenu.contains(e.target)) {
                _cerrarMenu(menu);
            }
        });
    }

    function _cerrarMenu(menu) {
        menu.classList.remove("abierto");
        menu.setAttribute("aria-hidden", "true");
    }

    return { inicializar };
})();

window.TurnosMovil = TurnosMovil;
