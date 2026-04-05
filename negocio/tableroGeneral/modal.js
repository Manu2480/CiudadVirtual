/* ================================================
MODAL.JS
Controlador del modal genérico compartido por todas las vistas.
================================================ */

let _overlay = null, _contenido = null, _cuerpo = null, _btnCerrar = null;

document.addEventListener("DOMContentLoaded", () => {
    _overlay   = document.getElementById("modal-overlay");
    _contenido = document.getElementById("modal-contenido");
    _cuerpo    = document.getElementById("modal-cuerpo");
    _btnCerrar = document.getElementById("modal-cerrar");
    if (!_overlay) { console.error("modal.js: no se encontró #modal-overlay"); return; }
    _overlay.addEventListener("click", (e) => { if (e.target === _overlay) cerrar(); });
    _btnCerrar.addEventListener("click", cerrar);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && _overlay.classList.contains("activo")) cerrar();
    });

    /* Refrescar estadísticas automáticamente si el modal está abierto.
       Pequeño delay para que Ciudad.js termine de actualizar los arrays
       de ciudadanos antes de leer los datos. */
    document.addEventListener("turno:ejecutado", () => {
        if (_overlay?.classList.contains("activo") && _cuerpo?.querySelector(".modal-stats")) {
            setTimeout(mostrarEstadisticas, 50);
        }
    });
});

function abrir(htmlContenido) {
    if (!_overlay) return;
    _cuerpo.innerHTML = htmlContenido;
    _overlay.classList.add("activo");
    _overlay.setAttribute("aria-hidden", "false");
    _btnCerrar.focus();
}

function cerrar() {
    if (!_overlay) return;
    document.activeElement?.blur();
    _overlay.classList.remove("activo");
    _overlay.setAttribute("aria-hidden", "true");
    _cuerpo.innerHTML = "";
}

function mostrarEdificio(edificio, fila, col) {
    const reembolso = Math.round(edificio.costo * 0.5);

    const instancia = Tablero.Estado.ciudad?.terreno?.ubicacionInfraestructura(fila, col);
    const ocupados  = instancia?.ciudadanos?.length ?? 0;
    const capacidad = instancia?.capacidad ?? 0;
    const afectados = ocupados > 0;

    const esResidencial = edificio.capacidad && !edificio.empleos;
    const esComercial   = edificio.empleos;

    // Felicidad promedio de los residentes por edificio residencial casa/apartamento
    let felicidadPromedioHtml = "";
    if (esResidencial && ocupados > 0) {
        const totalFelicidad = instancia.ciudadanos.reduce((sum, c) => sum + (c.felicidad ?? 0), 0);
        const promedio = Math.round(totalFelicidad / ocupados);
        const color = promedio >= 70 ? "var(--color-dinero)"
                    : promedio >= 40 ? "var(--color-aviso, orange)"
                    : "var(--color-energia)";
        const icono = promedio >= 70 ? "fi-br-smile-beam" 
                    : promedio >= 40 ? "fi-br-meh-rolling-eyes" 
                    : "fi-br-sad-tear";
        felicidadPromedioHtml = `
            <li>
                <i class="fi ${icono}" style="color:${color}"></i>
                Felicidad promedio residentes: 
                <strong style="color:${color}">${promedio}/100</strong>
            </li>`;
    }

    const ocupacionHtml = capacidad > 0 ? `
        <li>
            <i class="fi fi-br-users"></i>
            Ocupación: <strong>${ocupados} / ${capacidad}</strong>
            ${afectados ? `<span class="modal-edificio__ocupacion-badge">${ocupados} afectado${ocupados > 1 ? "s" : ""}</span>` : ""}
        </li>` : "";

    const advertencia = afectados ? `
        <div class="modal-edificio__advertencia">
            <i class="fi fi-br-triangle-warning"></i>
            ${esResidencial ? `${ocupados} ciudadano${ocupados > 1 ? "s" : ""} perder${ocupados > 1 ? "án" : "á"} su vivienda.` : ""}
            ${esComercial   ? `${ocupados} ciudadano${ocupados > 1 ? "s" : ""} perder${ocupados > 1 ? "án" : "á"} su empleo.` : ""}
        </div>` : "";

    const html = `
        <div class="modal-edificio">
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="modal-edificio__imagen">
            <h2 class="modal-edificio__nombre">${edificio.nombre}</h2>
            <p class="modal-edificio__descripcion">${edificio.descripcion || ""}</p>
            <ul class="modal-edificio__stats">
                ${edificio.costo        ? `<li><i class="fi fi-br-coins"></i> Costo original: <strong>$${edificio.costo.toLocaleString()}</strong></li>` : ""}
                ${ocupacionHtml}
                ${felicidadPromedioHtml}
                ${edificio.empleos      ? `<li><i class="fi fi-br-briefcase"></i> Empleos: <strong>${edificio.empleos}</strong></li>` : ""}
                ${edificio.felicidad    ? `<li><i class="fi fi-br-smile-beam"></i> Felicidad: <strong>${edificio.felicidad > 0 ? "+" : ""}${edificio.felicidad}</strong></li>` : ""}
                ${edificio.electricidad !== undefined ? `<li><i class="fi fi-br-bolt"></i> Electricidad: <strong>${edificio.electricidad > 0 ? "+" : ""}${edificio.electricidad} kW</strong></li>` : ""}
                ${edificio.agua         !== undefined ? `<li><i class="fi fi-br-raindrops"></i> Agua: <strong>${edificio.agua > 0 ? "+" : ""}${edificio.agua} L</strong></li>` : ""}
                ${edificio.dinero       ? `<li><i class="fi fi-br-coins"></i> Ingresos: <strong>+$${edificio.dinero.toLocaleString()}/turno</strong></li>` : ""}
                ${edificio.alimento     ? `<li><i class="fi fi-br-wheat"></i> Alimento: <strong>+${edificio.alimento} kg</strong></li>` : ""}
            </ul>
            ${advertencia}
            <div class="modal-edificio__demoler-info">
                <i class="fi fi-br-info"></i>
                Demoler reembolsa el 50% del costo original:
                <strong>$${reembolso.toLocaleString()}</strong>
            </div>
            <button class="modal-edificio__demoler btn-peligro" id="btn-demoler-modal">
                <i class="fi fi-br-trash"></i> Demoler ($${reembolso.toLocaleString()} de reembolso)
            </button>
        </div>
    `;

    abrir(html);

    document.getElementById("btn-demoler-modal")?.addEventListener("click", () => {
        _mostrarConfirmacionDemoler(fila, col, edificio, instancia);
    });
}

