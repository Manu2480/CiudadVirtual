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
    const panelTabletVertical = document.getElementById("panel-recursos-tablet-vertical");
    const panelTabletHorizontal = document.getElementById("panel-recursos-tablet-horizontal");
    renderizarRecursos(recursos,panelTabletVertical);
    renderizarRecursos(recursos,panelTabletHorizontal);
    const botonesRecursos = document.querySelectorAll(".abrirModalRecursos");
    botonesRecursos.forEach((boton) => {
        boton.addEventListener("click",  ModalRecursos.mostrar);
    });
}
function renderizarRecursos(recursos,panel){

    if (!panel || !recursos){
        console.log("No se encontró el panel de recursos")
        return;
    }
    panel.innerHTML = "";
    panel.innerHTML= '<h2 class="panel__titulo">Recursos</h2>';

    const indicadores = [
        { clave: "dinero",       icono: "fi-br-coins",     label: "Dinero",       fmt: v => `$${Math.round(v).toLocaleString()}` },
        { clave: "agua",         icono: "fi-br-raindrops", label: "Agua",         fmt: v => `${Math.round(v)} L`  },
        { clave: "electricidad", icono: "fi-br-bolt",      label: "Electricidad", fmt: v => `${Math.round(v)} kW` },
        { clave: "alimento",     icono: "fi-br-wheat",     label: "Alimento",     fmt: v => `${Math.round(v)} kg` },
        { clave: "felicidad",    icono: "fi fi-br-smile-beam",     label: "Felicidad",    fmt: v => `${Math.round(v)}%`    },
    ];

    panel.innerHTML += indicadores.map(({ clave, icono, label, fmt }) => {
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
    panel.innerHTML += 
    `<button class="abrirModalRecursos">Menú recursos</button>`
}
document.addEventListener("recursosModificados",llamarRecursos);

window.RecursosTablet = {inicializar};
