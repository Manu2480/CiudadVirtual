/* tablero.js  (negocio/tableroGeneral/tablero.js)
Lógica principal del tablero, compartida por todas las vistas.

Responsabilidades:
  - Cargar la ciudad desde CiudadStorage al arrancar
  - Gestionar el estado global (modo, turno, pausa)
  - Guardar la partida
  - Exponer funciones que usan los controles de cada vista
*/

const Estado = {
    ciudad:               null,
    filas:                null,   /* se asigna al cargar la ciudad */
    columnas:             null,   /* se asigna al cargar la ciudad */
    modo:                 "normal",   /* "normal" | "construccion" | "demolicion" */
    edificioSeleccionado: null,
    pausado:              false,
    turno:                0,      /* contador de turnos */
    intervaloTurnos:      null,   /* ID del interval para el ciclo automático */
};

document.addEventListener("DOMContentLoaded", () => {
    _cargarCiudad();
    _actualizarNombre();

    if (!Estado.ciudad) {
        console.error("tablero.js: no se pudo cargar la ciudad.");
        return;
    }

    Mapa.inicializar(Estado.filas, Estado.columnas, Estado.ciudad.terreno.edificios, Estado.ciudad.terreno.vias);
    Recursos.inicializar();
    Notificaciones.mostrar(`¡Bienvenido, ${Estado.ciudad.alcalde}! Tu ciudad te espera.`, "exito");

    /* Señal para controlesDesktop.js: tablero ya está listo. */
    window.__tableroListo = true;
    if (window.ControlesDesktop?.init) {
        window.ControlesDesktop.init();
    }

    /* Inicializar módulos generales que no dependen de la vista */
    if (window.TurnosControl) {
        TurnosControl.inicializar();
    }
});

function _cargarCiudad() {
    try {
        const raw = CiudadStorage.cargar();
        if (!raw) { console.warn("tablero.js: no hay partida guardada."); return; }

        const datos = JSON.parse(raw);

        const filasRaw = datos.terreno?.vias;
        const vias = (Array.isArray(filasRaw) && filasRaw.length > 0)
            ? filasRaw
            : Array.from({ length: 15 }, () => Array(15).fill(0));

        const terreno = new Terreno(vias, []);

        /* Rehidratar edificios usando Edificaciones._crearInstancia —
           el mismo mecanismo que usa construir() para crear instancias reales.
           Necesario para que instanceof EdificioResidencial etc. funcione
           al ejecutar turnos (viviendasDisponibles, empleosDisponibles). */
        (datos.terreno?.edificios ?? []).forEach(ed => {
            if (!ed?.ubicacion) return;
            const idCatalogo = _normalizarIdEdificio(ed.id);
            const def        = Edificios.obtener(idCatalogo);
            if (!def) { console.warn("tablero.js: sin definición para", ed.id); return; }
            const instancia  = Edificaciones._crearInstancia
                ? Edificaciones._crearInstancia(idCatalogo, ed.ubicacion.fila, ed.ubicacion.columna, def)
                : null;
            if (!instancia) return;
            /* Restaurar estado guardado */
            if (Array.isArray(ed.ciudadanos))  instancia.ciudadanos       = ed.ciudadanos;
            if (ed.recursosEdificio)           instancia.recursosEdificio = ed.recursosEdificio;
            terreno.edificios.push(instancia);
            /* Marcar vía en la matriz si corresponde */
            if (def.categoria === "pavimentaria") {
                terreno.vias[ed.ubicacion.fila][ed.ubicacion.columna] = 1;
            }
        });

        const estadoRecursos = datos.estadoRecursos ?? {
            dinero: 50000, agua: 0, electricidad: 0, alimento: 0, felicidad: 0,
        };

        Estado.ciudad = new Ciudad(
            datos.nombre      || "Mi Ciudad",
            datos.alcalde     || "Alcalde",
            datos.latitud     ?? 0,
            datos.longitud    ?? 0,
            datos.tiempoTurno ?? 30000,
            terreno,
            [],
            estadoRecursos
        );

        if (datos.genero) Estado.ciudad.genero = datos.genero;
        if (Array.isArray(datos.ciudadanos)) {
            datos.ciudadanos.forEach(c => Estado.ciudad.crearCiudadano(c));
        }

        const _vias      = Estado.ciudad.terreno.vias;
        Estado.filas     = _vias?.length       || 15;
        Estado.columnas  = _vias?.[0]?.length  || 15;
        Estado.turno     = datos.turno ?? 0;   /* Restaurar contador de turnos */
        /* Restaurar fecha: si no existe en el JSON guardado, usar la fecha actual */
        Estado.ciudad.fecha = (typeof datos.fecha === "string" && datos.fecha.trim())
            ? datos.fecha
            : new Date().toISOString().split("T")[0];

        Recursos.setCiudad(Estado.ciudad);

    } catch (e) {
        console.error("tablero.js: error al cargar:", e);
    }
}

/* Traduce el id de instancia guardado (ej: "casa3") al id del catálogo (ej: "casa")
   usando el mismo mapa que mapa.js y ruta.js */
function _normalizarIdEdificio(id) {
    return Mapa.getGrid ? (() => {
        /* Reutilizar _normalizarId de mapa.js si está expuesto */
        if (window.Mapa?._normalizarId) return window.Mapa._normalizarId(id);
    })() || _normalizarIdLocal(id) : _normalizarIdLocal(id);
}

