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
        overflow-y: display;
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
        felicidad:    "fi fi-br-smile-beam",
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
        felicidad:    "%",
    };
    const ciudad = window.Tablero?.Estado?.ciudad;
    const prodData = ciudad?.calcularProduccionNeta?.() ?? {
        produccion: {},
        consumo: {},
        neto: {}
    };

    panel.innerHTML = `
        <h2 class="recurso-movil__titulo">
            Recursos
        </h2>

        ${Object.entries(_iconos).map(([key, icono]) => {

            const valor = recursos[key] ?? 0;
            const unidad = _unidades[key];
            const prod = prodData.produccion?.total?.[key] ?? 0;
            const cons = prodData.consumo?.total?.[key] ?? 0;
            const neto = prodData.neto?.[key] ?? 0;

            let formatted
            //Formatos específicos para electricidad, agua y dinero
            if (key === "electricidad" || key === "agua") {
                formatted = `${Math.round(prod)} / ${Math.round(cons)}`;
            } else {
                formatted = key === "dinero"
                    ? `$${Math.round(valor).toLocaleString()}`
                    : `${Math.round(valor)}${unidad}`;
            }
            let claseColor = "recurso-movil__valor--neutro";

            if (key === "dinero") {
                if (valor > 10000) claseColor = "recurso-movil__valor--positivo";
                else if (valor < 1000) claseColor = "recurso-movil__valor--negativo";
                else if (valor < 5000) claseColor = "recurso-movil__valor--advertencia";
            }

            const esFelicidad = key === "felicidad";

            return `
                <div class="recurso-movil ${!esFelicidad ? "hover" : ""}">

                    <i class="fi ${icono} recurso-movil__icono"></i>

                    <span class="recurso-movil__nombre">
                        ${_nombres[key]}
                    </span>

                    <span class="recurso-movil__valor ${claseColor}">
                        ${formatted}
                    </span>

                    ${!esFelicidad ? `
                    <div class="tooltip">

                        <div class="tooltip-prod">
                            Producción: +${Math.round(prod)}
                        </div>

                        <div class="tooltip-sub">
                            Industrial: +${Math.round(prodData.produccion?.porEdificio?.industrial?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Comercial: +${Math.round(prodData.produccion?.porEdificio?.comercial?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Servicio: +${Math.round(prodData.produccion?.porEdificio?.servicio?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Residencial: +${Math.round(prodData.produccion?.porEdificio?.residencial?.[key] ?? 0)}
                        </div>

                        <div class="tooltip-cons">
                            Consumo total: ${Math.round(cons)}
                        </div>

                        <div class="tooltip-sub">
                            Industrial: ${Math.round(prodData.consumo?.porEdificio?.industrial?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Comercial: ${Math.round(prodData.consumo?.porEdificio?.comercial?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Servicio: ${Math.round(prodData.consumo?.porEdificio?.servicio?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Residencial: ${Math.round(prodData.consumo?.porEdificio?.residencial?.[key] ?? 0)}
                        </div>
                        <div class="tooltip-sub">
                            Ciudadanos: ${Math.round(prodData.consumo?.porCiudadano?.[key] ?? 0)}
                        </div>

                        <div class="tooltip-neto">
                            Neto: ${Math.round(neto)}
                        </div>

                    </div>
                    ` : ""}
                </div>
            `;
        }).join("")}
        <button class="abrirModalRecursos" onclick="ModalRecursos.mostrar()">Menú recursos</button>
        `;
        activarHoverTouch(panel);
}
function activarHoverTouch(contenedor) {
    if (!contenedor) return;

    const elementosHover = contenedor.querySelectorAll(".hover");

    elementosHover.forEach((elemento) => {

        elemento.addEventListener("touchstart", () => {
            const tooltip = elemento.querySelector(".tooltip");
            if (!tooltip) return;
            elemento.classList.add("hover-activo");
        });

        elemento.addEventListener("touchend", () => {
            elemento.classList.remove("hover-activo");
        });
    });
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.RecursosMovil = { inicializar, abrirPanel, cerrarPanel };