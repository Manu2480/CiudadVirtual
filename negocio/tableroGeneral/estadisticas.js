/* ================================================
   ESTADÍSTICA
   Módulo responsable de mostrar estadísticas en
   las tres vistas
================================================ */
let vista;

function inicializar() {
    const ciudad = window.Tablero?.Estado?.ciudad;
    const btnEstadisticasCelular = document.getElementById("btn-stats-flotante");
    if (!ciudad || !btnEstadisticasCelular) {
        setTimeout(inicializar, 30);
        return;
    }
    vista = document.documentElement.getAttribute("data-vista");
    actualizarPaneles();
    document.addEventListener("turno:ejecutado",actualizarPaneles);
    document.addEventListener("recursosModificados",actualizarPaneles);

    btnEstadisticasCelular.addEventListener("click", () => {
        abrirModal(htmlEstadisticas());
    });
}
document.addEventListener("click", e => {
    const target = e.target.closest(".btn-detalle-edificios");
    if (target) {
        Modal.cerrar();
        htmlEdificios();
        document.getElementById("btn-volver-stats")?.addEventListener("click", ()=>{
            Modal.cerrar();
            abrirModal(htmlEstadisticas());
        });
    }
});
function actualizarPaneles(){
    vista = document.documentElement.getAttribute("data-vista");
    let paneles = [];
    if (vista == "desktop"){
        paneles.push(document.getElementById("panel-estadisticas"));  
    }
    if (vista == "tablet"){
        paneles.push(document.getElementById("panel-estadisticas-tablet-horizontal"));
        paneles.push(document.getElementById("panel-estadisticas-tablet-vertical"));
    }
    paneles.forEach((panel)=>{
        if (vista=="desktop"){
            panel.innerHTML = htmlEstadisticas();
        }
        else if (vista == "tablet"){
            panel.innerHTML = htmlEncabezado();
            panel.addEventListener("click",() => abrirModal(htmlEstadisticas()));
        }
    });
}

function abrirModal(html){
    Modal.abrir(html);
}
function htmlEncabezado(){
    const ciudad    = Tablero.Estado.ciudad;
    const resultado = Puntuacion.calcular(ciudad);
    return `<div class="modal-stats__score">
                <span class="modal-stats__score-label">Puntuación total</span>
                <span class="modal-stats__score-valor">${resultado.total.toLocaleString()}</span>
            </div>
            <div class="modal-stats__turno">
                <span class="modal-stats__turno-label">Turno Actual: </span>
                <span class="modal-stats__turno-valor">${Tablero.Estado.turno || 0}</span>
            </div>`
}

