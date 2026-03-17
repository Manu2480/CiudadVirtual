/* ================================================
MODAL.JS
Controlador del modal genérico compartido por todas las vistas.

El ancho del modal varía según la vista (definido en cada CSS):
  - Móvil:   80% de la pantalla   (HU-022)
  - Tablet:  60% de la pantalla   (HU-023)
  - Desktop: 50% max-width        (HU-024)

Responsabilidades:
  - Abrir/cerrar el modal
  - Mostrar información de un edificio
  - Mostrar estadísticas detalladas
  - Gestionar foco y accesibilidad (aria)
================================================ */


/* 
REFERENCIAS AL DOM
*/
let _overlay    = null;
let _contenido  = null;
let _cuerpo     = null;
let _btnCerrar  = null;


/* 
INICIALIZACIÓN AUTOMÁTICA
 */
document.addEventListener("DOMContentLoaded", () => {
    _overlay   = document.getElementById("modal-overlay");
    _contenido = document.getElementById("modal-contenido");
    _cuerpo    = document.getElementById("modal-cuerpo");
    _btnCerrar = document.getElementById("modal-cerrar");

    if (!_overlay) {
        console.error("modal.js: no se encontró #modal-overlay en el DOM.");
        return;
    }

    /* Cerrar al hacer click en el overlay oscuro (fuera de la tarjeta) */
    _overlay.addEventListener("click", (e) => {
        if (e.target === _overlay) cerrar();
    });

    /* Cerrar con el botón X */
    _btnCerrar.addEventListener("click", cerrar);

    /* Cerrar con Escape (también lo captura controles-desktop.js) */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && _overlay.classList.contains("activo")) cerrar();
    });
});


/* 
ABRIR MODAL
Muestra el overlay con el contenido HTML dado.
 */
function abrir(htmlContenido) {
    if (!_overlay) return;
    _cuerpo.innerHTML = htmlContenido;
    _overlay.classList.add("activo");
    _overlay.setAttribute("aria-hidden", "false");

    /* Mueve el foco al botón cerrar para accesibilidad */
    _btnCerrar.focus();
}


/*
CERRAR MODAL
 */
function cerrar() {
    if (!_overlay) return;
    /* Mueve el foco fuera del modal antes de ocultarlo
       para evitar el warning de aria-hidden en elemento enfocado */
    document.activeElement?.blur();
    _overlay.classList.remove("activo");
    _overlay.setAttribute("aria-hidden", "true");
    _cuerpo.innerHTML = "";
}


/* 
MOSTRAR INFO DE EDIFICIO
Genera el HTML con los datos del edificio y abre el modal.
Llamado desde mapa.js al hacer tap/click en un edificio.
 */
function mostrarEdificio(edificio, fila, col) {
    /* Calcula el reembolso del 50% para mostrarlo antes de demoler */
    const reembolso = Math.round(edificio.costo * 0.5);

    const html = `
        <div class="modal-edificio">

            <img src="${edificio.imagen}"
                 alt="${edificio.nombre}"
                 class="modal-edificio__imagen">

            <h2 class="modal-edificio__nombre">${edificio.nombre}</h2>

            <p class="modal-edificio__descripcion">${edificio.descripcion || ""}</p>

            <ul class="modal-edificio__stats">
                ${edificio.costo        ? `<li><i class="fi fi-br-coins"></i> Costo original: <strong>$${edificio.costo.toLocaleString()}</strong></li>` : ""}
                ${edificio.capacidad    ? `<li><i class="fi fi-br-users"></i> Capacidad: <strong>+${edificio.capacidad} hab</strong></li>` : ""}
                ${edificio.empleos      ? `<li><i class="fi fi-br-handshake"></i> Empleos: <strong>+${edificio.empleos}</strong></li>` : ""}
                ${edificio.felicidad    ? `<li><i class="fi fi-br-smile"></i> Felicidad: <strong>${edificio.felicidad > 0 ? "+" : ""}${edificio.felicidad}</strong></li>` : ""}
                ${edificio.electricidad !== undefined ? `<li><i class="fi fi-br-bolt"></i> Electricidad: <strong>${edificio.electricidad > 0 ? "+" : ""}${edificio.electricidad} kW</strong></li>` : ""}
                ${edificio.agua         !== undefined ? `<li><i class="fi fi-br-raindrops"></i> Agua: <strong>${edificio.agua > 0 ? "+" : ""}${edificio.agua} L</strong></li>` : ""}
                ${edificio.dinero       ? `<li><i class="fi fi-br-coins"></i> Ingresos: <strong>+$${edificio.dinero.toLocaleString()}/turno</strong></li>` : ""}
                ${edificio.alimento     ? `<li><i class="fi fi-br-wheat"></i> Alimento: <strong>+${edificio.alimento} kg</strong></li>` : ""}
            </ul>

            <div class="modal-edificio__demoler-info">
                <i class="fi fi-br-info"></i>
                Demoler reembolsa el 50% del costo original:
                <strong>$${reembolso.toLocaleString()}</strong>
            </div>

            <button class="modal-edificio__demoler btn-peligro"
                    id="btn-demoler-modal">
                <i class="fi fi-br-trash"></i> Demoler ($${reembolso.toLocaleString()} de reembolso)
            </button>

        </div>
    `;

    abrir(html);

    /* Registrar el listener después de insertar el HTML en el DOM */
    document.getElementById("btn-demoler-modal")?.addEventListener("click", () => {
        const grid   = Mapa.getGrid();
        const gridEl = document.getElementById("mapa-grid");
        Edificaciones.demoler(fila, col, grid, gridEl);
        Modal.cerrar();
        /* No cancelamos el modo — el usuario se queda en construccion
           para poder seguir editando el mapa sin ir a mapa y volver */
    });
}


