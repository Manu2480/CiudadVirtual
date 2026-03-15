/* ================================================
ZOOM MÓVIL
Zoom del mapa mediante pinch (dos dedos) y botones.

Responsabilidad:
  - Detectar gesto pinch sobre #area-mapa y aplicar
    el zoom proporcional a la distancia entre dedos
  - Conectar los botones #btn-zoom-in / #btn-zoom-out
    a Mapa.acercar() y Mapa.alejar()

Dependencias: mapa.js (Mapa.getZoom, Mapa.setZoom,
                        Mapa.acercar, Mapa.alejar)
================================================ */

function inicializar() {
    _inicializarPinch();
    _inicializarBotones();
}

function _inicializarPinch() {
    const area = document.getElementById("area-mapa");
    if (!area || !window.Mapa) return;

    let distanciaInicial = null;
    let zoomInicial      = null;

    function _distancia(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    area.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            distanciaInicial = _distancia(e.touches[0], e.touches[1]);
            zoomInicial      = Mapa.getZoom();
        }
    }, { passive: false });

    area.addEventListener("touchmove", (e) => {
        if (e.touches.length !== 2 || distanciaInicial === null) return;
        e.preventDefault();
        const distActual = _distancia(e.touches[0], e.touches[1]);
        Mapa.setZoom(zoomInicial * (distActual / distanciaInicial));
    }, { passive: false });

    area.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) {
            distanciaInicial = null;
            zoomInicial      = null;
        }
    }, { passive: true });
}

function _inicializarBotones() {
    document.getElementById("btn-zoom-in") ?.addEventListener("click", () => window.Mapa?.acercar());
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => window.Mapa?.alejar());
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.ZoomMovil = { inicializar };