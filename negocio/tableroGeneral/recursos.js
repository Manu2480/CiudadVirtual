/* ================================================
RECURSOS.JS  (tableroGeneral)
Lógica de negocio de recursos de la ciudad.

Responsabilidades:
  - Mantener referencia a la ciudad activa
  - Renderizar los indicadores de recursos en el header
  - Calcular y aplicar los recursos por turno
  - Exponer obtenerTodos() para el modal de estadísticas

Dependencias: tablero.js (ciudad), CiudadStorage.js
================================================ */

let _ciudad = null;

/* Llamado desde tablero.js al cargar la ciudad */
function setCiudad(ciudad) {
    _ciudad = ciudad;
}

/* Llamado desde tablero.js en DOMContentLoaded */
function inicializar() {
    setInterval(() => {
        if (!window.Tablero?.Estado?.ciudad) return;
        _renderizarIndicadores();
    }, 500);
}

/* Llamado desde tablero.js en avanzarTurno */
function calcularTurno() {
    if (!_ciudad) return;
    _ciudad.ejecutarTurno();
    _renderizarIndicadores();
    CiudadStorage.guardar(_ciudad);
}

/* Devuelve el estado actual de recursos */
function obtenerTodos() {
    return _ciudad?.estadoRecursos ?? {};
}

/* Inyecta los indicadores en #panel-recursos del header */
function _renderizarIndicadores() {
    const panel = document.getElementById("panel-recursos");
    if (!panel || !_ciudad) return;

    const r = _ciudad.estadoRecursos;

    const indicadores = [
        { clave: "dinero",       icono: "fi-br-coins",     label: "Dinero",       fmt: v => `$${Math.round(v).toLocaleString()}` },
        { clave: "agua",         icono: "fi-br-raindrops", label: "Agua",         fmt: v => `${Math.round(v)} L`  },
        { clave: "electricidad", icono: "fi-br-bolt",      label: "Electricidad", fmt: v => `${Math.round(v)} kW` },
        { clave: "alimento",     icono: "fi-br-wheat",     label: "Alimento",     fmt: v => `${Math.round(v)} kg` },
        { clave: "felicidad",    icono: "fi fi-br-smile-beam", label: "Felicidad", fmt: v => `${Math.round(v)}`   },
    ];

    panel.innerHTML = indicadores.map(({ clave, icono, label, fmt }) => {
        const valor = r[clave] ?? 0;
        const claseColor = valor < 0 ? "recurso__valor--negativo" : "";
        return `
            <div class="recurso recurso--${clave}">
                <i class="fi ${icono} recurso__icono"></i>
                <span class="recurso__label">${label}:</span>
                <span class="recurso__valor ${claseColor}">
                    ${fmt(valor)}
                </span>
            </div>
        `;
    }).join("");
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Recursos = {
    setCiudad,
    inicializar,
    calcularTurno,
    obtenerTodos,
};