function _normalizarIdLocal(id) {
    const prefijos = {
        "via":             "via",
        "casa":            "casa",
        "apartamento":     "apartamento",
        "tienda":          "tienda",
        "centrocomercial": "centro-comercial",
        "fabrica":         "fabrica",
        "granja":          "granja",
        "hospital":        "hospital",
        "bombero":         "bombero",
        "policia":         "policia",
        "parque":          "parque",
        "luz":             "planta-electrica",
        "agua":            "planta-hidraulica",
    };
    const lower = (id || "").toLowerCase().replace(/\d+$/, "");
    return prefijos[lower] || id;
}

function _actualizarNombre() {
    const el = document.getElementById("nombre-ciudad");
    if (el && Estado.ciudad) el.textContent = Estado.ciudad.nombre;
}

function _iniciarCicloTurnos() {
    if (Estado.intervaloTurnos || !Estado.ciudad) return;

    Estado.intervaloTurnos = setInterval(() => {
        if (Estado.pausado || !Estado.ciudad) return;
        avanzarTurno();
    }, Estado.ciudad.tiempoTurno);

    console.log(`tablero.js: ciclos de turno iniciados cada ${Estado.ciudad.tiempoTurno / 1000}s`);
}

function _detenerCicloTurnos() {
    if (!Estado.intervaloTurnos) return;
    clearInterval(Estado.intervaloTurnos);
    Estado.intervaloTurnos = null;
    console.log("tablero.js: ciclos de turno detenidos");
}

function _reiniciarCicloTurnos() {
    _detenerCicloTurnos();
    _iniciarCicloTurnos();
}

function setDuracionTurno(segundos) {
    if (!Estado.ciudad) return;

    const ms = Math.max(1000, Number(segundos) * 1000);
    Estado.ciudad.modificarTiempoTurno(ms);
    _reiniciarCicloTurnos();
}

function guardarPartida() {
    try {
        if (!Estado.ciudad) return;
        /* Crear objeto para guardar que incluya turno */
        const datosCompletos = JSON.parse(JSON.stringify(Estado.ciudad));
        datosCompletos.turno = Estado.turno;
        datosCompletos.fecha = (typeof Estado.ciudad.fecha === "string" && Estado.ciudad.fecha.trim())
            ? Estado.ciudad.fecha
            : new Date().toISOString().split("T")[0];
        CiudadStorage.guardar(datosCompletos);

        /* Agregar ciudad actual al ranking permanente */
        if (typeof RankingStorage !== "undefined") {
            const resultado = Puntuacion.calcular(Estado.ciudad);
            Puntuacion.guardarEnRanking(Estado.ciudad, resultado.total, Estado.turno);
            console.log("tablero.js: Ciudad agregada al ranking permanente");
        }

        Notificaciones.mostrar("Partida guardada.", "exito");
    } catch (e) {
        Notificaciones.mostrar("Error al guardar.", "error");
    }
}

function exportarJSON() {
    if (!Estado.ciudad) return;
    const nombre = Estado.ciudad.nombre.replace(/\s+/g, "_");
    const fecha = new Date().toISOString().split("T")[0];
    const datosCompletos = JSON.parse(JSON.stringify(Estado.ciudad));
    datosCompletos.turno = Estado.turno;
    datosCompletos.fecha = fecha;
    const blob   = new Blob([JSON.stringify(datosCompletos, null, 2)], { type: "application/json" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `ciudad_${nombre}_${fecha}.json`; a.click();
    URL.revokeObjectURL(url);
}

function activarModo(modo) {
    Estado.modo = modo;
    document.body.classList.remove("modo-construccion", "modo-demolicion");
    if (modo === "construccion") document.body.classList.add("modo-construccion");
    if (modo === "demolicion")   document.body.classList.add("modo-demolicion");
    Mapa.actualizarModo(modo);
}

function cancelarModo() {
    Estado.edificioSeleccionado = null;
    activarModo("normal");
}

function seleccionarEdificio(id) {
    Estado.edificioSeleccionado = id;
    activarModo("construccion");
}

function togglePausa() {
    Estado.pausado = !Estado.pausado;
    Notificaciones.mostrar(Estado.pausado ? "Juego pausado." : "Juego reanudado.", "aviso");
}

function avanzarTurno() {
    if (Estado.pausado || !Estado.ciudad) return;
    Recursos.calcularTurno();
    if (!Estado.ciudad.pasarTurno()) {
        Notificaciones.mostrar("Game Over: recursos negativos.", "error");
        Estado.ciudad.detenerSimulacion();
        _detenerCicloTurnos();
        return;
    }
    /* Incrementar turno */
    Estado.turno++;
    
    /* Calcula y guarda puntuación del turno */
    const resultado = Puntuacion.calcular(Estado.ciudad);
    
    /* Actualizar ciudad actual en tiempo real */
    if (typeof RankingStorage !== "undefined") {
        RankingStorage.actualizarCiudadActual(Estado.ciudad, resultado.total, Estado.turno);
    } else {
        console.error("tablero.js: RankingStorage no está disponible!");
    }
    
    /* Guardar puntuación final al ranking */
    Puntuacion.guardarEnRanking(Estado.ciudad, resultado.total, Estado.turno);

    Notificaciones.mostrar(`Turno completado. Puntuación: ${resultado.total.toLocaleString()} pts.`, "aviso");
    guardarPartida();
}

window.Tablero = {
    Estado,
    guardarPartida,
    exportarJSON,
    activarModo,
    cancelarModo,
    seleccionarEdificio,
    togglePausa,
    avanzarTurno,
    setDuracionTurno,
};