function mostrarEstadisticas() {
    const ciudad    = Tablero.Estado.ciudad;
    const resultado = Puntuacion.calcular(ciudad);
    const d = resultado.desglose;
    const b = resultado.bonificaciones;
    const p = resultado.penalizaciones;
    const m = resultado.meta;

    const fila = (icono, label, valor, color) => {
        const c = color || (valor >= 0 ? "var(--color-dinero)" : "var(--color-energia)");
        return `<li>
            <i class="fi ${icono}"></i>
            <span>${label}</span>
            <strong style="color:${c}">${valor > 0 ? "+" : ""}${valor.toLocaleString()}</strong>
        </li>`;
    };

    /* Calcular ciudadanos sin vivienda/empleo */
    const sinVivienda = ciudad.ciudadanos.filter(c => !c.vivienda).length;
    const sinEmpleo   = ciudad.ciudadanos.filter(c => !c.empleo).length;

    const html = `
        <div class="modal-stats">
            <h2><i class="fi fi-br-chart-histogram"></i> ${ciudad?.nombre || "Mi Ciudad"}</h2>
            <div class="modal-stats__score">
                <span class="modal-stats__score-label">Puntuación total</span>
                <span class="modal-stats__score-valor">${resultado.total.toLocaleString()}</span>
            </div>
            <div class="modal-stats__turno">
                <span class="modal-stats__turno-label">Turno Actual: </span>
                <span class="modal-stats__turno-valor">${Tablero.Estado.turno || 0}</span>
            </div>
            <p class="modal-stats__seccion">Puntos base</p>
            <ul class="modal-stats__lista">
                ${fila("fi-br-users",     `Población (${m.poblacion} hab × 10)`,         d.ptsPoblacion,    "var(--color-primario)")}
                ${fila("fi-br-smile-beam",     `Felicidad (${Math.round(m.felicidad)} × 5)`,   d.ptsFelicidad,    "var(--color-primario)")}
                ${fila("fi-br-coins",     `Dinero ($${m.dinero.toLocaleString()} ÷ 100)`, d.ptsDinero,       "var(--color-primario)")}
                <li class="modal-stats__fila-clicable" id="btn-detalle-edificios">
                    <i class="fi fi-br-home"></i>
                    <span>Edificios (${m.numEdificios} × 50) <small style="color:var(--color-texto-s)">— ver detalle</small></span>
                    <strong style="color:var(--color-primario)">+${d.ptsEdificios.toLocaleString()}</strong>
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
                ${b.total === 0 ? `<li style="color:var(--color-texto-s)"><i class="fi fi-br-info"></i> <span>Sin bonificaciones aún</span></li>` : ""}
            </ul>

            <p class="modal-stats__seccion modal-stats__seccion--pena">Penalizaciones</p>
            <ul class="modal-stats__lista">
                ${p.dineroNeg       ? fila("fi-br-coins",      "Dinero negativo",       p.dineroNeg)       : ""}
                ${p.electricidadNeg ? fila("fi-br-bolt",       "Electricidad negativa", p.electricidadNeg) : ""}
                ${p.aguaNeg         ? fila("fi-br-raindrops",  "Agua negativa",         p.aguaNeg)         : ""}
                ${p.felicidadBaja   ? fila("fi-br-sad-tear",        "Felicidad < 40",        p.felicidadBaja)   : ""}
                ${p.desempleados    ? fila("fi-br-user-slash", `${m.desempleados} desempleados × -10`, p.desempleados) : ""}
                ${p.total === 0 ? `<li style="color:var(--color-texto-s)"><i class="fi fi-br-check"></i> <span>Sin penalizaciones</span></li>` : ""}
            </ul>
        </div>
    `;

    abrir(html);
    document.getElementById("btn-detalle-edificios")?.addEventListener("click", mostrarDetalleEdificios);
}

