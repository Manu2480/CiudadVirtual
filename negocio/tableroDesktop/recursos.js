/* ================================================
   RECURSOS DESKTOP
   Módulo responsable de mostrar recursos en
   la vista desktop (dinero, agua, electricidad,
   alimento, felicidad).
================================================ */

function inicializar() {
    llamarRecursos();
}

function llamarRecursos() {
    if (!window.Tablero?.Estado?.ciudad) return;

    const ciudad = window.Tablero.Estado.ciudad;
    const panel = document.getElementById("panel-recursos-side");
    if (!panel) return;

    panel.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Recursos</h2></div>`;
    const contenido = document.createElement("div");
    contenido.className = "recursos-lista";

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
        felicidad:    "",
    };

    contenido.innerHTML = Object.entries(_iconos).map(([key, icono]) => {
        const valor = ciudad.getRecurso(key);
        const unidad = _unidades[key];
        //producción data
        const prodData = ciudad.calcularProduccionNeta?.() ?? {};
        const prod = prodData.produccion?.total?.[key] ?? 0;
        const cons = prodData.consumo?.total?.[key] ?? 0;
        const neto = prodData?.neto?.[key] ?? 0;

        let formatted;

        if (key === "agua" || key === "electricidad") {
            formatted = `${Math.round(prod)} / ${Math.round(cons)}`;
        } else if (key === "dinero") {
            formatted = `${unidad}${Math.round(valor).toLocaleString()}`;
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
    panel.appendChild(contenido);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
document.addEventListener("recursosModificados", llamarRecursos);

window.RecursosDesktop = { inicializar };

