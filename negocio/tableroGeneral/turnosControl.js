/* ================================================
TURNOSCONTROL.JS — negocio/tableroGeneral/turnosControl.js
Botón flotante con controles de simulación de turnos.
================================================ */

var _desplegado = false;

/* ── Acceso a la ciudad ── */
function _getCiudad() {
    return (window.Tablero && window.Tablero.Estado && window.Tablero.Estado.ciudad)
        || null;
}

/* ================================================
INICIALIZAR
================================================ */
function inicializar() {
    console.log("TurnosControl: inicializando...");
    _construirWidget();
    console.log("TurnosControl: widget creado →", document.getElementById("turnos-widget"));
}

/* ================================================
CONSTRUCCIÓN DEL WIDGET
================================================ */
function _construirWidget() {
    if (document.getElementById("turnos-widget")) return;

    var widget = document.createElement("div");
    widget.id        = "turnos-widget";
    widget.className = "turnos-widget";

    /* ── Opciones (orden: de arriba a abajo en el DOM = de abajo a arriba visualmente) ── */

    /* 1. Input tiempo */
    var wrapTiempo = _crearAccion("turnos-op-tiempo", "turnos-accion turnos-accion--tiempo", "fi fi-br-clock", "Tiempo entre turnos (segundos)");
    var input = document.createElement("input");
    input.type        = "number";
    input.id          = "turnos-input-tiempo";
    input.className   = "turnos-input-tiempo";
    input.min         = "1";
    input.placeholder = "seg";
    wrapTiempo.appendChild(input);
    widget.appendChild(wrapTiempo);

    /* 2. Ejecutar turno */
    var btnTurno = _crearAccion("turnos-op-turno", "turnos-accion", "fi fi-br-forward", "Ejecutar un turno");
    widget.appendChild(btnTurno);

    /* 3. Pausa */
    var btnPausa = _crearAccion("turnos-op-pausa", "turnos-accion", "fi fi-br-pause", "Pausar simulación");
    widget.appendChild(btnPausa);

    /* 4. Play */
    var btnPlay = _crearAccion("turnos-op-play", "turnos-accion", "fi fi-br-play", "Iniciar simulación automática");
    widget.appendChild(btnPlay);

    /* ── Botón principal ── */
    var btnMain = document.createElement("button");
    btnMain.id        = "turnos-btn-principal";
    btnMain.className = "turnos-btn-principal";
    btnMain.type      = "button";
    btnMain.setAttribute("aria-label", "Controles de simulación");
    var iMain = document.createElement("i");
    iMain.className = "fi fi-br-time-fast";
    btnMain.appendChild(iMain);
    /* Botón principal sin etiqueta — icono reconocible */
    widget.appendChild(btnMain);

    document.body.appendChild(widget);

    /* ── Eventos ── */
    btnMain.addEventListener("click",  _toggleDespliegue);
    btnPlay.addEventListener("click",  _onPlay);
    btnPausa.addEventListener("click", _onPausa);
    btnTurno.addEventListener("click", _onEjecutarTurno);
    input.addEventListener("change",   _onCambiarTiempo);
    input.addEventListener("keydown",  function(e) { if (e.key === "Enter") _onCambiarTiempo(); });

    /* Sincronizar input con el tiempo actual */
    setTimeout(function() {
        var ciudad = _getCiudad();
        if (ciudad && input) input.value = ciudad.tiempoTurno / 1000;
    }, 500);
}

var _etiquetas = {
    "turnos-op-tiempo": "Tiempo",
    "turnos-op-turno":  "Un turno",
    "turnos-op-pausa":  "Pausar",
    "turnos-op-play":   "Iniciar",
};