/*Confirmación para demoler*/
function _mostrarConfirmacionDemoler(fila, col, edificio, instancia) {
    const reembolso = Math.round(edificio.costo * 0.5);
    const ocupados  = instancia?.ciudadanos?.length ?? 0;
    const esResidencial = edificio.capacidad && !edificio.empleos;
    const esComercial   = edificio.empleos;

    // Calcular afectaciones
    const afectaciones = [];
    if (ocupados > 0) {
        if (esResidencial) afectaciones.push(`
            <li><i class="fi fi-br-house-chimney"></i> 
                <strong>${ocupados}</strong> ciudadano${ocupados > 1 ? "s" : ""} 
                perder${ocupados > 1 ? "án" : "á"} su vivienda
            </li>`);
        if (esComercial) afectaciones.push(`
            <li><i class="fi fi-br-briefcase"></i> 
                <strong>${ocupados}</strong> ciudadano${ocupados > 1 ? "s" : ""} 
                perder${ocupados > 1 ? "án" : "á"} su empleo
            </li>`);
    }
    if (edificio.electricidad < 0) afectaciones.push(`
        <li><i class="fi fi-br-bolt"></i> 
            Se liberan <strong>${Math.abs(edificio.electricidad)} kW</strong> de consumo
        </li>`);
    if (edificio.agua < 0) afectaciones.push(`
        <li><i class="fi fi-br-raindrops"></i> 
            Se liberan <strong>${Math.abs(edificio.agua)} L</strong> de consumo de agua
        </li>`);
    if (edificio.dinero) afectaciones.push(`
        <li><i class="fi fi-br-coins"></i> 
            Se pierden <strong>$${edificio.dinero.toLocaleString()}/turno</strong> de ingresos
        </li>`);
    if (edificio.alimento) afectaciones.push(`
        <li><i class="fi fi-br-wheat"></i> 
            Se pierden <strong>${edificio.alimento} kg</strong> de alimento/turno
        </li>`);
    if (edificio.felicidad) afectaciones.push(`
        <li><i class="fi fi-br-smile-beam"></i> 
            Se pierden <strong>${edificio.felicidad} puntos</strong> de felicidad
        </li>`);

    const afectacionesHtml = afectaciones.length > 0
        ? `<ul class="modal-demoler__afectaciones">${afectaciones.join("")}</ul>`
        : `<p class="modal-demoler__sin-afectaciones">No hay ciudadanos afectados.</p>`;

    const html = `
        <div class="modal-demoler">
            <div class="modal-demoler__advertencia-header">
                <i class="fi fi-br-triangle-warning"></i>
                <h2>¿Demoler ${edificio.nombre}?</h2>
            </div>
            <p class="modal-demoler__subtitulo">Esta acción no se puede deshacer. Consecuencias:</p>
            ${afectacionesHtml}
            <div class="modal-demoler__reembolso">
                <i class="fi fi-br-coins"></i>
                Reembolso: <strong>$${reembolso.toLocaleString()}</strong>
            </div>
            <div class="modal-demoler__acciones">
                <button class="btn-secundario" id="btn-cancelar-demoler">
                    <i class="fi fi-br-cross"></i> Cancelar
                </button>
                <button class="btn-peligro" id="btn-confirmar-demoler">
                    <i class="fi fi-br-trash"></i> Sí, demoler
                </button>
            </div>
        </div>
    `;

    abrir(html);

    document.getElementById("btn-cancelar-demoler")?.addEventListener("click", cerrar);
    document.getElementById("btn-confirmar-demoler")?.addEventListener("click", () => {
        Edificaciones.demoler(fila, col, Mapa.getGrid(), document.getElementById("mapa-grid"));
        cerrar();
    });
}

function mostrarDetalleEdificios() {
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
            <div class="modal-edificios__categoria">
                <div class="modal-edificios__cat-header">
                    <i class="fi ${icono}" style="color:${color}"></i>
                    <span class="modal-edificios__cat-nombre" style="color:${color}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
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
            <button class="btn-secundario modal-edificios__volver" id="btn-volver-stats">
                <i class="fi fi-br-angle-left"></i> Volver a estadísticas
            </button>
        </div>
    `;

    abrir(html);
    document.getElementById("btn-volver-stats")?.addEventListener("click", mostrarEstadisticas);
}

window.Modal = { abrir, cerrar, mostrarEdificio, mostrarEstadisticas, mostrarDetalleEdificios, mostrarConfirmacionDemoler: _mostrarConfirmacionDemoler };