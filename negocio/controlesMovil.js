/* 
VISTA DE MANUELA
HU-022: Diseño Responsive - Vista Móvil
Como jugador en dispositivo móvil
Quiero que la interfaz se adapte a mi pantalla
Para poder jugar cómodamente desde mi teléfono
Criterios de Aceptación:
• [ ] En resoluciones < 768px:
o El mapa ocupa el 100% del ancho de la pantalla
o Los paneles se organizan verticalmente
o El menú de construcción se muestra como tabs en la parte inferior
o El panel de recursos se muestra como header colapsable
o Las estadísticas se acceden mediante botón flotante
• [ ] Controles táctiles optimizados:
o Botones de al menos 44x44px (target táctil mínimo)
o Tap en edificio para seleccionar
o Tap en celda vacía para construir
o Swipe horizontal para scroll del menú de edificios
[ ] El mapa es scrollable vertical y horizontalmente
• [ ] Zoom mediante pinch (dos dedos)
• [ ] El modal de información de edificio ocupa 80% de la pantalla
• [ ] Las notificaciones se muestran en la parte superior
• [ ] El widget de clima es compacto (icono + temperatura)
• [ ] Las noticias se muestran en carrusel horizontal
Prioridad: Alta
Dependencias: Todas las HUs de funcionalidad

/* controlesMovil.js
Controles específicos de la vista móvil (< 768px).
Cargado dinámicamente por vista.js.

Responsabilidades:
  - Tabs de navegación inferior
  - Panel de recursos colapsable
  - Botón flotante de estadísticas
  - Joystick de scroll del mapa
  - Pinch-to-zoom
  - Widget de clima compacto en el header
  - Carrusel de noticias sobre el mapa
*/

console.log("controlesMovil: cargado (readyState=", document.readyState, ")");

