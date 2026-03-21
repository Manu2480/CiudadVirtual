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
            const color = valor < 0 ? "var(--color-energia)" : "var(--color-texto)";
            return `
                <div class="recurso-item">
                    <i class="fi ${icono} recurso-item__icono"></i>
                    <span class="recurso-item__label">${_nombres[key]}</span>
                    <span class="recurso-item__valor">${formatted}</span>
                </div>
            `;
        }).join("");
        panel.appendChild(contenido);
    }, 500);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.RecursosDesktop = { inicializar };