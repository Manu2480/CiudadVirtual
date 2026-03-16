/* ================================================
   ESTADÍSTICAS DESKTOP
   Módulo responsable de mostrar estadísticas en
   la vista desktop (población, dinero, felicidad,
   energía, turno).
================================================ */

function inicializar() {
    const interval = setInterval(() => {
        if (!window.Tablero?.Estado?.ciudad) return;

        const ciudad = window.Tablero.Estado.ciudad;
        const panel = document.getElementById("panel-estadisticas");
        if (!panel) return;

        panel.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Estadisticas</h2></div>`;
        const contenido = document.createElement("div");
        contenido.className = "stats-lista";
        contenido.innerHTML = `
            <div class="stats-item">
                <span class="stats-item__label">Población</span>
                <span class="stats-item__valor">${ciudad.ciudadanos.length}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Dinero</span>
                <span class="stats-item__valor">$${ciudad.getRecurso('dinero').toLocaleString()}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Felicidad</span>
                <span class="stats-item__valor">${Math.round(ciudad.getRecurso('felicidad'))}%</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Energía</span>
                <span class="stats-item__valor">${ciudad.getRecurso('electricidad')}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Turno</span>
                <span class="stats-item__valor">${window.Tablero.Estado.turno || 1}</span>
            </div>
        `;

        panel.appendChild(contenido);

        clearInterval(interval);
    }, 500);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.EstadisticasDesktop = { inicializar };
