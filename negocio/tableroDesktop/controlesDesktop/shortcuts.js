(function () {
    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};
    const _state = window.ControlesDesktopState;

    function _abrirMenuConstruccion() {
        const panelConstruccion = document.getElementById("menu-construccion");
        if (panelConstruccion) {
            panelConstruccion.scrollIntoView({ behavior: "smooth" });
            panelConstruccion.classList.add("menu-construccion--destacado");
            setTimeout(() => {
                panelConstruccion.classList.remove("menu-construccion--destacado");
            }, 1500);
        }

        Notificaciones.mostrar("Menú de construcción abierto. Selecciona un edificio.", "aviso");
    }

    function _inicializarBotonRuta() {
        if (!_state.btnRuta) return;

        _state.btnRuta.addEventListener("click", () => {
            if (!window.RutaMovil) {
                Notificaciones.mostrar("No se pudo iniciar la búsqueda de ruta.", "error");
                return;
            }

            if (window.RutaMovil.estaActivo && window.RutaMovil.estaActivo()) {
                window.RutaMovil.limpiarTodo();
            }

            window.RutaMovil.activar();
            _namespace.ui?.actualizarIndicadorModo?.("ruta", "Modo ruta: selecciona origen y destino (ESC para cancelar)");
            Notificaciones.mostrar("Selecciona dos edificios para calcular la ruta.", "aviso");
        });

        document.addEventListener("ruta:completada", () => {
            _namespace.ui?.ocultarIndicadorModo?.();
        });
    }

    function _inicializarAtajos() {
        document.addEventListener("keydown", (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            const estado = Tablero?.Estado;
            if (!estado) return;

            switch (e.key.toLowerCase()) {
                case "b":
                    e.preventDefault();
                    _abrirMenuConstruccion();
                    break;

                case "r":
                    e.preventDefault();
                    _namespace.modos?.activarModoVia?.();
                    break;

                case "d":
                    e.preventDefault();
                    _namespace.modos?.activarModoDemolicion?.();
                    break;

                case "escape":
                    e.preventDefault();
                    _namespace.modos?.cancelarModo?.();
                    break;

                case " ":
                    e.preventDefault();
                    Tablero.togglePausa();
                    break;

                case "s":
                    e.preventDefault();
                    Tablero.exportarJSON();
                    break;

                case "+":
                case "=":
                    e.preventDefault();
                    _namespace.zoom?.acercar?.();
                    break;

                case "-":
                case "_":
                    e.preventDefault();
                    _namespace.zoom?.alejar?.();
                    break;

                case "0":
                    e.preventDefault();
                    _namespace.zoom?.aplicarZoom?.(1);
                    break;

                case "1":
                case "2":
                case "3":
                case "4": {
                    e.preventDefault();
                    const niveles = [0.5, 1, 1.5, 2];
                    _namespace.zoom?.aplicarZoom?.(niveles[parseInt(e.key, 10) - 1]);
                    break;
                }
            }
        });
    }

    _namespace.shortcuts = {
        inicializarAtajos: _inicializarAtajos,
        inicializarBotonRuta: _inicializarBotonRuta,
        abrirMenuConstruccion: _abrirMenuConstruccion
    };
})();