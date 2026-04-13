(function () {
    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};
    const _state = window.ControlesDesktopState;

    function _crearIndicadorModo() {
        const existente = document.getElementById("indicador-modo");
        if (existente) {
            _state.indicadorModo = existente;
            return;
        }

        _state.indicadorModo = document.createElement("div");
        _state.indicadorModo.id = "indicador-modo";
        _state.indicadorModo.className = "indicador-modo indicador-modo--oculto";
        document.body.appendChild(_state.indicadorModo);
    }

    function _actualizarIndicadorModo(tipo, mensaje) {
        if (!_state.indicadorModo) return;

        _state.indicadorModo.textContent = mensaje;
        _state.indicadorModo.className = `indicador-modo${tipo === "demolicion" ? " indicador-modo--demolicion" : ""}`;
        _state.indicadorModo.classList.remove("indicador-modo--oculto");
    }

    function _ocultarIndicadorModo() {
        if (!_state.indicadorModo) return;
        _state.indicadorModo.classList.add("indicador-modo--oculto");
    }

    _namespace.ui = {
        crearIndicadorModo: _crearIndicadorModo,
        actualizarIndicadorModo: _actualizarIndicadorModo,
        ocultarIndicadorModo: _ocultarIndicadorModo
    };
})();