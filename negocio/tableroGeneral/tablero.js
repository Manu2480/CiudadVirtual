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
const btnPausarGeneral = document.getElementById("btn-turnos-general-pausar");
const btnReanudarGeneral = document.getElementById("btn-turnos-general-reanudar");


btnPausarGeneral?.addEventListener("click", () => {
    if (!Estado.pausado) {
        togglePausa();
    }
});

btnReanudarGeneral?.addEventListener("click", () => {
    if (Estado.pausado) {
        togglePausa();
    }
});
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

    /* Iniciar automáticamente el ciclo de turnos al cargar la página */
    _iniciarCicloTurnos();
});


function _cargarCiudad() {
    try {
        const estadoCargado = ControladorStorage.cargarEstadoTablero();
        if (!estadoCargado) { console.warn("tablero.js: no hay partida guardada."); return; }

        Estado.ciudad   = estadoCargado.ciudad;
        Estado.filas    = estadoCargado.filas;
        Estado.columnas = estadoCargado.columnas;
        Estado.turno    = estadoCargado.turno;
        Recursos.setCiudad(Estado.ciudad);

    } catch (e) {
        console.error("tablero.js: error al cargar:", e);
    }
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

}

function _detenerCicloTurnos() {
    if (!Estado.intervaloTurnos) return;
    clearInterval(Estado.intervaloTurnos);
    Estado.intervaloTurnos = null;
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
        ControladorStorage.guardarEstadoTablero(Estado.ciudad, Estado.turno);

        /* Agregar ciudad actual al ranking permanente */
        if (typeof RankingStorage !== "undefined") {
            const resultado = Puntuacion.calcular(Estado.ciudad);
            Puntuacion.guardarEnRanking(Estado.ciudad, resultado.total, Estado.turno);
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
    let recursosEdificio = Edificios.todos();

    //Serializamos tambien el catalogo para los constructores
    const catalogoSerializado = recursosEdificio.map(e => ({
        id: e.id,
        catalogoInfo: e.clase.catalogoInfo
    }));
    datosCompletos.catalogo = catalogoSerializado;
    datosCompletos.ciudadanosPorTurno = Estado.ciudad.ciudadanosPorTurno;
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
        /* Mostramos el modal de Game Over */
        ModalGameOver.mostrar(); 
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