function _inicializarControlesMovil() {
    console.log("controlesMovil: inicialización (readyState=", document.readyState, ")");
    try {
        _inicializarTabs();
        _inicializarRecursosColapsable();
        _inicializarBtnStats();
        _inicializarJoystick();
        _inicializarMenuConstruccion();
        _inicializarPinchZoom();
        _inicializarClima();
        _inicializarNoticias();
        _inicializarZoomBtns();

        console.log("controlesMovil: inicialización completa");
    } catch (err) {
        console.error("controlesMovil: error durante inicialización", err);
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    _inicializarControlesMovil();
} else {
    document.addEventListener("DOMContentLoaded", _inicializarControlesMovil);
}


/* TABS DE NAVEGACIÓN INFERIOR
   Muestra/oculta secciones según la tab activa.
   El mapa siempre es la base; las demás secciones
   se superponen como panels deslizables. */
function _inicializarTabs() {
    const tabs = document.getElementById("tabs-movil");
    if (!tabs) return;

    console.log("controlesMovil: inicializando tabs de navegación");

    let panelActivo = null;
    let tabActivo = null;

    const botones = Array.from(tabs.querySelectorAll(".tab"));
    botones.forEach(btn => {
        btn.type = "button";
        btn.addEventListener("click", () => {
            const idPanel = btn.dataset.panel;
            console.log("controlesMovil: tab click", idPanel);

            // Si se vuelve a pulsar la misma tab activa, cerramos el panel y desactivamos la tab
            if (tabActivo === btn) {
                console.log("controlesMovil: tab activa clickeada de nuevo, cerrando panel", idPanel);
                btn.classList.remove("tab--activo");
                _cerrarPanelMovil(panelActivo);
                panelActivo = null;
                tabActivo = null;
                return;
            }

            botones.forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");
            tabActivo = btn;

            if (idPanel === "area-mapa") {
                _cerrarPanelMovil(panelActivo);
                panelActivo = null;
                return;
            }

            const panel = document.getElementById(idPanel);
            if (!panel) {
                console.warn("controlesMovil: no se encontró panel", idPanel);
                return;
            }

            console.log("controlesMovil: panel encontrado", panel.id, "visibilidad", panel.style.display, "clases", panel.className);

            _cerrarPanelMovil(panelActivo);
            panelActivo = panel;
            _abrirPanelMovil(panel);
        });
    });
}

function _abrirPanelMovil(panel) {
    if (!panel) return;
    console.log("controlesMovil: abriendo panel", panel.id);
    panel.classList.add("abierto");

    /* Asegura visibilidad aunque haya overlays con mayor z-index */
    const zIndex = panel.id === "menu-construccion" ? 2000 : 150;

    panel.style.cssText = `
        display: block;
        position: fixed;
        inset: var(--alto-encabezado) 0 var(--alto-tabs) 0;
        background: rgba(255,255,255,0.98);
        overflow-y: auto;
        z-index: ${zIndex};
        padding: var(--espacio-m);
        animation: slideUp 0.22s ease;
        border: 2px solid rgba(0, 0, 0, 0.25);
    `;

    console.log("controlesMovil: panel estilos", { display: panel.style.display, zIndex: panel.style.zIndex, clases: panel.className, parent: panel.parentElement?.tagName });
}

function _cerrarPanelMovil(panel) {
    if (!panel) return;
    console.log("controlesMovil: cerrando panel", panel.id);
    panel.style.cssText = "";
    panel.classList.remove("abierto");
}

/* MENÚ DE CONSTRUCCIÓN (móvil)
   Lista horizontal de edificios para seleccionar antes de construir.
   Swipe horizontal para navegar entre opciones. */
function _inicializarMenuConstruccion() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    console.log("controlesMovil: inicializar menu de construcción", { menu });

    /* Si el menú está dentro del sidebar oculto, lo movemos al body para que pueda desplegarse. */
    const sidebar = menu.closest(".sidebar--izquierdo");
    if (sidebar) {
        document.body.appendChild(menu);
        console.log("controlesMovil: movido menu-construccion fuera del sidebar", { parent: menu.parentElement });
    }

    /* Edificios y Tablero se cargan con defer, puede que no estén disponibles aún. */
    const intentos = parseInt(menu.dataset._intentos || "0", 10);
    if (!window.Edificios || !window.Tablero) {
        console.log("controlesMovil: esperando Edificios/Tablero", { intentos, tieneEdificios: !!window.Edificios, tieneTablero: !!window.Tablero });
        if (intentos < 15) {
            menu.dataset._intentos = (intentos + 1).toString();
            requestAnimationFrame(_inicializarMenuConstruccion);
        }
        return;
    }

    /* Limpia el contenido existente (por ejemplo, durante recarga) */
    const contenido = document.createElement("div");
    contenido.className = "construccion-lista";
    /* Fuerza fila horizontal con scroll — el panel se abre con style inline
       que no hereda CSS de clase, así que lo aplicamos directamente */
    contenido.style.cssText = `
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        height: 100%;
        width: 100%;
        padding: 0;
        gap: 0;
        box-sizing: border-box;
        scroll-snap-type: x mandatory;
    `;

    Edificios.todos().forEach(edificio => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "construccion-item";
        btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo}`);

        const cat = window.Recursos?.RECURSOS || {};
        const icono = key => cat[key]?.icono || "fi-br-question";

        const indicadores = [
            { key: "electricidad", icono: icono("electricidad"), fmt: v => `${v > 0 ? "+" : ""}${v} kW`  },
            { key: "agua",         icono: icono("agua"),         fmt: v => `${v > 0 ? "+" : ""}${v} L`   },
            { key: "alimento",     icono: icono("alimento"),     fmt: v => `+${v} kg`                     },
            { key: "dinero",       icono: icono("dinero"),       fmt: v => `+$${v.toLocaleString()}/turno` },
            { key: "felicidad",    icono: icono("felicidad"),    fmt: v => `${v > 0 ? "+" : ""}${v}`      },
            { key: "capacidad",    icono: icono("capacidadResidencial"), fmt: v => `+${v} hab`            },
            { key: "empleos",      icono: icono("capacidadLaboral"),     fmt: v => `+${v} empleos`        },
        ];

        const detallesHtml = indicadores
            .map(({ key, icono, fmt }) => {
                const valor = edificio[key];
                if (valor === null || valor === undefined || valor === 0) return "";
                return `<span class="construccion-item__atributo">
                            <i class="fi ${icono}"></i> ${fmt(valor)}
                        </span>`;
            })
            .filter(Boolean)
            .join("");

        btn.innerHTML = `
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="construccion-item__imagen" />
            <span class="construccion-item__nombre">${edificio.nombre}</span>
            <span class="construccion-item__costo">$${edificio.costo.toLocaleString()}</span>
            <p class="construccion-item__desc">${edificio.descripcion || ""}</p>
            <div class="construccion-item__detalles">${detallesHtml}</div>
        `;

        btn.addEventListener("click", () => {
            Tablero.seleccionarEdificio(edificio.id);
            window.Notificaciones?.mostrar(`Seleccionado: ${edificio.nombre}. Toca una celda vacía para construir.`, "aviso");
        });

        contenido.appendChild(btn);
    });

    menu.appendChild(contenido);
    console.log("controlesMovil: menú de construcción preparado", { menu, items: contenido.childElementCount, html: menu.innerHTML.slice(0, 200) });
}

/* Animación de entrada del panel */
const _styleSlide = document.createElement("style");
_styleSlide.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);   opacity: 1; }
    }
`;
document.head.appendChild(_styleSlide);


/* PANEL DE RECURSOS COLAPSABLE
   El botón del header despliega/colapsa los recursos. */
function _inicializarRecursosColapsable() {
    const btn   = document.getElementById("btn-recursos-movil");
    const panel = document.getElementById("panel-recursos");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
        panel.classList.toggle("abierto");
        btn.setAttribute("aria-expanded", panel.classList.contains("abierto"));
    });

    /* Cierra el panel al tocar fuera */
    document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !panel.contains(e.target)) {
            panel.classList.remove("abierto");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}


