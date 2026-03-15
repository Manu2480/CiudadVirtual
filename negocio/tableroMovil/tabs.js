/* ================================================
TABS MÓVIL
Navegación inferior por tabs.

Responsabilidad:
  - Registrar clicks en los botones .tab
  - Abrir y cerrar paneles deslizables sobre el mapa
  - Mantener el estado de tab/panel activo

Dependencias: (ninguna)
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
    console.log("TabsMovil: abriendo panel", panel.id);

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
    panel.classList.add("abierto");
}

function _cerrarPanel(panel) {
    if (!panel) return;
    console.log("TabsMovil: cerrando panel", panel.id);
    panel.style.cssText = "";
    panel.classList.remove("abierto");
}

function inicializar() {
    const tabs = document.getElementById("tabs-movil");
    if (!tabs) return;

    console.log("TabsMovil: inicializando tabs de navegación");

    let panelActivo = null;
    let tabActivo   = null;

    const botones = Array.from(tabs.querySelectorAll(".tab"));
    botones.forEach(btn => {
        btn.type = "button";
        btn.addEventListener("click", () => {
            const idPanel = btn.dataset.panel;
            console.log("TabsMovil: tab click", idPanel);

            /* Si se pulsa la tab activa de nuevo, cierra el panel */
            if (tabActivo === btn) {
                console.log("TabsMovil: tab activa clickeada de nuevo, cerrando panel", idPanel);
                btn.classList.remove("tab--activo");
                _cerrarPanel(panelActivo);
                panelActivo = null;
                tabActivo   = null;
                return;
            }

            botones.forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");
            tabActivo = btn;

            /* Tab del mapa: solo cierra cualquier panel abierto */
            if (idPanel === "area-mapa") {
                _cerrarPanel(panelActivo);
                panelActivo = null;
                return;
            }

            const panel = document.getElementById(idPanel);
            if (!panel) {
                console.warn("TabsMovil: no se encontró panel", idPanel);
                return;
            }

            _cerrarPanel(panelActivo);
            panelActivo = panel;
            _abrirPanel(panel);
        });
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.TabsMovil = { inicializar };