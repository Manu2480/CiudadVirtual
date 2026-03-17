/* ================================================
TABS MÓVIL
Navegación inferior por tabs.

Responsabilidad:
  - Registrar clicks en los botones .tab
  - Abrir y cerrar paneles deslizables sobre el mapa
  - Mantener el estado de tab/panel activo
  - Coordinar el modo del tablero según la tab activa:
      · Tab Mapa      → modo normal, joystick visible
      · Tab Construir → modo construccion, sin panel (el
                        catálogo se abre al tocar una celda)
      · Otras tabs    → modo normal, panel deslizable

Dependencias: tablero.js (Tablero.activarModo, Tablero.cancelarModo)
================================================ */

/* Animación de entrada compartida por todos los paneles */
const _styleSlide = document.createElement("style");
_styleSlide.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);   opacity: 1; }
    }
`;
document.head.appendChild(_styleSlide);


function _abrirPanel(panel) {
    if (!panel) return;
    panel.style.cssText = `
        display: block;
        position: fixed;
        inset: var(--alto-encabezado) 0 var(--alto-tabs) 0;
        background: rgba(255,255,255,0.98);
        overflow-y: auto;
        z-index: 150;
        padding: var(--espacio-m);
        animation: slideUp 0.22s ease;
        border: 2px solid rgba(0, 0, 0, 0.25);
    `;
    panel.classList.add("abierto");
}

function _cerrarPanel(panel) {
    if (!panel) return;
    panel.style.cssText = "";
    panel.classList.remove("abierto");
}

function inicializar() {
    const tabs = document.getElementById("tabs-movil");
    if (!tabs) return;

    let panelActivo = null;
    let tabActivo   = null;

    const botones = Array.from(tabs.querySelectorAll(".tab"));
    botones.forEach(btn => {
        btn.type = "button";
        btn.addEventListener("click", () => {
            const idPanel = btn.dataset.panel;

            /* ── Tab CONSTRUIR ── */
            if (idPanel === "menu-construccion") {
                const catalogoAbierto = document.getElementById("menu-construccion")
                    ?.classList.contains("abierto");
                const yaEnConstruir = tabActivo === btn;

                if (catalogoAbierto) {
                    /* 3. Cierra el catálogo si está abierto */
                    window.MenuConstruccionMovil?.cerrarCatalogo();
                    return;
                }

                if (yaEnConstruir) {
                    /* 4. Ya está en construir y catálogo cerrado: notifica */
                    window.Notificaciones?.mostrar(
                        "Ya estás en modo construcción. Toca una celda para construir.",
                        "aviso"
                    );
                    return;
                }

                /* 1 y 2. Activa modo construcción y oculta joystick */
                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.NoticiasMovil?.ocultarCarrusel();
                window.Tablero?.activarModo("construccion");
                return;
            }

            /* ── Tab MAPA ── */
            if (idPanel === "area-mapa") {
                if (tabActivo === btn) {
                    /* Ya está en mapa: notifica que use el joystick */
                    window.Notificaciones?.mostrar(
                        "Ya estás en el mapa. Usa el joystick para desplazarte.",
                        "aviso"
                    );
                    return;
                }

                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.NoticiasMovil?.ocultarCarrusel();
                window.Tablero?.cancelarModo();   /* modo normal → joystick visible */
                return;
            }

            /* ── Tab NOTICIAS ── */
            if (idPanel === "noticias") {
                /* Si ya está activa la tab, la cierra y oculta el carrusel */
                if (tabActivo === btn) {
                    btn.classList.remove("tab--activo");
                    tabActivo = null;
                    window.NoticiasMovil?.ocultarCarrusel();
                    return;
                }

                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.Tablero?.cancelarModo();
                /* Renderiza el carrusel sobre el mapa solo ahora que el usuario lo pide */
                window.NoticiasMovil?.mostrarCarrusel();
                return;
            }

            /* ── Tab RECURSOS ── */
            if (idPanel === "panel-recursos") {
                if (tabActivo === btn) {
                    btn.classList.remove("tab--activo");
                    tabActivo = null;
                    window.RecursosMovil?.cerrarPanel();
                    return;
                }
                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.NoticiasMovil?.ocultarCarrusel();
                window.Tablero?.cancelarModo();
                window.RecursosMovil?.abrirPanel();
                return;
            }

            /* ── Resto de tabs ── */
            if (tabActivo === btn) {
                btn.classList.remove("tab--activo");
                _cerrarPanel(panelActivo);
                panelActivo = null;
                tabActivo   = null;
                return;
            }

            botones.forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");
            tabActivo = btn;

            const panel = document.getElementById(idPanel);
            if (!panel) {
                console.warn("TabsMovil: no se encontró panel", idPanel);
                return;
            }

            _cerrarPanel(panelActivo);
            panelActivo = panel;
            _abrirPanel(panel);
            window.NoticiasMovil?.ocultarCarrusel();
            window.Tablero?.cancelarModo();
        });
    });
}

/* Abre el catálogo de edificios sobre el mapa.
   Llamado desde mapa.js cuando el usuario toca una celda
   vacía en modo construccion y aún no hay edificio seleccionado. */
function abrirCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;
    _abrirPanel(menu);
}

/* Cierra el catálogo. Llamado desde menuConstruccion.js
   tras seleccionar un edificio. */
function cerrarCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;
    _cerrarPanel(menu);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.TabsMovil = { inicializar, abrirCatalogo, cerrarCatalogo };