/* ================================================
   RECURSOS PANEL
   Módulo responsable de mostrar recursos en
   la vista desktop y tablet (dinero, agua, electricidad,
   alimento, felicidad).
================================================ */
let ciudadPanelRecursos;
const _ID_OVERLAY_MOVIL = "recursos-overlay";
const _ID_PANEL_RECURSOS_MOVIL  = "recursos-panel-modal";

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
    felicidad:    " ",
};
function inicializar() {
    ciudadPanelRecursos = window.Tablero.Estado.ciudad;
    const vistaActual = document.documentElement.getAttribute("data-vista");
    if (vistaActual == "movil"){
        /* El panel del header (btn-recursos-movil) se oculta en móvil
        porque usamos la tab en su lugar */
        const btnHeader = document.getElementById("btn-recursos-movil");
        if (btnHeader) btnHeader.classList.add("oculto");
        const btnTabRecursos = document.getElementById("panel-recursos")
    }
    llamarRecursos();
    
}

function abrirPanelRecursos() {
    _crearPanelSiNoExiste();

    document.getElementById(_ID_OVERLAY_MOVIL)?.classList.add("activo");
    document.getElementById(_ID_PANEL_RECURSOS_MOVIL)?.classList.add("activo");
}
function _crearPanelSiNoExiste() {
    if (document.getElementById(_ID_PANEL_RECURSOS_MOVIL)) return;

    /* Overlay oscuro */
    const overlay = document.createElement("div");
    overlay.id = _ID_OVERLAY_MOVIL;
    overlay.className = "recursos-overlay";
    overlay.addEventListener("click", cerrarPanel);
    document.body.appendChild(overlay);

    /* Panel modal */
    const panel = document.createElement("div");
    panel.id = _ID_PANEL_RECURSOS_MOVIL;
    panel.className = "recursos-panel-modal";
    document.body.appendChild(panel);
    insertarPanel(panel);
    activarHoverTouch(panel);
}
function cerrarPanel() {
    const overlay = document.getElementById(_ID_OVERLAY_MOVIL);
    const panel   = document.getElementById(_ID_PANEL_RECURSOS_MOVIL);
    if (overlay) overlay.classList.remove("activo");
    if (panel)   panel.classList.remove("activo");
    overlay.remove();
    panel.remove();
}

function llamarRecursos() {
    if (!window.Tablero?.Estado?.ciudad) return;
    //Creamos una base sobre la que se insertará el html
    const contenido = document.createElement("div");
    contenido.className = "recursos-lista";

    const vistaActual = document.documentElement.getAttribute("data-vista");
    if (vistaActual == "desktop"){
        const panel = document.getElementById("panel-recursos-side");
        if (!panel) return;

        panel.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Recursos</h2></div>`;
        panel.appendChild(insertarPanel(contenido));
        activarHoverMouseDerecha(panel);
    }
    else if (vistaActual == "tablet"){
        const panelTabletVertical = document.getElementById("panel-recursos-tablet-vertical");
        const panelTabletHorizontal = document.getElementById("panel-recursos-tablet-horizontal");
        if (!panelTabletHorizontal && !panelTabletVertical) return;

        panelTabletHorizontal.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Recursos</h2></div>`;
        panelTabletVertical.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Recursos</h2></div>`;
        panelTabletHorizontal.appendChild(insertarPanel(contenido));
        //se copia el nodo para poderlo insertar en los dos lados
        const contenidoCopia = contenido.cloneNode(true);
        panelTabletVertical.appendChild(insertarPanel(contenidoCopia));
        activarHoverTouch(panelTabletVertical);
        activarHoverTouch(panelTabletHorizontal);
    }
}

function insertarPanel(contenido){
    contenido.innerHTML = Object.entries(_iconos).map(([key, icono]) => {
        const valor = ciudadPanelRecursos.getRecurso(key);
        const unidad = _unidades[key];
        //producción data
        const prodData = ciudadPanelRecursos.calcularProduccionNeta?.() ?? {};
        const prod = prodData.produccion?.total?.[key] ?? 0;
        const cons = prodData.consumo?.total?.[key] ?? 0;
        const neto = prodData?.neto?.[key] ?? 0;

        let formatted;

        if (key === "agua" || key === "electricidad") {
            formatted = `${Math.round(prod)} / ${Math.round(cons)}`;
        } else if (key === "dinero") {
            const v = Math.round(valor);
            formatted = v >= 100_000_000
                ? `${unidad}100M`
                : `${unidad}${v.toLocaleString()}`;
        } else if (key === "felicidad") {
            formatted = `${Math.round(valor)}${unidad}%`;
        } else {
            formatted = `${Math.round(valor)}${unidad}`;
        }
        // Determinar clase CSS según estado del recurso
        let claseColor = "";
        if (key === "dinero") {
            if (valor > 10000) claseColor = "recurso-item__valor--dinero-alto";
            else if (valor < 1000) claseColor = "recurso-item__valor--dinero-bajo";
            else if (valor < 5000) claseColor = "recurso-item__valor--dinero-medio";
        } else if (valor < 0) {
            claseColor = "recurso-item__valor--negativo";
        }


        const esFelicidad = key === "felicidad";

        return `
            <div class="recurso-item ${!esFelicidad ? "hover" : ""}">
                <i class="fi ${icono} recurso-item__icono"></i>
                <span class="recurso-item__label">${_nombres[key]}</span>
                <span class="recurso-item__valor ${claseColor}">
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
                        Consumo: ${Math.round(cons)}
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
                        Vias: ${Math.round(prodData.consumo?.porEdificio?.via?.[key] ?? 0)}
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
    }).join("");
    contenido.innerHTML += `<button class="abrirModalRecursos" onclick="ModalRecursos.mostrar()">Menú recursos</button>`;
    return contenido;
}