function htmlEstadisticas() {
    const ciudad    = Tablero.Estado.ciudad;
    const resultado = Puntuacion.calcular(ciudad);
    const d = resultado.desglose;
    const b = resultado.bonificaciones;
    const p = resultado.penalizaciones;
    const m = resultado.meta;

    const fila = (icono, label, valor, color) => {
        const claseValor = color
            ? color === "var(--color-primario)" ? "modal-stats__valor--primario"
              : color === "var(--color-energia)" ? "modal-stats__valor--negativo"
              : color === "var(--color-dinero)" ? "modal-stats__valor--positivo"
              : "modal-stats__valor--neutro"
            : valor >= 0 ? "modal-stats__valor--positivo" : "modal-stats__valor--negativo";
        return `<li>
            <i class="fi ${icono}"></i>
            <span>${label}</span>
            <strong class="${claseValor}">${valor > 0 ? "+" : ""}${valor.toLocaleString()}</strong>
        </li>`;
    };

    /* Calcular ciudadanos sin vivienda/empleo */
    const sinVivienda = ciudad.ciudadanos.filter(c => !c.vivienda).length;
    const sinEmpleo   = ciudad.ciudadanos.filter(c => !c.empleo).length;

    const html = `
        <div class="modal-stats">
            <h2><i class="fi fi-br-chart-histogram"></i> ${ciudad?.nombre || "Mi Ciudad"}</h2>
            ${htmlEncabezado()}
            <p class="modal-stats__seccion">Puntos base</p>
            <ul class="modal-stats__lista">
                ${fila("fi-br-users",     `Población (${m.poblacion} hab × 10)`,         d.ptsPoblacion,    "var(--color-primario)")}
                ${fila("fi-br-smile-beam",     `Felicidad (${Math.round(m.felicidad)} × 5)`,   d.ptsFelicidad,    "var(--color-primario)")}
                ${fila("fi-br-coins",     `Dinero ($${m.dinero.toLocaleString()} ÷ 100)`, d.ptsDinero,       "var(--color-primario)")}
                <li class="modal-stats__fila-clicable btn-detalle-edificios" id="btn-detalle-edificios">
                    <i class="fi fi-br-home"></i>
                    <span>Edificios (${m.numEdificios} × 50) <small class="modal-stats__detalle">— ver detalle</small></span>
                    <strong class="modal-stats__valor--primario">+${d.ptsEdificios.toLocaleString()}</strong>
                </li>
                ${fila("fi-br-bolt",      `Electricidad (${m.electricidad} kW × 2)`,      d.ptsElectricidad, "var(--color-primario)")}
                ${fila("fi-br-raindrops", `Agua (${m.agua} L × 2)`,                       d.ptsAgua,         "var(--color-primario)")}
            </ul>

            <p class="modal-stats__seccion">Ciudadanos</p>
            <ul class="modal-stats__lista">
                ${fila("fi-br-users", "Población total", ciudad.ciudadanos.length, "var(--color-primario)")}
                ${sinVivienda > 0
                    ? fila("fi-br-home", "Sin vivienda", -sinVivienda, "var(--color-energia)")
                    : fila("fi-br-home", "Todos con vivienda", 0, "var(--color-dinero)")}
                ${sinEmpleo > 0
                    ? fila("fi-br-briefcase", "Sin empleo", -sinEmpleo, "var(--color-energia)")
                    : fila("fi-br-briefcase", "Todos empleados", 0, "var(--color-dinero)")}
            </ul>

            <p class="modal-stats__seccion modal-stats__seccion--bono">Bonificaciones</p>
            <ul class="modal-stats__lista">
                ${b.todosEmpleados    ? fila("fi-br-briefcase", "Todos empleados",        b.todosEmpleados)    : ""}
                ${b.felicidadAlta     ? fila("fi-br-smile-beam",     "Felicidad > 80",         b.felicidadAlta)     : ""}
                ${b.recursosPositivos ? fila("fi-br-leaf",      "Recursos positivos",     b.recursosPositivos) : ""}
                ${b.granCiudad        ? fila("fi-br-home",      "Ciudad > 1000 hab",      b.granCiudad)        : ""}
                ${b.total === 0 ? `<li class="modal-stats__sin-items"><i class="fi fi-br-info"></i> <span>Sin bonificaciones aún</span></li>` : ""}
            </ul>

            <p class="modal-stats__seccion modal-stats__seccion--pena">Penalizaciones</p>
            <ul class="modal-stats__lista">
                ${p.dineroNeg       ? fila("fi-br-coins",      "Dinero negativo",       p.dineroNeg)       : ""}
                ${p.electricidadNeg ? fila("fi-br-bolt",       "Electricidad negativa", p.electricidadNeg) : ""}
                ${p.aguaNeg         ? fila("fi-br-raindrops",  "Agua negativa",         p.aguaNeg)         : ""}
                ${p.felicidadBaja   ? fila("fi-br-sad-tear",        "Felicidad < 40",        p.felicidadBaja)   : ""}
                ${p.desempleados    ? fila("fi-br-user-slash", `${m.desempleados} desempleados × -10`, p.desempleados) : ""}
                ${p.total === 0 ? `<li class="modal-stats__sin-items"><i class="fi fi-br-check"></i> <span>Sin penalizaciones</span></li>` : ""}
            </ul>
        </div>
    `;
    return(html);
}