/* BOTÓN FLOTANTE DE ESTADÍSTICAS */
function _inicializarBtnStats() {
    const btn = document.getElementById("btn-stats-flotante");
    if (!btn) return;
    btn.addEventListener("click", () => {
        if (window.Modal) Modal.mostrarEstadisticas();
    });
}


/* JOYSTICK DE SCROLL
   Arrastra el knob para desplazar el área del mapa.
   La velocidad es proporcional a la distancia del centro. */
function _inicializarJoystick() {
    const area = document.getElementById("area-mapa");
    if (!area) return;

    /* Evita duplicar el joystick si ya existe */
    if (document.querySelector(".joystick-wrap")) return;

    /* Crea el HTML del joystick */
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
    const radio  = 33;   /* radio máximo de desplazamiento del knob (px) */
    const velMax = 12;   /* píxeles de scroll por frame al máximo */

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
        const factor = dist > radio ? radio / dist : 1;
        const cx = px * factor;
        const cy = py * factor;
        knob.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
        dx = cx / radio;
        dy = cy / radio;
    }

    function _resetKnob() {
        knob.style.transform = "translate(-50%, -50%)";
        dx = 0;
        dy = 0;
    }

    function _scrollLoop() {
        if (!activo) return;
        area.scrollLeft += dx * velMax;
        area.scrollTop  += dy * velMax;
        rafId = requestAnimationFrame(_scrollLoop);
    }

    wrap.addEventListener("touchstart", (e) => {
        if (activo) return;
        e.preventDefault();
        e.stopPropagation();
        const t  = e.changedTouches[0];
        origenId = t.identifier;
        activo   = true;
        const c  = _centro();
        _moverKnob(t.clientX - c.x, t.clientY - c.y);
        rafId = requestAnimationFrame(_scrollLoop);
    }, { passive: false });

    wrap.addEventListener("touchmove", (e) => {
        e.preventDefault();
        e.stopPropagation();
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


/* PINCH-TO-ZOOM
   Dos dedos en el área del mapa para acercar/alejar. */
function _inicializarPinchZoom() {
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
            distanciaInicial = _distancia(e.touches[0], e.touches[1]);
            zoomInicial      = Mapa.getZoom();
        }
    }, { passive: true });

    area.addEventListener("touchmove", (e) => {
        if (e.touches.length !== 2 || distanciaInicial === null) return;
        const distActual = _distancia(e.touches[0], e.touches[1]);
        const ratio      = distActual / distanciaInicial;
        Mapa.setZoom(zoomInicial * ratio);
    }, { passive: true });

    area.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) {
            distanciaInicial = null;
            zoomInicial      = null;
        }
    }, { passive: true });
}


