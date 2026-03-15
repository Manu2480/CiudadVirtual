/* ================================================
JOYSTICK MÓVIL
Control de scroll del mapa mediante arrastre táctil.

Responsabilidad:
  - Crear e inyectar el elemento joystick en el DOM
  - Escuchar eventos touch para mover el knob
  - Desplazar el área del mapa proporcionalmente
    a la posición del knob respecto al centro

Dependencias: (ninguna, opera directamente sobre #area-mapa)
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

    const knob   = wrap.querySelector(".joystick-knob");
    const RADIO  = 33;   /* radio máximo de desplazamiento del knob (px) */
    const VEL_MAX = 12;  /* píxeles de scroll por frame al máximo */

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

    wrap.addEventListener("touchstart", (e) => {
        if (activo) return;
        e.preventDefault();
        const t  = e.changedTouches[0];
        origenId = t.identifier;
        activo   = true;
        const c  = _centro();
        _moverKnob(t.clientX - c.x, t.clientY - c.y);
        rafId = requestAnimationFrame(_scrollLoop);
    }, { passive: false });

    wrap.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const t = Array.from(e.changedTouches).find(x => x.identifier === origenId);
        if (!t) return;
        const c = _centro();
        _moverKnob(t.clientX - c.x, t.clientY - c.y);
    }, { passive: false });

    wrap.addEventListener("touchend", (e) => {
        const t = Array.from(e.changedTouches).find(x => x.identifier === origenId);
        if (!t) return;
        activo = false;
        cancelAnimationFrame(rafId);
        _resetKnob();
    });

    wrap.addEventListener("touchcancel", () => {
        activo = false;
        cancelAnimationFrame(rafId);
        _resetKnob();
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.JoystickMovil = { inicializar };