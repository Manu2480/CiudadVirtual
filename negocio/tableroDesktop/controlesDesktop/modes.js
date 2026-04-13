(function () {
    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};

    function _actualizarIndicadorModo(tipo, mensaje) {
        _namespace.ui?.actualizarIndicadorModo?.(tipo, mensaje);
    }

    function _ocultarIndicadorModo() {
        _namespace.ui?.ocultarIndicadorModo?.();
    }

    function _activarModoVia() {
        const via = Edificios?.obtener("via");
        if (!via) {
            Notificaciones.mostrar("No se encontró el tipo de vía.", "error");
            return;
        }

        Tablero.seleccionarEdificio("via");
        _actualizarIndicadorModo("construccion", "Modo: Construir Vía (ESC para cancelar)");
        Notificaciones.mostrar("Modo construcción de vías activado.", "exito");
    }

    function _activarModoDemolicion() {
        Tablero.activarModo("demolicion");
        _actualizarIndicadorModo("demolicion", "Modo: Demolición (ESC para cancelar)");
        Notificaciones.mostrar("Modo demolición activado. Haz clic en un edificio para demoler.", "aviso");
    }

    function _cancelarModo() {
        Tablero.cancelarModo();
        window.RutaMovil?.limpiarTodo();
        _ocultarIndicadorModo();
        Notificaciones.mostrar("Modo cancelado.", "aviso");
    }

    _namespace.modos = {
        activarModoVia: _activarModoVia,
        activarModoDemolicion: _activarModoDemolicion,
        cancelarModo: _cancelarModo
    };
})();