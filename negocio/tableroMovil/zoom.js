/* ================================================
ZOOM MÓVIL
Zoom del mapa mediante pinch (dos dedos).

Responsabilidad:
  - Detectar gesto pinch sobre #area-mapa
  - Aplicar transform:scale solo al #mapa-grid
  - Mantener el nivel de zoom dentro de los límites

Dependencias: (ninguna — opera directamente sobre el DOM)
================================================ */

const _zoomState = {
    nivel:   1,
    min:     0.4,
    max:     2.5,
};

function inicializar() {
    _inicializarPinch();
}

function _aplicarZoom() {
    const gridEl = document.getElementById("mapa-grid");
    if (!gridEl) return;
    gridEl.style.transform       = `scale(${_zoomState.nivel})`;
    gridEl.style.transformOrigin = "top left";
}

function _inicializarPinch() {
    const area = document.getElementById("area-mapa");
    if (!area) return;

    let distanciaInicial = null;
    let nivelInicial     = null;

    function _distancia(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    area.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            distanciaInicial = _distancia(e.touches[0], e.touches[1]);
            nivelInicial     = _zoomState.nivel;
        }
    }, { passive: false });

    area.addEventListener("touchmove", (e) => {
        if (e.touches.length !== 2 || distanciaInicial === null) return;
        e.preventDefault();
        const ratio  = _distancia(e.touches[0], e.touches[1]) / distanciaInicial;
        _zoomState.nivel = Math.min(_zoomState.max, Math.max(_zoomState.min, nivelInicial * ratio));
        _aplicarZoom();
    }, { passive: false });

    area.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) {
            distanciaInicial = null;
            nivelInicial     = null;
        }
    }, { passive: true });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.ZoomMovil = { inicializar };