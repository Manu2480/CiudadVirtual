/* ================================================
EDIFICACIONES.JS
Lógica de negocio para construir y demoler edificios.

Responsabilidades:
  - Validar si hay recursos suficientes para construir
  - Actualizar el estado del grid al construir o demoler
  - Actualizar el DOM de la celda afectada
  - Notificar el resultado al usuario

Dependencias: edificios.js, recursos.js, notificaciones.js
================================================ */


/* ================================================
CONSTRUIR EDIFICIO
Coloca un edificio en la celda indicada. Valida recursos,
actualiza el grid interno y refleja el cambio en el DOM.

  grid    — referencia al array bidimensional del mapa
  gridEl  — referencia al <div id="mapa-grid">
================================================ */
function construir(fila, col, idEdificio, grid, gridEl) {
    const edificio = Edificios.obtener(idEdificio);
    if (!edificio) return;

    /* Verifica recursos */
    if (!Recursos.puedeConstructir(edificio)) {
        Notificaciones.mostrar(`No tienes suficiente dinero para construir ${edificio.nombre}.`, "error");
        return;
    }

    /* Actualiza el grid interno */
    grid[fila][col] = { tipo: idEdificio };

    /* Actualiza el DOM */
    const celdaEl = gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (celdaEl) {
        celdaEl.innerHTML = "";
        celdaEl.classList.add("celda--construida");
        celdaEl.classList.remove("celda--seleccionada");

        const img = document.createElement("img");
        img.src   = edificio.imagen;
        img.alt   = edificio.nombre;
        img.classList.add("celda__edificio");
        celdaEl.appendChild(img);
        celdaEl.setAttribute("aria-label", edificio.nombre);
    }

    /* Descuenta recursos */
    Recursos.cobrarConstruccion(edificio);

    Notificaciones.mostrar(`${edificio.nombre} construido.`, "exito");
}


/* ================================================
DEMOLER EDIFICIO
Elimina el edificio de la celda y la restaura como vacía.

  grid    — referencia al array bidimensional del mapa
  gridEl  — referencia al <div id="mapa-grid">
================================================ */
function demoler(fila, col, grid, gridEl) {
    const tipo     = grid[fila]?.[col]?.tipo || "vacio";
    const edificio = Edificios.obtener(tipo);

    /* Actualiza el grid interno */
    grid[fila][col] = { tipo: "vacio" };

    /* Actualiza el DOM */
    const celdaEl = gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (celdaEl) {
        celdaEl.innerHTML = "";
        celdaEl.classList.remove("celda--construida");
        celdaEl.setAttribute("aria-label", "Celda vacía");
    }

    Notificaciones.mostrar(
        edificio ? `${edificio.nombre} demolido.` : "Edificio demolido.",
        "aviso"
    );
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Edificaciones = {
    construir,
    demoler,
};