/*
MOSTRAR ESTADÍSTICAS
Genera el HTML con la puntuación y desglose completo.
Llamado desde el botón flotante (móvil) o panel (desktop).
 */
function mostrarEstadisticas() {
    const ciudad    = Tablero.Estado.ciudad;
    const resultado = Puntuacion.calcular(ciudad);
    const d  = resultado.desglose;
    const b  = resultado.bonificaciones;
    const p  = resultado.penalizaciones;
    const m  = resultado.meta;

    function fila(icono, label, valor, color) {
        const c = color || (valor >= 0 ? "var(--color-dinero)" : "var(--color-energia)");
        return `<li>
            <i class="fi ${icono}"></i>
            <span>${label}</span>
            <strong style="color:${c}">${valor > 0 ? "+" : ""}${valor.toLocaleString()}</strong>
        </li>`;
    }

    const html = `
        <div class="modal-stats">
            <h2><i class="fi fi-br-chart-histogram"></i> ${ciudad?.nombre || "Mi Ciudad"}</h2>

            <div class="modal-stats__score">
                <span class="modal-stats__score-label">Puntuación total</span>
                <span class="modal-stats__score-valor">${resultado.total.toLocaleString()}</span>
            </div>

            <p class="modal-stats__seccion">Puntos base</p>
            <ul class="modal-stats__lista">
                ${fila("fi-br-users",     `Población (${m.poblacion} hab × 10)`,          d.ptsPoblacion,    "var(--color-primario)")}
                ${fila("fi-br-smile",     `Felicidad (${Math.round(m.felicidad)} × 5)`,    d.ptsFelicidad,    "var(--color-primario)")}
                ${fila("fi-br-coins",     `Dinero ($${m.dinero.toLocaleString()} ÷ 100)`,  d.ptsDinero,       "var(--color-primario)")}
                ${fila("fi-br-home",      `Edificios (${m.numEdificios} × 50)`,            d.ptsEdificios,    "var(--color-primario)")}
                ${fila("fi-br-bolt",      `Electricidad (${m.electricidad} kW × 2)`,       d.ptsElectricidad, "var(--color-primario)")}
                ${fila("fi-br-raindrops", `Agua (${m.agua} L × 2)`,                        d.ptsAgua,         "var(--color-primario)")}
            </ul>

            <p class="modal-stats__seccion modal-stats__seccion--bono">Bonificaciones</p>
            <ul class="modal-stats__lista">
                ${b.todosEmpleados   ? fila("fi-br-briefcase", "Todos empleados",       b.todosEmpleados)   : ""}
                ${b.felicidadAlta    ? fila("fi-br-smile",     "Felicidad > 80",        b.felicidadAlta)    : ""}
                ${b.recursosPositivos? fila("fi-br-leaf",      "Recursos positivos",    b.recursosPositivos): ""}
                ${b.granCiudad       ? fila("fi-br-city",      "Ciudad > 1000 hab",     b.granCiudad)       : ""}
                ${b.total === 0      ? `<li style="color:var(--color-texto-s)"><i class="fi fi-br-info"></i> <span>Sin bonificaciones aún</span></li>` : ""}
            </ul>

            <p class="modal-stats__seccion modal-stats__seccion--pena">Penalizaciones</p>
            <ul class="modal-stats__lista">
                ${p.dineroNeg        ? fila("fi-br-coins",     "Dinero negativo",        p.dineroNeg)        : ""}
                ${p.electricidadNeg  ? fila("fi-br-bolt",      "Electricidad negativa",  p.electricidadNeg)  : ""}
                ${p.aguaNeg          ? fila("fi-br-raindrops", "Agua negativa",          p.aguaNeg)          : ""}
                ${p.felicidadBaja    ? fila("fi-br-sad",       "Felicidad < 40",         p.felicidadBaja)    : ""}
                ${p.desempleados     ? fila("fi-br-user-minus",`${m.desempleados} desempleados × -10`, p.desempleados) : ""}
                ${p.total === 0      ? `<li style="color:var(--color-texto-s)"><i class="fi fi-br-check"></i> <span>Sin penalizaciones</span></li>` : ""}
            </ul>
        </div>
    `;

    abrir(html);
}


/* 
EXPOSICIÓN GLOBAL
 */
window.Modal = {
    abrir,
    cerrar,
    mostrarEdificio,
    mostrarEstadisticas,
};