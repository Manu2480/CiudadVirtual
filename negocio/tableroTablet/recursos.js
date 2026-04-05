function inicializar(){
    llamarRecursos();
}

function llamarRecursos() {
    let recursos = {};
    try {
        const raw = CiudadStorage.cargar();
        if (raw) recursos = JSON.parse(raw)?.estadoRecursos ?? {};
    } catch (e) {
        recursos = window.Tablero?.Estado?.ciudad?.estadoRecursos ?? {};
    }

    // producción / consumo / neto
    const ciudad = window.Tablero?.Estado?.ciudad;
    const prodData = ciudad?.calcularProduccionNeta?.() ?? {
        produccion: {},
        consumo: {},
        neto: {}
    };

    const panelTabletVertical = document.getElementById("panel-recursos-tablet-vertical");
    const panelTabletHorizontal = document.getElementById("panel-recursos-tablet-horizontal");

    renderizarRecursos(recursos, panelTabletVertical, prodData);
    renderizarRecursos(recursos, panelTabletHorizontal, prodData);

    //activar hover táctil
    activarHoverTouch(panelTabletVertical);
    activarHoverTouch(panelTabletHorizontal);

    const botonesRecursos = document.querySelectorAll(".abrirModalRecursos");
    botonesRecursos.forEach((boton) => {
        boton.addEventListener("click", ModalRecursos.mostrar);
    });
}

function renderizarRecursos(recursos, panel, prodData){

    if (!panel || !recursos){
        console.log("No se encontró el panel de recursos");
        return;
    }

    panel.innerHTML = '<h2 class="panel__titulo">Recursos</h2>';

    const indicadores = [
        { clave: "dinero",       icono: "fi-br-coins",     label: "Dinero",       fmt: v => `$${Math.round(v).toLocaleString()}` },
        { clave: "agua",         icono: "fi-br-raindrops", label: "Agua",         fmt: v => `${Math.round(v)} L`  },
        { clave: "electricidad", icono: "fi-br-bolt",      label: "Electricidad", fmt: v => `${Math.round(v)} kW` },
        { clave: "alimento",     icono: "fi-br-wheat",     label: "Alimento",     fmt: v => `${Math.round(v)} kg` },
        { clave: "felicidad",    icono: "fi fi-br-smile-beam", label: "Felicidad", fmt: v => `${Math.round(v)}%` },
    ];

    panel.innerHTML += indicadores.map(({ clave, icono, label, fmt }) => {

        const valor = recursos[clave] ?? 0;
        const prod = prodData.produccion?.total?.[clave] ?? 0;
        const cons = prodData.consumo?.total?.[clave] ?? 0;
        const neto = prodData?.neto?.[clave] ?? 0;
        const esFelicidad = clave === "felicidad"; 

        // Color condicional solo para dinero
        let valorClass = "";
        if (clave === "dinero") {
            if (valor > 10000) valorClass = "verde";
            else if (valor < 1000) valorClass = "rojo";
            else if (valor < 5000) valorClass = "amarillo";
        }

        return `
            <div class="recurso recurso--${clave} ${!esFelicidad ? "hover" : ""}">
                <i class="fi ${icono} recurso__icono"></i>
                <span class="recurso__label">${label}:</span>
                <span class="recurso__valor ${valorClass}">
                    ${
                        (clave === "agua" || clave === "electricidad")
                            ? `${Math.round(prod)} / ${Math.round(cons)}`
                            : fmt(valor)
                    }
                </span>

                ${!esFelicidad ? `
                <div class="tooltip">

                    <div class="tooltip-prod">
                        Producción: +${Math.round(prod)}
                    </div>

                    <div class="tooltip-sub">
                        Industrial: +${Math.round(prodData.produccion?.porEdificio?.industrial?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Comercial: +${Math.round(prodData.produccion?.porEdificio?.comercial?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Servicio: +${Math.round(prodData.produccion?.porEdificio?.servicio?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Residencial: +${Math.round(prodData.produccion?.porEdificio?.residencial?.[clave] ?? 0)}
                    </div>

                    <div class="tooltip-cons">
                        Consumo: ${Math.round(cons)}
                    </div>

                    <div class="tooltip-sub">
                        Industrial: ${Math.round(prodData.consumo?.porEdificio?.industrial?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Comercial: ${Math.round(prodData.consumo?.porEdificio?.comercial?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Servicio: ${Math.round(prodData.consumo?.porEdificio?.servicio?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Residencial: ${Math.round(prodData.consumo?.porEdificio?.residencial?.[clave] ?? 0)}
                    </div>
                    <div class="tooltip-sub">
                        Ciudadanos: ${Math.round(prodData.consumo?.porCiudadano?.[clave] ?? 0)}
                    </div>

                    <div class="tooltip-neto">
                        Neto: ${Math.round(neto)}
                    </div>

                </div>
                ` : ""}
            </div>
        `;
    }).join("");

    panel.innerHTML += `<button class="abrirModalRecursos">Menú recursos</button>`;
}

/* =========================================
   HOVER TÁCTIL (igual al de tu sidebar)
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

            tooltip.style.left = finalLeft + "px";
            tooltip.style.top = top + "px";
        });

        elemento.addEventListener("touchend", () => {
            elemento.classList.remove("hover-activo");
        });
    });
}

document.addEventListener("recursosModificados", llamarRecursos);

window.RecursosTablet = { inicializar };