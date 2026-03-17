/* ================================================
   ESTADÍSTICAS DESKTOP
   Módulo responsable de mostrar estadísticas en
   la vista desktop (población, dinero, felicidad,
   energía, turno).
================================================ */

function inicializar() {
    loop(); /*Loop de inyeccion de estadisticas*/
}

function loop() {
    if (!window.Tablero?.Estado?.ciudad) {
        requestAnimationFrame(loop); /*Si no hay ciudad, reintentar loop en el siguiente frame */
        return;
    }
    ejecutar();

    const tiempo = window.Tablero.Estado.ciudad.tiempoTurno || 500;

    setTimeout(loop, tiempo);
    /*Una vez termina el loop, se hace un timeout que dura lo mismo que la duración del turno */
}

function ejecutar(){
    if (!window.Tablero?.Estado?.ciudad) return;
        const ciudad = window.Tablero.Estado.ciudad;
        const panel = document.getElementById("panel-estadisticas-tablet");
        if (!panel) return;

        panel.innerHTML = `<h2 class="panel__titulo">Estadísticas</h2>`;
        const contenido = document.createElement("div");
        contenido.className = "listado-estadisticas";
        contenido.innerHTML = `
            <div class="stats-item">
                <span class="stats-item__label">Población:</span>
                <span class="stats-item__valor">${ciudad.ciudadanos.length}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Capacidad de empleo:</span>
                <span class="stats-item__valor">${ciudad.terreno.capacidadTotalEmpleos() ?? "desconocida"}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Capacidad de vivienda:</span>
                <span class="stats-item__valor">${ciudad.terreno.capacidadTotalViviendas() ?? "desconocida"}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Turno: </span>
                <span class="stats-item__valor">${window.Tablero.Estado.turno ?? "desconocido"}</span>
            </div>
            <div class="stats-item">
                <span class="stats-item__label">Puntaje:</span>
                <span class="stats-item__valor">${window.Puntuacion.calcular(ciudad).total ?? "desconocido"}</span>
            </div>
            <button id="abrir-puntaje-tablet" onClick = "window.Modal?.mostrarEstadisticas()">Ver puntaje</button>
        `;
        panel.appendChild(contenido);
}

/* ================================================
   EXPOSICIÓN GLOBAL
================================================ */
window.EstadisticasTablet = { inicializar };