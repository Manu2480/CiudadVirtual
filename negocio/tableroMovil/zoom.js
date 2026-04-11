// zoom con dos dedos
(function() {
    const _zoomState = {
        nivel:            1,
        min:              0.4,
        max:              2.5,
        distanciaInicial: null,
        nivelInicial:     null,
    };

    function inicializar() {
        const area = document.getElementById("area-mapa");
        if (!area) return;

        area.addEventListener("touchstart", _onTouchStart, { passive: false });
        area.addEventListener("touchmove",  _onTouchMove,  { passive: false });
        area.addEventListener("touchend",   _onTouchEnd,   { passive: true  });
        area.addEventListener("touchcancel",_onTouchEnd,   { passive: true  });
    }

    function _distancia(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function _aplicarZoom() {
        const gridEl = document.getElementById("mapa-grid");
        if (!gridEl) return;
        document.documentElement.style.setProperty("--escala-mapa",`${_zoomState.nivel}`)

    }

    function _onTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            _zoomState.distanciaInicial = _distancia(e.touches[0], e.touches[1]);
            _zoomState.nivelInicial     = _zoomState.nivel;
        }
    }

    function _onTouchMove(e) {
        if (e.touches.length !== 2 || _zoomState.distanciaInicial === null) return;
        e.preventDefault();
        const distActual = _distancia(e.touches[0], e.touches[1]);
        const ratio      = distActual / _zoomState.distanciaInicial;
        _zoomState.nivel = Math.min(
            _zoomState.max,
            Math.max(_zoomState.min, _zoomState.nivelInicial * ratio)
        );
        _aplicarZoom();
    }

    function _onTouchEnd(e) {
        if (e.touches.length < 2) {
            _zoomState.distanciaInicial = null;
            _zoomState.nivelInicial     = null;
        }
    }

    window.ZoomMovil = { inicializar };
})();