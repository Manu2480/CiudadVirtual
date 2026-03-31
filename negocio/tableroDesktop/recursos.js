/* ================================================
   RECURSOS DESKTOP
   Módulo responsable de mostrar recursos en
   la vista desktop (dinero, agua, electricidad,
   alimento, felicidad).
================================================ */

function inicializar() {
    setInterval(() => {
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

            const formatted = key === "dinero"
                ? `${unidad}${Math.round(valor).toLocaleString()}`
                : key === "felicidad"
                ? `${Math.round(valor)}${unidad}%`
                : `${Math.round(valor)}${unidad}`;

            // Determinar clase CSS según estado del recurso
            let claseColor = "";
            if (key === "dinero") {
                if (valor > 10000) claseColor = "recurso-item__valor--dinero-alto";
                else if (valor < 1000) claseColor = "recurso-item__valor--dinero-bajo";
                else if (valor < 5000) claseColor = "recurso-item__valor--dinero-medio";
            } else if (valor < 0) {
                claseColor = "recurso-item__valor--negativo";
            }

            //producción data
            const prodData = ciudad.calcularProduccionNeta?.() ?? {};
            const prod = prodData.produccion?.[key] ?? 0;
            const cons = prodData.consumo?.[key] ?? 0;
            const neto = prodData.neto?.[key] ?? 0;

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
                        <div class="tooltip-prod">Producción: +${Math.round(prod)}</div>
                        <div class="tooltip-cons">Consumo: ${Math.round(cons)}</div>
                        <div class="tooltip-neto">Neto: ${Math.round(neto)}</div>
                    </div>
                    ` : ""}
                </div>
            `;
        }).join("");
        contenido.innerHTML += `<button class="abrirModalRecursos" onclick="ModalRecursos.mostrar()">Menú recursos</button>`;
        panel.appendChild(contenido);
    }, 500);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.RecursosDesktop = { inicializar };