function _crearAccion(id, clase, iconoClase, tooltip) {
    var el = document.createElement("button");
    el.id        = id;
    el.className = clase;
    el.type      = "button";
    el.setAttribute("aria-label", tooltip);

    var i = document.createElement("i");
    i.className = iconoClase;
    el.appendChild(i);

    /* Etiqueta siempre visible — en móvil no hay hover */
    var label = document.createElement("span");
    label.className   = "turnos-tooltip";
    label.textContent = _etiquetas[id] || tooltip;
    el.appendChild(label);

    return el;
}

/* ================================================
DESPLIEGUE
================================================ */
function _toggleDespliegue() {
    _desplegado = !_desplegado;
    var widget = document.getElementById("turnos-widget");
    if (widget) widget.classList.toggle("turnos-widget--abierto", _desplegado);
}

/* ================================================
ACCIONES
================================================ */
function _onPlay() {
    var ciudad = _getCiudad();
    if (!ciudad) { Notificaciones.mostrar("No hay ciudad cargada.", "error"); return; }
    if (ciudad.intervalo) { Notificaciones.mostrar("La simulación ya está en curso.", "aviso"); return; }
    /* Envolver ejecutarTurno para disparar el evento tras cada turno automático */
    const _turnoOriginal = ciudad.ejecutarTurno.bind(ciudad);
    ciudad.ejecutarTurno = function() {
        _turnoOriginal();
        document.dispatchEvent(new CustomEvent("turno:ejecutado"));
    };
    ciudad.iniciarSimulacion();
    _actualizarEstado(true);
    Notificaciones.mostrar("Simulación iniciada.", "exito");
    _toggleDespliegue();
}

function _onPausa() {
    var ciudad = _getCiudad();
    if (!ciudad) return;
    if (!ciudad.intervalo) { Notificaciones.mostrar("La simulación no está en curso.", "aviso"); return; }
    ciudad.detenerSimulacion();
    _actualizarEstado(false);
    Notificaciones.mostrar("Simulación pausada.", "aviso");
    _toggleDespliegue();
}

function _onEjecutarTurno() {
    var ciudad = _getCiudad();
    if (!ciudad) return;
    if (!ciudad.pasarTurno()) { Notificaciones.mostrar("No se puede avanzar: recursos negativos.", "error"); return; }
    ciudad.ejecutarTurno();
    document.dispatchEvent(new CustomEvent("turno:ejecutado"));
    window.Recursos && window.Recursos.actualizar && window.Recursos.actualizar();
    Notificaciones.mostrar("Turno ejecutado.", "exito");
    _toggleDespliegue();
}

function _onCambiarTiempo() {
    var ciudad = _getCiudad();
    var input  = document.getElementById("turnos-input-tiempo");
    if (!ciudad || !input) return;
    var seg = parseFloat(input.value);
    if (isNaN(seg) || seg <= 0) {
        Notificaciones.mostrar("Ingresa un tiempo válido mayor a 0.", "error");
        input.value = ciudad.tiempoTurno / 1000;
        return;
    }
    var corriendo = !!ciudad.intervalo;
    if (corriendo) ciudad.detenerSimulacion();
    ciudad.modificarTiempoTurno(seg * 1000);
    if (corriendo) ciudad.iniciarSimulacion();
    Notificaciones.mostrar("Tiempo de turno: " + seg + " seg.", "exito");
}

function _actualizarEstado(corriendo) {
    var btnPlay  = document.getElementById("turnos-op-play");
    var btnPausa = document.getElementById("turnos-op-pausa");
    var widget   = document.getElementById("turnos-widget");
    if (btnPlay)  btnPlay.classList.toggle("turnos-accion--activo",   corriendo);
    if (btnPausa) btnPausa.classList.toggle("turnos-accion--activo", !corriendo);
    if (widget)   widget.classList.toggle("turnos-widget--corriendo",  corriendo);
}

/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.TurnosControl = {
    inicializar:      inicializar,
    actualizarEstado: _actualizarEstado,
};

/* Si tablero.js ya cargó y está esperando, notificarlo */
document.dispatchEvent(new CustomEvent("turnosControl:listo"));