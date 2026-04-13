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

    /* 2. Para vías: crear instancia directamente sin validación previa
       (las vías no necesitan vía adyacente para construirse).
       Para edificios: validar primero con objeto temporal para no
       incrementar el contador si Terreno rechaza la construcción. */
    let instancia;

    if (edificioDef.categoria === "pavimentaria") {
        /* Vía: crear e insertar directamente */
        instancia = _crearInstancia(idEdificio, fila, col, edificioDef);
        const resultado = ciudad.terreno.crearInfraestructura(fila, col, instancia);
        if (!resultado.exito) {
            Notificaciones.mostrar(resultado.mensaje, "error");
            return;
        }
    } else {
        /* Edificio: validar primero con temporal, luego crear instancia real */
        const temporal = {
            id: idEdificio,
            costo: edificioDef.costo,
            ubicacion: { fila, columna: col },
            ciudadanos: [],
            recursosEdificio: {}
        };
        const validacion = ciudad.terreno.crearInfraestructura(fila, col, temporal);
        if (!validacion.exito) {
            Notificaciones.mostrar(validacion.mensaje, "error");
            return;
        }
        /* Reemplaza el temporal por la instancia real con id único */
        ciudad.terreno.edificios = ciudad.terreno.edificios.filter(e => e !== temporal);
        instancia = _crearInstancia(idEdificio, fila, col, edificioDef);
        ciudad.terreno.edificios.push(instancia);
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

    Notificaciones.mostrar(_mensajeConstruccion(edificioDef), "exito");
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
    celdaEl.title = Edificios.tooltip ? Edificios.tooltip(edificioDef) : edificioDef.nombre;
}

function _pintarCeldaVacia(fila, col, gridEl) {
    const celdaEl = gridEl.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    if (!celdaEl) return;
    celdaEl.innerHTML = "";
    celdaEl.classList.remove("celda--construida");
    celdaEl.setAttribute("aria-label", "Celda vacía");
    celdaEl.removeAttribute("title");
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

    /* Vía: sincroniza el contador con las vías ya existentes en Terreno
       antes de crear una nueva, evitando ids duplicados tras recargar. */
    if (edificioDef.categoria === "pavimentaria") {
        const ciudad = window.Tablero?.Estado?.ciudad;
        if (ciudad) {
            ciudad.terreno.edificios.forEach(ed => {
                const match = String(ed.id || "").match(/^via(\d+)$/i);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > Via.contador) Via.contador = n;
                }
            });
        }
        return new Via(ubicacion);
    }

    /* Edificio: instancia de la clase concreta correspondiente.
       Cada clase tiene constructor(ubicacion) y contador estático
       igual que Via — sincronizamos el contador antes de crear. */
    /* Mapa: id del catálogo → { Clase, prefijo del id generado por el constructor }
       El prefijo permite sincronizar el contador buscando ids existentes en Terreno. */
    const _mapa = {
        "casa":              { Clase: typeof Casa             !== "undefined" ? Casa             : null, prefijo: "casa"           },
        "apartamento":       { Clase: typeof Apartamento      !== "undefined" ? Apartamento      : null, prefijo: "apartamento"    },
        "tienda":            { Clase: typeof Tienda           !== "undefined" ? Tienda           : null, prefijo: "tienda"         },
        "centro-comercial":  { Clase: typeof CentroComercial  !== "undefined" ? CentroComercial  : null, prefijo: "centroComercial"},
        "fabrica":           { Clase: typeof Fabrica          !== "undefined" ? Fabrica          : null, prefijo: "Fabrica"        },
        "granja":            { Clase: typeof Granja           !== "undefined" ? Granja           : null, prefijo: "Granja"         },
        "hospital":          { Clase: typeof Hospital         !== "undefined" ? Hospital         : null, prefijo: "Hospital"       },
        "bombero":           { Clase: typeof EstacionBombero  !== "undefined" ? EstacionBombero  : null, prefijo: "Bombero"        },
        "policia":           { Clase: typeof EstacionPolicia  !== "undefined" ? EstacionPolicia  : null, prefijo: "Policia"        },
        "parque":            { Clase: typeof Parque           !== "undefined" ? Parque           : null, prefijo: "Parque"         },
        "planta-electrica":  { Clase: typeof PlantaElectrica  !== "undefined" ? PlantaElectrica  : null, prefijo: "Luz"            },
        "planta-hidraulica": { Clase: typeof PlantaHidraulica !== "undefined" ? PlantaHidraulica : null, prefijo: "Agua"           },
    };

    const entrada = _mapa[idEdificio];
    const Clase   = entrada?.Clase;

    if (Clase) {
        /* Sincroniza el contador buscando ids existentes con el prefijo correcto */
        const ciudad = window.Tablero?.Estado?.ciudad;
        if (ciudad) {
            const regex = new RegExp(`^${entrada.prefijo}(\\d+)$`);
            ciudad.terreno.edificios.forEach(ed => {
                const match = String(ed.id || "").match(regex);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > Clase.contador) Clase.contador = n;
                }
            });
        }
        return new Clase(ubicacion);
    }

    /* Fallback: objeto plano si la clase no está disponible */
    console.warn(`edificaciones.js: clase no encontrada para "${idEdificio}", usando objeto plano.`);
    const instancia = Object.create(Edificio.prototype);
    Object.assign(instancia, {
        id:        idEdificio,
        costo:     edificioDef.costo,
        ubicacion,
        capacidad: new CapacidadNula(),
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
window.Edificaciones = { 
    construir, 
    demoler, 
    _crearInstancia,   /* expuesta para rehidratación desde tablero.js */
    seleccionarEdificio: (id) => { 
        if (window.Tablero && typeof window.Tablero.seleccionarEdificio === "function") {
            window.Tablero.seleccionarEdificio(id);
        } else {
            console.warn("Tablero.seleccionarEdificio no disponible");
        }
    }
};

/* ================================================
MENSAJE DE CONSTRUCCIÓN CON BENEFICIOS
Arma un string legible con los efectos del edificio
para mostrarlo en la notificación de éxito.
================================================ */
function _mensajeConstruccion(def) {
    const partes = [];

    if (def.capacidad?.residencial)    partes.push(`+${def.capacidad.residencial} habitantes`);
    if (def.capacidad?.laboral)      partes.push(`+${def.capacidad.laboral} empleos`);
    if (def.dinero)       partes.push(`+$${def.dinero.toLocaleString()}/turno`);
    if (def.alimento)     partes.push(`+${def.alimento} alimento/turno`);
    if (def.felicidad)    partes.push(`+${def.felicidad} felicidad`);

    if (def.electricidad) {
        partes.push(def.electricidad > 0
            ? `+${def.electricidad} energía`
            : `${def.electricidad} energía`);
    }
    if (def.agua) {
        partes.push(def.agua > 0
            ? `+${def.agua} agua`
            : `${def.agua} agua`);
    }

    const beneficios = partes.length > 0
        ? ` — ${partes.join(" · ")}`
        : "";

    return `${def.nombre} construido.${beneficios}`;
}