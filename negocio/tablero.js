/* ================================================
TABLERO.JS
Lógica principal del tablero compartida por todas las vistas.

Responsabilidades:
  - Leer la configuración inicial desde localStorage (formulario)
  - Gestionar el estado del juego (turno, modo actual)
  - Guardar y cargar partidas (JSON)
  - Controlar el reloj/turno del juego
  - Poblar el clima según la ciudad colombiana elegida
  - Coordinar los módulos: mapa, recursos, modal, notificaciones
  - Exponer funciones globales que usan los controles de cada vista

Dependencias (deben cargarse antes en tablero.html):
  edificios.js, recursos.js, mapa.js, modal.js, notificaciones.js
================================================ */


/* ================================================
ESTADO GLOBAL DEL JUEGO
Objeto único que concentra todo el estado.
Cada módulo puede leer/escribir a través de las
funciones expuestas, nunca directamente.
================================================ */
const Estado = {

    /* Instancia activa de Ciudad (Ciudad.js).
       Es la única fuente de verdad para recursos, ciudadanos y terreno.
       Se asigna en cargarDesdeLocalStorage() y se pasa a Recursos.setCiudad(). */
    ciudad: null,

    /* Dimensiones del mapa — se leen desde ciudad.terreno o localStorage */
    filas:    15,
    columnas: 15,

    /* Modo de interacción actual */
    /* "normal" | "construccion" | "demolicion" */
    modo: "normal",

    /* Edificio seleccionado para construir (cuando modo === "construccion") */
    edificioSeleccionado: null,

    /* Indica si el juego está pausado */
    pausado: false,
};


/* ================================================
INICIALIZACIÓN
Se ejecuta cuando el DOM está listo.
Lee localStorage, configura el mapa y los paneles.
================================================ */
document.addEventListener("DOMContentLoaded", () => {
    cargarDesdeLocalStorage();
    inicializarUI();

    if (!Estado.ciudad) {
        console.error("tablero.js: no se pudo cargar la ciudad. Vuelve al formulario.");
        return;
    }

    Mapa.inicializar(Estado.filas, Estado.columnas, Estado.ciudad.terreno.edificios);
    Recursos.inicializar();
    Notificaciones.mostrar(`¡Bienvenido, ${Estado.ciudad.alcalde}! Tu ciudad te espera.`, "exito");
});


/* ================================================
CARGA DE CONFIGURACIÓN DESDE LOCALSTORAGE
formulario.js guarda los datos del jugador con la
clave "ciudadVirtual_config" al crear la ciudad.
================================================ */
function cargarDesdeLocalStorage() {
    try {
        /* Lee el JSON guardado por CiudadStorage (lo guarda formulario.js al fundar) */
        const rawPartida = CiudadStorage.cargar();
        if (!rawPartida) {
            console.warn("tablero.js: no se encontró partida guardada.");
            return;
        }

        const datos = JSON.parse(rawPartida);

        /* Reconstruye la matriz de vías desde el JSON.
           Si no existe (partida nueva del formulario) crea una vacía. */
        const filasRaw = datos.terreno?.vias;
        const vias = (Array.isArray(filasRaw) && filasRaw.length > 0)
            ? filasRaw
            : Array.from({ length: 15 }, () => Array(15).fill(0));

        /* Reconstruye el Terreno con las vías y los edificios del JSON.
           Los edificios se agregan como objetos planos por ahora;
           cada compañero puede extender esto cuando implemente su vista. */
        const terreno = new Terreno(vias, datos.terreno?.edificios ?? []);

        /* Reconstruye el estadoRecursos desde el JSON o usa valores iniciales */
        const estadoRecursos = datos.estadoRecursos ?? {
            dinero:       10000,
            agua:         0,
            electricidad: 0,
            alimento:     0,
            felicidad:    50,
        };

        /* Crea la instancia de Ciudad con los datos del JSON */
        Estado.ciudad = new Ciudad(
            datos.nombre       || "Mi Ciudad",
            datos.alcalde      || "Alcalde",
            datos.latitud      ?? 0,
            datos.longitud     ?? 0,
            datos.tiempoTurno  ?? 30000,
            terreno,
            [],              /* ciudadanos: se reconstruyen abajo */
            estadoRecursos
        );

        /* Restaura el campo genero si existe */
        if (datos.genero) Estado.ciudad.genero = datos.genero;

        /* Restaura los ciudadanos usando el método crearCiudadano en modo carga */
        if (Array.isArray(datos.ciudadanos)) {
            datos.ciudadanos.forEach(c => Estado.ciudad.crearCiudadano(c));
        }

        console.log("tablero.js: ciudad restaurada desde CiudadStorage.");

        /* Dimensiones del mapa para mapa.js */
        if (Estado.ciudad) {
            const _vias     = Estado.ciudad.terreno.vias;
            Estado.filas    = (_vias?.length)          || 15;
            Estado.columnas = (_vias?.[0]?.length)     || 15;
        }

        /* Conecta la instancia de Ciudad con Recursos para que la UI se actualice */
        Recursos.setCiudad(Estado.ciudad);

    } catch (e) {
        console.error("tablero.js: error al leer datos:", e);
    }
}


