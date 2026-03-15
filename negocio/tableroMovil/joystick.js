/* ================================================
JOYSTICK MÓVIL
Control de scroll del mapa mediante arrastre táctil.

Responsabilidad:
  - Crear e inyectar el elemento joystick en el DOM
  - Escuchar eventos touch sobre la base circular
  - Desplazar el área del mapa proporcionalmente
    a la posición del knob respecto al centro
  - Ocultarse cuando el modo activo requiere
    interacción directa con celdas (construccion, demolicion)

pointer-events:
  Los listeners van en .joystick-base, no en .joystick-wrap.
  El wrap tiene pointer-events:none en CSS para no bloquear
  las celdas del mapa en las esquinas del cuadrado bounding box.

Dependencias: tablero.js (Tablero.Estado.modo)
================================================ */

function inicializar() {
    const area = document.getElementById("area-mapa");
    if (!area) return;

    /* Evita duplicar el joystick si ya existe */
    if (document.querySelector(".joystick-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "joystick-wrap";
    wrap.setAttribute("aria-label", "Joystick de navegación del mapa");
    wrap.innerHTML = `
        <div class="joystick-base"></div>
        <div class="joystick-arrows">
            <i class="fi fi-br-angle-up"></i>
            <i class="fi fi-br-angle-down"></i>
            <i class="fi fi-br-angle-left"></i>
            <i class="fi fi-br-angle-right"></i>
        </div>
        <div class="joystick-knob"></div>
    `;
    document.body.appendChild(wrap);

    /* Oculta el joystick cuando el body tiene modo-construccion o modo-demolicion.
       Se lee directamente de las clases del body que tablero.js gestiona,
       sin depender de que Tablero.Estado esté disponible en el momento. */
    function _actualizarVisibilidad() {
        const cl = document.body.classList;
        wrap.hidden = cl.contains("modo-construccion") || cl.contains("modo-demolicion");
    }

    const _observer = new MutationObserver(_actualizarVisibilidad);
    _observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    _actualizarVisibilidad();

    /* ── Lógica de arrastre ──
       Los listeners van en la BASE, no en el wrap.
       El wrap tiene pointer-events:none en CSS — solo la base
       circular captura touch, liberando las esquinas del bounding box. */

    const base    = wrap.querySelector(".joystick-base");
    const knob    = wrap.querySelector(".joystick-knob");
    const RADIO   = 33;
    const VEL_MAX = 12;

    let activo   = false;
    let dx = 0, dy = 0;
    let rafId    = null;
    let origenId = null;

    function _centro() {
        const r = wrap.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function _moverKnob(px, py) {
        const dist   = Math.sqrt(px * px + py * py);
        const factor = dist > RADIO ? RADIO / dist : 1;
        const cx = px * factor;
        const cy = py * factor;
        knob.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
        dx = cx / RADIO;
        dy = cy / RADIO;
    }

    function _resetKnob() {
        knob.style.transform = "translate(-50%, -50%)";
        dx = 0;
        dy = 0;
    }

    function _scrollLoop() {
        if (!activo) return;
        area.scrollLeft += dx * VEL_MAX;
        area.scrollTop  += dy * VEL_MAX;
        rafId = requestAnimationFrame(_scrollLoop);
    }

    base.addEventListener("touchstart", (e) => {
        if (activo) return;
        e.preventDefault();
        const t  = e.changedTouches[0];
        origenId = t.identifier;
        activo   = true;
        const c  = _centro();
        _moverKnob(t.clientX - c.x, t.clientY - c.y);
        rafId = requestAnimationFrame(_scrollLoop);
    }, { passive: false });

    base.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const t = Array.from(e.changedTouches).find(x => x.identifier === origenId);
        if (!t) return;
        const c = _centro();
        _moverKnob(t.clientX - c.x, t.clientY - c.y);
    }, { passive: false });

    base.addEventListener("touchend", (e) => {
        const t = Array.from(e.changedTouches).find(x => x.identifier === origenId);
        if (!t) return;
        activo = false;
        cancelAnimationFrame(rafId);
        _resetKnob();
    });

    base.addEventListener("touchcancel", () => {
        activo = false;
        cancelAnimationFrame(rafId);
        _resetKnob();
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.JoystickMovil = { inicializar };