/* ================================================
EDIFICACIONES.JS
Lógica de negocio para construir y demoler edificios.

Responsabilidades:
  - Validar vía adyacente antes de construir
  - Validar y descontar dinero al construir
  - Registrar el edificio en Terreno
  - Reembolsar el 50% al demoler
  - Actualizar el DOM de la celda afectada
  - Persistir el estado en CiudadStorage tras cada acción

Dependencias: edificios.js, tablero.js, notificaciones.js,
              CiudadStorage.js, Ciudad.js, Terreno.js
================================================ */


/* ================================================
CONSTRUIR EDIFICIO
================================================ */
function construir(fila, col, idEdificio, grid, gridEl) {
    const ciudad   = window.Tablero?.Estado?.ciudad;
    const edificioDef = Edificios.obtener(idEdificio);
    if (!edificioDef || !ciudad) return;

    /* 1. Validar dinero */
    const dineroActual = ciudad.getRecurso("dinero");
    if (dineroActual < edificioDef.costo) {
        Notificaciones.mostrar(
            `Sin fondos. Necesitas $${edificioDef.costo.toLocaleString()} y tienes $${dineroActual.toLocaleString()}.`,
            "error"
        );
        return;
    }

    /* 2. Construir instancia del edificio con ubicación */
    const instancia = _crearInstancia(idEdificio, fila, col, edificioDef);

    /* 3. Delegar a Terreno (valida vía adyacente internamente) */
    const resultado = ciudad.terreno.crearInfraestructura(fila, col, instancia);

    if (!resultado.exito) {
        Notificaciones.mostrar(resultado.mensaje, "error");
        return;
    }

    /* 4. Descontar dinero */
    ciudad.modificarRecurso("dinero", -edificioDef.costo);

    /* 5. Actualizar grid interno y DOM.
       Para vías usamos siempre el id del catálogo ("via") en el grid,
       independiente del id único generado por el constructor (via1, via2…) */
    const tipoGrid = edificioDef.categoria === "pavimentaria" ? "via" : idEdificio;
    grid[fila][col] = { tipo: tipoGrid };
    _pintarCeldaConstruida(fila, col, edificioDef, gridEl);

    /* 6. Persistir */
    CiudadStorage.guardar(ciudad);

    Notificaciones.mostrar(`${edificioDef.nombre} construido.`, "exito");
}


/* ================================================
DEMOLER EDIFICIO
================================================ */
function demoler(fila, col, grid, gridEl) {
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad) return;

    /* 1. Delegar a Terreno (calcula reembolso y limpia listas de ciudadanos) */
    const resultado = ciudad.terreno.eliminarInfraestructura(fila, col);

    if (!resultado.exito) {
        Notificaciones.mostrar(resultado.mensaje, "error");
        return;
    }

    /* 2. Reembolsar dinero */
    ciudad.modificarRecurso("dinero", resultado.reembolso);

    /* 3. Actualizar grid interno y DOM */
    grid[fila][col] = { tipo: "vacio" };
    _pintarCeldaVacia(fila, col, gridEl);

    /* 4. Persistir */
    CiudadStorage.guardar(ciudad);

    Notificaciones.mostrar(
        `Demolido. Reembolso: $${resultado.reembolso.toLocaleString()}.`,
        "aviso"
    );
}


/* ================================================
HELPERS DOM
================================================ */
function _pintarCeldaConstruida(fila, col, edificioDef, gridEl) {
    const celdaEl = gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (!celdaEl) return;
    celdaEl.innerHTML = "";
    celdaEl.classList.add("celda--construida");
    celdaEl.classList.remove("celda--seleccionada");
    const img = document.createElement("img");
    img.src   = edificioDef.imagen;
    img.alt   = edificioDef.nombre;
    img.classList.add("celda__edificio");
    celdaEl.appendChild(img);
    celdaEl.setAttribute("aria-label", edificioDef.nombre);
}

function _pintarCeldaVacia(fila, col, gridEl) {
    const celdaEl = gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (!celdaEl) return;
    celdaEl.innerHTML = "";
    celdaEl.classList.remove("celda--construida");
    celdaEl.setAttribute("aria-label", "Celda vacía");
}


/* ================================================
CREAR INSTANCIA
Construye la instancia correcta según la categoría:

  - "pavimentaria" → new Via(ubicacion)
    Via genera su propio id con contador interno.
    Terreno usa instanceof Via para marcar vias[][]=1.

  - resto → Object.create(Edificio.prototype) + assign
    Pasa instanceof Edificio sin invocar el constructor
    abstracto. Terreno solo necesita .ubicacion, .costo,
    .ciudadanos y .recursosEdificio para funcionar.
================================================ */
function _crearInstancia(idEdificio, fila, col, edificioDef) {
    const ubicacion = { fila, columna: col };

    /* Vía: constructor real — genera id propio via1, via2… */
    if (edificioDef.categoria === "pavimentaria") {
        return new Via(ubicacion);
    }

    /* Edificio: instancia compatible sin invocar constructor abstracto */
    const instancia = Object.create(Edificio.prototype);
    Object.assign(instancia, {
        id:        idEdificio,
        costo:     edificioDef.costo,
        ubicacion,
        capacidad: edificioDef.capacidad || 0,
        ciudadanos: [],
        recursosEdificio: {
            dinero:       edificioDef.dinero       || 0,
            agua:         edificioDef.agua         || 0,
            electricidad: edificioDef.electricidad || 0,
            alimento:     edificioDef.alimento     || 0,
            felicidad:    edificioDef.felicidad     || 0,
        },
    });
    return instancia;
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Edificaciones = { construir, demoler };