/* ================================================
INICIALIZACIÓN DE LA UI
Muestra el nombre de ciudad y configura el clima.
================================================ */
function inicializarUI() {
    const el = document.getElementById("nombre-ciudad");
    if (el && Estado.ciudad) el.textContent = Estado.ciudad.nombre;
}


/* ================================================
GUARDAR PARTIDA
Persiste el grid y el turno actual en localStorage.
Se llama manualmente (tecla S en desktop) o automáticamente
al final de cada turno.
================================================ */
function guardarPartida() {
    try {
        if (!Estado.ciudad) return;
        /* CiudadStorage serializa el objeto Ciudad completo */
        CiudadStorage.guardar(Estado.ciudad);
        Notificaciones.mostrar("Partida guardada correctamente.", "exito");
    } catch (e) {
        console.error("tablero.js: error al guardar:", e);
        Notificaciones.mostrar("Error al guardar la partida.", "error");
    }
}


/* ================================================
EXPORTAR PARTIDA A JSON
Genera un archivo JSON descargable.
El botón en la UI llama a esta función.
================================================ */
function exportarJSON() {
    if (!Estado.ciudad) return;
    const nombre = Estado.ciudad.nombre.replace(/\s+/g, "_");
    const blob   = new Blob([JSON.stringify(Estado.ciudad, null, 2)], { type: "application/json" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = `${nombre}.json`;
    a.click();
    URL.revokeObjectURL(url);
}


/* ================================================
CONTROL DEL MODO DE JUEGO
"normal" | "construccion" | "demolicion"
Los controles de cada vista llaman a estas funciones.
================================================ */

function activarModo(nuevoModo) {
    Estado.modo = nuevoModo;
    document.body.classList.remove("modo-construccion", "modo-demolicion");

    if (nuevoModo === "construccion") document.body.classList.add("modo-construccion");
    if (nuevoModo === "demolicion")   document.body.classList.add("modo-demolicion");

    /* Notifica a mapa.js para que actualice los event listeners de celdas */
    Mapa.actualizarModo(nuevoModo);
}

function cancelarModo() {
    Estado.edificioSeleccionado = null;
    activarModo("normal");
}

function seleccionarEdificio(idEdificio) {
    Estado.edificioSeleccionado = idEdificio;
    activarModo("construccion");
}


/* ================================================
PAUSAR / REANUDAR
Tecla Space en desktop; botón en móvil/tablet.
================================================ */
function togglePausa() {
    Estado.pausado = !Estado.pausado;
    Notificaciones.mostrar(
        Estado.pausado ? "Juego pausado" : "Juego reanudado",
        "aviso"
    );
    /* TODO: pausar animaciones del mapa si las hubiera */
}


/* ================================================
AVANZAR TURNO
Lógica de fin de turno: calcula ingresos, eventos, etc.
Los controles de cada vista pueden llamar a esta función.
================================================ */
function avanzarTurno() {
    if (Estado.pausado || !Estado.ciudad) return;

    /* Ciudad.ejecutarTurno() contiene toda la lógica:
       felicidad, asignaciones, consumos, producción, nuevos ciudadanos.
       Recursos.calcularTurno() lo llama y refresca la UI. */
    Recursos.calcularTurno();

    /* Verifica si el juego debe terminar (recursos negativos) */
    if (!Estado.ciudad.pasarTurno()) {
        Notificaciones.mostrar("Game Over: recursos negativos.", "error");
        Estado.ciudad.detenerSimulacion();
        return;
    }

    Notificaciones.mostrar(`Turno ${Estado.ciudad.tiempoTurno} completado.`, "aviso");
    guardarPartida();
}


/* ================================================
EXPOSICIÓN GLOBAL
Las vistas y otros módulos acceden a estas funciones.
================================================ */
window.Tablero = {
    Estado,
    guardarPartida,
    exportarJSON,
    activarModo,
    cancelarModo,
    seleccionarEdificio,
    togglePausa,
    avanzarTurno,
};