/* BOTONES DE ZOOM (ocultos en CSS pero se conectan igual)
   Por si el usuario tiene tablero abierto en modo horizontal. */
function _inicializarZoomBtns() {
    document.getElementById("btn-zoom-in") ?.addEventListener("click", () => window.Mapa?.acercar());
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => window.Mapa?.alejar());
}


/* WIDGET DE CLIMA COMPACTO
   Llama a ApiClima con las coordenadas de la ciudad guardada
   e inyecta un chip de icono + temperatura en el header. */
function _inicializarClima() {
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad || !ciudad.latitud || !ciudad.longitud) return;

    const api = new ApiClima();

    api.getDatosClima(ciudad.longitud, ciudad.latitud)
        .then(datos => {
            const icono = _iconoClima(datos.condicion);
            const chip  = document.createElement("span");
            chip.className = "clima-compacto";
            chip.title     = `${datos.condicion} · Humedad ${datos.humedad}%`;
            chip.innerHTML = `
                <i class="fi ${icono} clima-compacto__icono"></i>
                <span>${Math.round(datos.temperatura)}°C</span>
            `;

            /* Lo inserta antes del botón de recursos en el header */
            const btnRec = document.getElementById("btn-recursos-movil");
            if (btnRec) btnRec.before(chip);
        })
        .catch(err => console.warn("controlesMovil: clima no disponible.", err));
}

/* Mapea la descripción de OpenWeather a un icono de UIcons */
function _iconoClima(condicion = "") {
    const c = condicion.toLowerCase();
    if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
    if (c.includes("tormenta"))                          return "fi-br-thunderstorm";
    if (c.includes("nieve"))                             return "fi-br-snowflake";
    if (c.includes("niebla") || c.includes("neblina"))  return "fi-br-cloud-fog";
    if (c.includes("nube") || c.includes("nublado"))    return "fi-br-clouds";
    if (c.includes("parcialmente"))                      return "fi-br-cloud-sun";
    return "fi-br-sun";   /* despejado por defecto */
}


/* CARRUSEL DE NOTICIAS
   Llama a ApiNoticias y construye un carrusel horizontal
   superpuesto en la parte inferior del mapa. */
function _inicializarNoticias() {
    const area = document.getElementById("area-mapa");
    if (!area) return;

    const api = new ApiNoticias();

    api.getNoticias()
        .then(res => {
            const articulos = res.articles || [];
            if (articulos.length === 0) return;

            const carrusel = document.createElement("div");
            carrusel.className = "noticias-movil";
            carrusel.setAttribute("aria-label", "Noticias");

            articulos.forEach(art => {
                const card = document.createElement("div");
                card.className = "noticia-card";
                card.innerHTML = `
                    <p class="noticia-card__titulo">${art.title || "Sin título"}</p>
                    <p>${art.description || ""}</p>
                `;
                carrusel.appendChild(card);
            });

            area.appendChild(carrusel);
        })
        .catch(err => console.warn("controlesMovil: noticias no disponibles.", err));
}