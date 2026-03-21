function inicializar(){
    renderizarRecursos();
}
function renderizarRecursos() {
    let recursos = {};
    try {
        const raw = CiudadStorage.cargar();
        if (raw) recursos = JSON.parse(raw)?.estadoRecursos ?? {};
    } catch (e) {
        recursos = window.Tablero?.Estado?.ciudad?.estadoRecursos ?? {};
    }
    const panelTablet = document.getElementById("panel-recursos-tablet")
    panelTablet.innerHTML = "";
    panelTablet.innerHTML= '<h2 class="panel__titulo">Recursos</h2>';
    if (!panelTablet || !recursos) return;

    const indicadores = [
        { clave: "dinero",       icono: "fi-br-coins",     label: "Dinero",       fmt: v => `$${Math.round(v).toLocaleString()}` },
        { clave: "agua",         icono: "fi-br-raindrops", label: "Agua",         fmt: v => `${Math.round(v)} L`  },
        { clave: "electricidad", icono: "fi-br-bolt",      label: "Electricidad", fmt: v => `${Math.round(v)} kW` },
        { clave: "alimento",     icono: "fi-br-wheat",     label: "Alimento",     fmt: v => `${Math.round(v)} kg` },
        { clave: "felicidad",    icono: "fi fi-br-smile-beam",     label: "Felicidad",    fmt: v => `${Math.round(v)}%`    },
    ];

    panelTablet.innerHTML += indicadores.map(({ clave, icono, label, fmt }) => {
        const valor = recursos[clave] ?? 0;
        const colorVal = valor < 0 ? "var(--color-energia)" : "inherit";
        return `
            <div class="recurso recurso--${clave}">
                <i class="fi ${icono} recurso__icono"></i>
                <span class="recurso__label">${label}:</span>
                <span class="recurso__valor" style="color:${colorVal}">
                    ${fmt(valor)}
                </span>
            </div>
        `;
    }).join("");
}

window.RecursosTablet = {inicializar, renderizarRecursos};
