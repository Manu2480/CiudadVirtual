/* tablero.js
Lógica principal del tablero, compartida por todas las vistas.

Responsabilidades:
  - Cargar la ciudad desde CiudadStorage al arrancar
  - Gestionar el estado global (modo, turno, pausa)
  - Guardar la partida
  - Exponer funciones que usan los controles de cada vista
*/

const Estado = {
    ciudad:              null,
    filas:               null,   /* se asigna al cargar la ciudad */
    columnas:            null,   /* se asigna al cargar la ciudad */
    modo:                "normal",   /* "normal" | "construccion" | "demolicion" */
    edificioSeleccionado: null,
    pausado:             false,
};

document.addEventListener("DOMContentLoaded", () => {
    _cargarCiudad();
    _actualizarNombre();

    if (!Estado.ciudad) {
        console.error("tablero.js: no se pudo cargar la ciudad.");
        return;
    }

    Mapa.inicializar(Estado.filas, Estado.columnas, Estado.ciudad.terreno.edificios);
    Recursos.inicializar();
    Notificaciones.mostrar(`¡Bienvenido, ${Estado.ciudad.alcalde}! Tu ciudad te espera.`, "exito");
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

        const terreno = new Terreno(vias, datos.terreno?.edificios ?? []);

        const estadoRecursos = datos.estadoRecursos ?? {
            dinero: 10000, agua: 0, electricidad: 0, alimento: 0, felicidad: 50,
        };

        Estado.ciudad = new Ciudad(
            datos.nombre    || "Mi Ciudad",
            datos.alcalde   || "Alcalde",
            datos.latitud   ?? 0,
            datos.longitud  ?? 0,
            datos.tiempoTurno ?? 30000,
            terreno,
            [],
            estadoRecursos
        );

        if (datos.genero) Estado.ciudad.genero = datos.genero;
        if (Array.isArray(datos.ciudadanos)) {
            datos.ciudadanos.forEach(c => Estado.ciudad.crearCiudadano(c));
        }

        const _vias    = Estado.ciudad.terreno.vias;
        Estado.filas    = _vias?.length        || 15;
        Estado.columnas = _vias?.[0]?.length  || 15;
        console.log(`tablero.js: mapa ${Estado.filas}x${Estado.columnas}`);

        Recursos.setCiudad(Estado.ciudad);
        console.log("tablero.js: ciudad cargada.");

    } catch (e) {
        console.error("tablero.js: error al cargar:", e);
    }
}

function _actualizarNombre() {
    const el = document.getElementById("nombre-ciudad");
    if (el && Estado.ciudad) el.textContent = Estado.ciudad.nombre;
}

function guardarPartida() {
    try {
        if (!Estado.ciudad) return;
        CiudadStorage.guardar(Estado.ciudad);
        Notificaciones.mostrar("Partida guardada.", "exito");
    } catch (e) {
        Notificaciones.mostrar("Error al guardar.", "error");
    }
}

function exportarJSON() {
    if (!Estado.ciudad) return;
    const nombre = Estado.ciudad.nombre.replace(/\s+/g, "_");
    const blob   = new Blob([JSON.stringify(Estado.ciudad, null, 2)], { type: "application/json" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `${nombre}.json`; a.click();
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
        return;
    }
    Notificaciones.mostrar(`Turno ${Estado.ciudad.tiempoTurno} completado.`, "aviso");
    guardarPartida();
}

window.Tablero = { Estado, guardarPartida, exportarJSON, activarModo, cancelarModo, seleccionarEdificio, togglePausa, avanzarTurno };