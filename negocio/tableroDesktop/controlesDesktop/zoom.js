(function () {
    const _namespace = window.ControlesDesktopInternals = window.ControlesDesktopInternals || {};
    const _state = window.ControlesDesktopState;

    function _crearIndicadorZoom() {
        if (!_state.controlesZoom) return;

        const existente = _state.controlesZoom.querySelector(".zoom-indicador");
        if (existente) {
            _state.zoomIndicador = existente;
            return;
        }

        _state.zoomIndicador = document.createElement("span");
        _state.zoomIndicador.className = "zoom-indicador";
        _state.zoomIndicador.textContent = `${Math.round(_state.zoomActual * 100)}%`;

        const btnIn = _state.controlesZoom.querySelector("#btn-zoom-in");
        if (btnIn) {
            _state.controlesZoom.insertBefore(_state.zoomIndicador, btnIn);
        }
    }

    function _actualizarBotonesZoom() {
        if (_state.btnZoomIn) {
            _state.btnZoomIn.disabled = _state.zoomActual >= _state.zoomMax;
        }

        if (_state.btnZoomOut) {
            _state.btnZoomOut.disabled = _state.zoomActual <= _state.zoomMin;
        }
    }

    function _aplicarZoom(nuevoZoom) {
        _state.zoomActual = Math.min(
            _state.zoomMax,
            Math.max(_state.zoomMin, nuevoZoom)
        );

        const nuevoTamano = 48 * _state.zoomActual;
        document.documentElement.style.setProperty("--tamano-celda", `${nuevoTamano}px`);

        if (_state.gridMapa) {
            _state.gridMapa.setAttribute("data-zoom", _state.zoomActual);
        }

        document.documentElement.style.setProperty("--zoom-actual", _state.zoomActual);

        if (_state.zoomIndicador) {
            _state.zoomIndicador.textContent = `${Math.round(_state.zoomActual * 100)}%`;
        }

        _actualizarBotonesZoom();

        if (window.Mapa && typeof window.Mapa.setZoom === "function") {
            window.Mapa.setZoom(_state.zoomActual);
        }
    }

    function _acercar() {
        const indiceActual = _state.zoomNiveles.findIndex((z) => z >= _state.zoomActual);

        if (indiceActual < _state.zoomNiveles.length - 1) {
            _aplicarZoom(_state.zoomNiveles[indiceActual + 1]);
        }
    }

    function _alejar() {
        const indiceActual = _state.zoomNiveles.findIndex((z) => z >= _state.zoomActual);

        if (indiceActual > 0) {
            _aplicarZoom(_state.zoomNiveles[indiceActual - 1]);
        } else {
            _aplicarZoom(_state.zoomNiveles[0]);
        }
    }

    function _inicializarZoom() {
        _crearIndicadorZoom();

        if (_state.btnZoomIn) {
            _state.btnZoomIn.addEventListener("click", () => _acercar());
        }

        if (_state.btnZoomOut) {
            _state.btnZoomOut.addEventListener("click", () => _alejar());
        }

        if (_state.areaMapa) {
            _state.areaMapa.addEventListener("wheel", (e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                        _acercar();
                    } else {
                        _alejar();
                    }
                }
            }, { passive: false });
        }

        _actualizarBotonesZoom();
        _aplicarZoom(_state.zoomActual);
    }

    _namespace.zoom = {
        inicializarZoom: _inicializarZoom,
        crearIndicadorZoom: _crearIndicadorZoom,
        aplicarZoom: _aplicarZoom,
        acercar: _acercar,
        alejar: _alejar,
        actualizarBotonesZoom: _actualizarBotonesZoom
    };
})();