function htmlEdificios() {
    const ciudad   = Tablero.Estado.ciudad;
    const edificios = ciudad?.terreno?.edificios || [];

    /* Agrupar por categoría y luego por nombre */
    const grupos = {};

    /* Mapa de ids de clase → id del catálogo */
    const idMap = {
        "fabrica":          "fabrica",
        "granja":           "granja",
        "agua":             "planta-hidraulica",
        "luz":              "planta-electrica",
        "hospital":         "hospital",
        "bombero":          "bombero",
        "policia":          "policia",
        "parque":           "parque",
        "centrocomercial":  "centro-comercial",
        "tienda":           "tienda",
        "casa":             "casa",
        "apartamento":      "apartamento",
        "via":              "via",
    };

    edificios.forEach(e => {
        if (String(e.id || "").toLowerCase().startsWith("via")) return;
        const idBase    = e.id.replace(/\d+$/, "").toLowerCase();
        const idCatalog = idMap[idBase] || idBase;
        const def       = Edificios.todos().find(x => x.id === idCatalog);
        if (!def) return;
        const cat    = def.categoria || "otros";
        const nombre = def.nombre    || idBase;
        if (!grupos[cat]) grupos[cat] = {};
        grupos[cat][nombre] = (grupos[cat][nombre] || 0) + 1;
    });

    const iconoCategoria = {
        residencial:     "fi-br-home",
        comercial:       "fi-br-shop",
        industrial:      "fi-br-industry-windows",
        servicios:       "fi-br-heart",
        infraestructura: "fi-br-bolt",
        pavimentaria:    "fi-br-road",
    };

    const colorCategoria = {
        residencial:     "#1565c0",
        comercial:       "#f57f17",
        industrial:      "#880e4f",
        servicios:       "#2e7d32",
        infraestructura: "#6a1b9a",
        pavimentaria:    "#37474f",
    };

    let seccionesHtml = "";
    let totalGeneral  = 0;

    Object.entries(grupos).forEach(([cat, tipos]) => {
        const subtotal = Object.values(tipos).reduce((a, b) => a + b, 0);
        totalGeneral  += subtotal;
        const icono    = iconoCategoria[cat] || "fi-br-building";
        const color    = colorCategoria[cat] || "var(--color-texto)";

        const filasHtml = Object.entries(tipos)
            .sort((a, b) => b[1] - a[1])
            .map(([nombre, cant]) => `
                <li class="modal-edificios__fila-tipo">
                    <span class="modal-edificios__tipo-nombre">${nombre}</span>
                    <strong class="modal-edificios__tipo-cant">${cant}</strong>
                </li>`)
            .join("");

        seccionesHtml += `
            <div class="modal-edificios__categoria modal-edificios__categoria--${cat}">
                <div class="modal-edificios__cat-header">
                    <i class="fi ${icono} modal-edificios__cat-icono"></i>
                    <span class="modal-edificios__cat-nombre">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <strong class="modal-edificios__cat-total">${subtotal}</strong>
                </div>
                <ul class="modal-edificios__lista-tipos">${filasHtml}</ul>
            </div>`;
    });

    const html = `
        <div class="modal-edificios">
            <h2><i class="fi fi-br-home"></i> Desglose de edificios</h2>
            <div class="modal-edificios__total">
                Total: <strong>${totalGeneral} edificios</strong>
            </div>
            ${seccionesHtml}

            ${(vista == "movil" || vista == "tablet")?`<button class="btn-secundario modal-edificios__volver" id="btn-volver-stats">
                <i class="fi fi-br-angle-left"></i> Volver a estadísticas
            </button>` : " "}
        </div>
    `;
    abrirModal(html);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.EstadisticasDesktop = { inicializar };
window.EstadisticasTablet = { inicializar };
window.StatsMovil = { inicializar };