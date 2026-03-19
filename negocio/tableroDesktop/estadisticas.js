/* ================================================
   ESTADÍSTICAS DESKTOP
   Módulo responsable de mostrar estadísticas en
   la vista desktop (población, dinero, felicidad,
   energía, turno).
================================================ */

function inicializar() {
    setInterval(() => {
        if (!window.Tablero?.Estado?.ciudad) return;

        const ciudad = window.Tablero.Estado.ciudad;
        const panel = document.getElementById("panel-estadisticas");
        if (!panel) return;

        // Calcular puntuación detallada
        const resultado = window.Puntuacion.calcular(ciudad);
        const d = resultado.desglose;
        const b = resultado.bonificaciones;
        const p = resultado.penalizaciones;
        const m = resultado.meta;

        // Función auxiliar para crear filas de estadísticas
        const fila = (icono, label, valor, color) => {
            const c = color || (valor >= 0 ? "var(--color-dinero)" : "var(--color-energia)");
            return `<div class="stats-item">
                <i class="fi ${icono}"></i>
                <span class="stats-item__label">${label}</span>
                <span class="stats-item__valor" style="color:${c}">${valor > 0 ? "+" : ""}${valor.toLocaleString()}</span>
            </div>`;
        };

        panel.innerHTML = `
                <div class="modulo-header">
                    <h2 class="panel__titulo">Estadísticas</h2>
                </div>
                <!-- Puntuación total -->
                <div class="stats-seccion-score">
                    <span class="stats__score-label">Puntuación total</span>
                    <span class="stats__score-valor">${resultado.total.toLocaleString()}</span>
                </div>

                <!-- Puntos base -->
                <div class="stats-seccion">
                    <h3 class="stats-seccion__titulo">Puntos Base</h3>
                    ${fila("fi-br-users",     `Población (${m.poblacion} hab × 10)`,         d.ptsPoblacion)}
                    ${fila("fi-br-smile",     `Felicidad (${Math.round(m.felicidad)} × 5)`,   d.ptsFelicidad)}
                    ${fila("fi-br-coins",     `Dinero ($${m.dinero.toLocaleString()} ÷ 100)`, d.ptsDinero)}
                    ${fila("fi-br-home",      `Edificios (${m.numEdificios} × 50)`,           d.ptsEdificios)}
                    ${fila("fi-br-bolt",      `Electricidad (${m.electricidad} kW × 2)`,      d.ptsElectricidad)}
                    ${fila("fi-br-raindrops", `Agua (${m.agua} L × 2)`,                       d.ptsAgua)}
                </div>

                <!-- Bonificaciones -->
                <div class="stats-seccion">
                    <h3 class="stats-seccion__titulo stats-seccion__titulo--bono">Bonificaciones</h3>
                    ${b.todosEmpleados    ? fila("fi-br-briefcase", "Todos empleados",        b.todosEmpleados)    : ""}
                    ${b.felicidadAlta     ? fila("fi-br-smile",     "Felicidad > 80",         b.felicidadAlta)     : ""}
                    ${b.recursosPositivos ? fila("fi-br-leaf",      "Recursos positivos",     b.recursosPositivos) : ""}
                    ${b.granCiudad        ? fila("fi-br-home",      "Ciudad > 1000 hab",      b.granCiudad)        : ""}
                    ${b.total === 0 ? `<div class="stats-item stats-item--empty">
                        <i class="fi fi-br-info"></i>
                        <span class="stats-item__label">Sin bonificaciones aún</span>
                    </div>` : ""}
                </div>

                <!-- Penalizaciones -->
                <div class="stats-seccion">
                    <h3 class="stats-seccion__titulo stats-seccion__titulo--pena">Penalizaciones</h3>
                    ${p.dineroNeg       ? fila("fi-br-coins",     "Dinero negativo",       p.dineroNeg)       : ""}
                    ${p.electricidadNeg ? fila("fi-br-bolt",      "Electricidad negativa", p.electricidadNeg) : ""}
                    ${p.aguaNeg         ? fila("fi-br-raindrops", "Agua negativa",         p.aguaNeg)         : ""}
                    ${p.felicidadBaja   ? fila("fi-br-sad",       "Felicidad < 40",        p.felicidadBaja)   : ""}
                    ${p.desempleados    ? fila("fi-br-user-slash", `${m.desempleados} desempleados × -10`, p.desempleados) : ""}
                    ${p.total === 0 ? `<div class="stats-item stats-item--empty">
                        <i class="fi fi-br-check"></i>
                        <span class="stats-item__label">Sin penalizaciones</span>
                    </div>` : ""}
                </div>
            </div>
        `;
    }, 500);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.EstadisticasDesktop = { inicializar };
