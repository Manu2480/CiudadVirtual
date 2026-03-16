/* ================================================
RECURSOS MÓVIL
Panel de recursos como modal centrado.

Responsabilidades:
  - Abrir un modal con el estado actual de los recursos
    al pulsar la tab Recursos
  - Cerrar al tocar fuera o al pulsar de nuevo la tab
  - Exponer abrirPanel / cerrarPanel para tabs.js

Dependencias: tablero.js (Tablero.Estado.ciudad)
================================================ */

const _ID_OVERLAY = "recursos-overlay";
const _ID_PANEL   = "recursos-panel-modal";

function inicializar() {
    /* El panel del header (btn-recursos-movil) se oculta en móvil
       porque usamos la tab en su lugar */
    const btnHeader = document.getElementById("btn-recursos-movil");
    if (btnHeader) btnHeader.style.display = "none";
}

function abrirPanel() {
    _crearPanelSiNoExiste();
    _renderizarRecursos();

    document.getElementById(_ID_OVERLAY).style.display = "block";
    document.getElementById(_ID_PANEL).style.display   = "flex";
}

function cerrarPanel() {
    const overlay = document.getElementById(_ID_OVERLAY);
    const panel   = document.getElementById(_ID_PANEL);
    if (overlay) overlay.style.display = "none";
    if (panel)   panel.style.display   = "none";
}

function _crearPanelSiNoExiste() {
    if (document.getElementById(_ID_PANEL)) return;

    /* Overlay oscuro */
    const overlay = document.createElement("div");
    overlay.id = _ID_OVERLAY;
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.45);
        z-index: 1299;
        display: none;
    `;
    overlay.addEventListener("click", cerrarPanel);
    document.body.appendChild(overlay);

    /* Panel modal */
    const panel = document.createElement("div");
    panel.id = _ID_PANEL;
    panel.style.cssText = `
        display: none;
        flex-direction: column;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90vw;
        max-height: 70vh;
        background: rgba(255,255,255,0.98);
        overflow-y: auto;
        z-index: 1300;
        padding: var(--espacio-m);
        border-radius: var(--radio-m, 12px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        gap: var(--espacio-s);
    `;
    document.body.appendChild(panel);
}

function _renderizarRecursos() {
    const panel = document.getElementById(_ID_PANEL);
    if (!panel) return;

    /* Lee siempre desde localStorage para tener el valor más actualizado */
    let recursos = {};
    try {
        const raw = CiudadStorage.cargar();
        if (raw) recursos = JSON.parse(raw)?.estadoRecursos ?? {};
    } catch (e) {
        recursos = window.Tablero?.Estado?.ciudad?.estadoRecursos ?? {};
    }

    const _iconos = {
        dinero:       "fi-br-coins",
        agua:         "fi-br-raindrops",
        electricidad: "fi-br-bolt",
        alimento:     "fi-br-wheat",
        felicidad:    "fi-br-smile",
    };

    const _nombres = {
        dinero:       "Dinero",
        agua:         "Agua",
        electricidad: "Electricidad",
        alimento:     "Alimento",
        felicidad:    "Felicidad",
    };

    const _unidades = {
        dinero:       "$",
        agua:         " L",
        electricidad: " kW",
        alimento:     " kg",
        felicidad:    "",
    };

    panel.innerHTML = `
        <h2 style="font-size: var(--fuente-tam-l); font-weight: 700;
                   color: var(--color-texto); margin-bottom: var(--espacio-s);
                   padding-bottom: var(--espacio-s);
                   border-bottom: 1px solid var(--color-borde);">
            Recursos
        </h2>
        ${Object.entries(_iconos).map(([key, icono]) => {
            const valor = recursos[key] ?? 0;
            const unidad = _unidades[key];
            const formatted = key === "dinero"
                ? `$${Math.round(valor).toLocaleString()}`
                : `${Math.round(valor)}${unidad}`;
            const color = valor < 0 ? "var(--color-energia)" : "var(--color-texto)";
            return `
                <div style="display:flex; align-items:center; gap: var(--espacio-m);
                            padding: var(--espacio-s) var(--espacio-m);
                            background: var(--color-fondo);
                            border-radius: var(--radio-s);">
                    <i class="fi ${icono}" style="font-size:20px; color: var(--color-primario); flex-shrink:0;"></i>
                    <span style="flex:1; font-weight:600; color: var(--color-texto);">
                        ${_nombres[key]}
                    </span>
                    <span style="font-weight:700; font-size: var(--fuente-tam-l); color:${color};">
                        ${formatted}
                    </span>
                </div>
            `;
        }).join("")}
    `;
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.RecursosMovil = { inicializar, abrirPanel, cerrarPanel };