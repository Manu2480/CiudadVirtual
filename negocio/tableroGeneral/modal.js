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
    _overlay.classList.remove("activo", "modal-sin-cerrar");
    _overlay.setAttribute("aria-hidden", "true");
    _cuerpo.innerHTML = "";
}

function mostrarEdificio(edificio, fila, col) {
    const reembolso = Math.round(edificio.costo * 0.5);

    const instancia = Tablero.Estado.ciudad?.terreno?.ubicacionInfraestructura(fila, col);
    const ocupados  = instancia?.ciudadanos?.length ?? 0;
    const afectados = ocupados > 0;

    const capacidadResidencial = edificio.capacidad?.getCapacidad?.("residente") ?? 0;
    const capacidadLaboral = edificio.capacidad?.getCapacidad?.("empleado") ?? 0;

    const esResidencial = capacidadResidencial > 0;
    const esComercial   = capacidadLaboral > 0;
    const capacidad = capacidadResidencial + capacidadLaboral;

    // Felicidad promedio de los residentes por edificio residencial casa/apartamento
    let felicidadPromedioHtml = "";
    if (esResidencial && ocupados > 0) {
        const totalFelicidad = instancia.ciudadanos.reduce((sum, c) => sum + (c.ciudadano?.felicidad ?? 0), 0);
        const promedio = Math.round(totalFelicidad / ocupados);
        const icono = promedio >= 70 ? "fi-br-smile-beam" 
                    : promedio >= 40 ? "fi-br-meh-rolling-eyes" 
                    : "fi-br-sad-tear";
        const felicidadClase = promedio >= 70 ? "modal-edificio__felicidad--alta"
                            : promedio >= 40 ? "modal-edificio__felicidad--media"
                            : "modal-edificio__felicidad--baja";
        felicidadPromedioHtml = `
            <li>
                <i class="fi ${icono} modal-edificio__felicidad-icono ${felicidadClase}"></i>
                Felicidad promedio residentes: 
                <strong class="modal-edificio__felicidad-valor ${felicidadClase}">${promedio}/100</strong>
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
                ${edificio.mantenimiento ? `<li><i class="fi fi-br-coins"></i> Mantenimiento: <strong class="modal-edificio__stat-negativo">-$${edificio.mantenimiento.toLocaleString()}/turno</strong></li>` : ""}
                ${ocupacionHtml}
                ${felicidadPromedioHtml}
                ${edificio.empleos      ? `<li><i class="fi fi-br-briefcase"></i> Empleos: <strong>${edificio.empleos}</strong></li>` : ""}
                ${edificio.felicidad    ? `<li><i class="fi fi-br-smile-beam"></i> Felicidad: <strong>${edificio.felicidad > 0 ? "+" : ""}${edificio.felicidad}</strong></li>` : ""}
                ${edificio.electricidad !== undefined ? `<li><i class="fi fi-br-bolt"></i> Electricidad: <strong>${edificio.electricidad > 0 ? "+" : ""}${edificio.electricidad} kW</strong></li>` : ""}
                ${edificio.agua         !== undefined ? `<li><i class="fi fi-br-raindrops"></i> Agua: <strong>${edificio.agua > 0 ? "+" : ""}${edificio.agua} L</strong></li>` : ""}
                ${edificio.dinero       ? `<li><i class="fi fi-br-coins"></i> Ingresos: <strong class="modal-edificio__stat-positivo">+$${edificio.dinero.toLocaleString()}/turno</strong></li>` : ""}
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

/*Confirmación para demoler*/
function _mostrarConfirmacionDemoler(fila, col, edificio, instancia) {
    const reembolso = Math.round(edificio.costo * 0.5);
    const ocupados  = instancia?.ciudadanos?.length ?? 0;
    const capacidadResidencial = edificio.capacidad?.getCapacidad?.("residente") ?? 0;
    const capacidadLaboral = edificio.capacidad?.getCapacidad?.("empleado") ?? 0;

    const esResidencial = capacidadResidencial > 0;
    const esComercial   = capacidadLaboral > 0;

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
window.Modal = { abrir, cerrar, mostrarEdificio, mostrarConfirmacionDemoler: _mostrarConfirmacionDemoler };