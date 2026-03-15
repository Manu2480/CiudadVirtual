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

            /* Si se pulsa la tab activa de nuevo:
               - Construir: cancela el modo y vuelve a Mapa
               - Otras: cierra el panel */
            if (tabActivo === btn) {
                btn.classList.remove("tab--activo");
                _cerrarPanel(panelActivo);
                panelActivo = null;
                tabActivo   = null;
                window.Tablero?.cancelarModo();
                return;
            }

            botones.forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");
            tabActivo = btn;

            /* Tab Mapa: vuelve a modo normal, cierra cualquier panel */
            if (idPanel === "area-mapa") {
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.Tablero?.cancelarModo();
                return;
            }

            /* Tab Construir: activa modo construccion sin abrir nada.
               El catálogo se abre al tocar una celda vacía (menuConstruccion.js). */
            if (idPanel === "menu-construccion") {
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.Tablero?.activarModo("construccion");
                return;
            }

            /* Resto de tabs (recursos, stats): panel deslizable normal */
            const panel = document.getElementById(idPanel);
            if (!panel) {
                console.warn("TabsMovil: no se encontró panel", idPanel);
                return;
            }

            _cerrarPanel(panelActivo);
            panelActivo = panel;
            _abrirPanel(panel);
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