/* =========================================
   HOVER TÁCTIL
========================================= */
function activarHoverTouch(contenedor) {
    if (!contenedor) return;

    const elementosHover = contenedor.querySelectorAll(".hover");

    elementosHover.forEach((elemento) => {

        elemento.addEventListener("touchstart", () => {
            const tooltip = elemento.querySelector(".tooltip");
            if (!tooltip) return;

            const rect = elemento.getBoundingClientRect();
            const padding = 10;

            elemento.classList.add("hover-activo");

            let left = rect.left + rect.width / 2;
            let top = rect.top;

            const tooltipRect = tooltip.getBoundingClientRect();

            let finalLeft = left - tooltipRect.width / 2;

            if (finalLeft < padding) {
                finalLeft = padding;
            }

            if (finalLeft + tooltipRect.width > window.innerWidth - padding) {
                finalLeft = window.innerWidth - tooltipRect.width - padding;
            }

            document.documentElement.style.setProperty("--tooltip-left", finalLeft + "px");
            document.documentElement.style.setProperty("--tooltip-top", top + "px");
        });

        elemento.addEventListener("touchend", () => {
            elemento.classList.remove("hover-activo");
        });
    });
}

/* =========================================
   HOVER MOUSE (TOOLTIP A LA DERECHA)
========================================= */
function activarHoverMouseDerecha(contenedor) {
    if (!contenedor) return;

    const elementosHover = contenedor.querySelectorAll(".hover");

    elementosHover.forEach((elemento) => {
        elemento.addEventListener("mouseenter", (e) => {
            const tooltip = elemento.querySelector(".tooltip");
            if (!tooltip) return;

            elemento.classList.add("hover-activo");
            posicionarTooltipDerechaMouse(tooltip, e.clientX, e.clientY);
        });

        elemento.addEventListener("mousemove", (e) => {
            const tooltip = elemento.querySelector(".tooltip");
            if (!tooltip) return;

            posicionarTooltipDerechaMouse(tooltip, e.clientX, e.clientY);
        });

        elemento.addEventListener("mouseleave", () => {
            elemento.classList.remove("hover-activo");
        });
    });
}

function posicionarTooltipDerechaMouse(tooltip, mouseX, mouseY) {
    if (!tooltip) return;
    const offsetX = 14;
    const offsetY = 60;

    let left = mouseX + offsetX;
    let top = mouseY - offsetY;

    document.documentElement.style.setProperty("--tooltip-left", `${Math.round(left)}px`);
    document.documentElement.style.setProperty("--tooltip-top", `${Math.round(top)}px`);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
document.addEventListener("recursosModificados", llamarRecursos);

window.PanelRecursos = {inicializar, abrirPanelRecursos, cerrarPanel};