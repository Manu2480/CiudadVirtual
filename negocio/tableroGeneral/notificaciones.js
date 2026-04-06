/* ================================================
NOTIFICACIONES.JS
Sistema de notificaciones compartido por todas las vistas.

Las notificaciones siempre aparecen en la parte superior
de la pantalla (sobre el encabezado), en todas las vistas.

Tipos disponibles:
  "exito"   borde verde  (construcción exitosa, guardado, etc.)
  "aviso"   borde amarillo (pausa, turno nuevo, info)
  "error"   borde rojo   (sin recursos, acción inválida)
================================================ */


/* ================================================
REFERENCIA AL DOM
================================================ */
let _zona = null;

document.addEventListener("DOMContentLoaded", () => {
    _zona = document.getElementById("zona-notificaciones");
    if (!_zona) console.error("notificaciones.js: no se encontró #zona-notificaciones.");
});


/* ================================================
MOSTRAR NOTIFICACIÓN
Crea y agrega una notificación con auto-cierre.

@param {string} mensaje  - Texto a mostrar
@param {string} tipo     - "exito" | "aviso" | "error"
@param {number} duracion - Milisegundos hasta desaparecer (por defecto 3500)
================================================ */
function mostrar(mensaje, tipo = "aviso", duracion = 3500) {
    if (!_zona) return;

    /* Si el panel de ruta está activo, desplazar las notificaciones
       para que aparezcan debajo de él y no queden tapadas */
    const panelRuta = document.getElementById("ruta-panel-estado");
    if (panelRuta) {
        const altoPanelRuta = panelRuta.offsetHeight;
        document.documentElement.style.setProperty("--alto-panel-ruta", `${altoPanelRuta}px`);
    } else {
        document.documentElement.style.removeProperty("--alto-panel-ruta");
    }

    const el = document.createElement("div");
    el.classList.add("notificacion", `notificacion--${tipo}`);
    el.setAttribute("role", "status");

    /* Icono según tipo */
    const iconos = {
        exito: "fi fi-br-check",
        aviso: "fi fi-br-info",
        error: "fi fi-br-cross-small",
    };
    const icono = document.createElement("i");
    icono.className = iconos[tipo] || "fi fi-br-info";

    const texto = document.createElement("span");
    texto.textContent = mensaje;

    el.appendChild(icono);
    el.appendChild(texto);

    _zona.appendChild(el);

    /* Auto-cierre */
    setTimeout(() => {
        el.classList.add("notificacion--cerrando");
        setTimeout(() => el.remove(), 350);
    }, duracion);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Notificaciones = {
    mostrar,
};