/* Ubicación: negocio/tableroGeneral/ruta.js
   Compartido por: tableroMovil, tableroDesktop, tableroTablet
   Expone: window.RutaMovil { activar, desactivar, limpiarTodo }
*/

/* ================================================
RUTA.JS
Estados posibles:
  "inactivo"   → modo normal
  "eligiendo"  → usuario elige A o B en el mapa
  "resultado"  → ruta pintada, esperando acción del usuario

Flujo:
  1. activar()       → estado "eligiendo", panel aparece
  2. Click edificio A → fondo amarillo en celda A, imagen en panel
  3. Click edificio B → fondo amarillo en celda B, imagen en panel,
                        calcula ruta (el amarillo de A y B persiste)
  4. Ruta encontrada → vías se pintan amarillo, estado "resultado"
  5. Tab cambia a Mapa/Construir → limpiarTodo(), todo vuelve a verde
  6. Click en tab Ruta (icono reiniciar) → limpiarTodo() + activar()
================================================ */

var API_RUTA = ApiRuta;

var _estado     = "inactivo";   /* "inactivo" | "eligiendo" | "resultado" */
var _puntoA     = null;         /* { fila, col, celdaEl } */
var _puntoB     = null;
var _celdasRuta = [];           /* celdas de la ruta pintada */
var _coordsRuta = [];           /* Coordenadas de la ruta pintada para tablet*/

/* ── Acceso al estado del juego ── */
function _getCiudad() {
    return (window.Tablero && window.Tablero.Estado && window.Tablero.Estado.ciudad) || null;
}

/* ================================================
ACTIVAR
================================================ */
function activar() {
    /* Si ya hay resultado visible, reinicia todo primero */
    limpiarTodo();

    _estado = "eligiendo";
    window.Tablero && window.Tablero.activarModo("ruta");
    _crearPanel();
    _setTabIcono("reiniciar");

    document.addEventListener("mapa:celdaRuta", _onCeldaRuta);
}

/* ================================================
DESACTIVAR — limpia estado pero NO borra amarillos del mapa
Usado internamente al completar la ruta.
================================================ */
function _desactivarModo() {
    /* Solo deja de escuchar clicks en el mapa.
       NO llama cancelarModo() para no activar el joystick
       ni cambiar el tab a Mapa — eso lo hace el usuario. */
    document.removeEventListener("mapa:celdaRuta", _onCeldaRuta);
}

/* ================================================
LIMPIAR TODO — borra amarillos, panel, reinicia estado
Llamado al cambiar de tab o al reiniciar desde tab Ruta.
================================================ */
function limpiarTodo() {
    document.removeEventListener("mapa:celdaRuta", _onCeldaRuta);
    window.Tablero && window.Tablero.cancelarModo();

    /* Quitar amarillo de A y B */
    if (_puntoA) { _puntoA.celdaEl.classList.remove("celda--ruta-a"); _puntoA = null; }
    if (_puntoB) { _puntoB.celdaEl.classList.remove("celda--ruta-b"); _puntoB = null; }

    /* Quitar amarillo de la ruta */
    _celdasRuta.forEach(function(c) { c.classList.remove("celda--ruta"); });
    _celdasRuta = [];
    _coordsRuta = [];

    _eliminarPanel();
    _ocultarCargando();
    _estado = "inactivo";
    _setTabIcono("ruta");
}

/* ================================================
PANEL FIJO
================================================ */
function _crearPanel() {
    _eliminarPanel();   /* siempre recrea para resetear estado visual */

    var panel = document.createElement("div");
    panel.id        = "ruta-panel-estado";
    panel.className = "ruta-panel-estado";

    panel.innerHTML =
        '<div class="ruta-panel-estado__pasos">'
      +   '<div class="ruta-paso ruta-paso--activo" id="ruta-paso-a">'
      +     '<div class="ruta-paso__circulo ruta-paso__circulo--a">A</div>'
      +     '<img class="ruta-paso__img ruta-paso__img--oculto" id="ruta-paso-a-img" src="" alt="">'
      +     '<div class="ruta-paso__info">'
      +       '<span class="ruta-paso__label">Origen</span>'
      +       '<span class="ruta-paso__nombre" id="ruta-paso-a-nombre">Toca un punto</span>'
      +     '</div>'
      +   '</div>'
      +   '<i class="fi fi-br-arrow-right ruta-panel-estado__flecha"></i>'
      +   '<div class="ruta-paso" id="ruta-paso-b">'
      +     '<div class="ruta-paso__circulo ruta-paso__circulo--b">B</div>'
      +     '<img class="ruta-paso__img ruta-paso__img--oculto" id="ruta-paso-b-img" src="" alt="">'
      +     '<div class="ruta-paso__info">'
      +       '<span class="ruta-paso__label">Destino</span>'
      +       '<span class="ruta-paso__nombre" id="ruta-paso-b-nombre">Pendiente</span>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<button class="ruta-panel-estado__cancelar" id="ruta-btn-cancelar" aria-label="Cancelar">'
      +   '<i class="fi fi-br-cross-small"></i>'
      + '</button>';

    document.body.appendChild(panel);

    document.getElementById("ruta-btn-cancelar")
        .addEventListener("click", function() {
            limpiarTodo();
            /* Devolver tab a Mapa */
            _irATabMapa();
        });
}

function _eliminarPanel() {
    var p = document.getElementById("ruta-panel-estado");
    if (p) p.remove();
}

function _actualizarPanelA(nombre, imagen) {
    var nombreEl = document.getElementById("ruta-paso-a-nombre");
    var imgEl    = document.getElementById("ruta-paso-a-img");
    var pasoA    = document.getElementById("ruta-paso-a");
    var pasoB    = document.getElementById("ruta-paso-b");

    if (nombreEl) nombreEl.textContent = nombre;
    if (imgEl && imagen) {
        imgEl.src = imagen;
        imgEl.classList.remove("ruta-paso__img--oculto");
    }
    if (pasoA) pasoA.classList.remove("ruta-paso--activo");
    if (pasoB) pasoB.classList.add("ruta-paso--activo");
}

function _actualizarPanelB(nombre, imagen) {
    var nombreEl = document.getElementById("ruta-paso-b-nombre");
    var imgEl    = document.getElementById("ruta-paso-b-img");
    var pasoB    = document.getElementById("ruta-paso-b");

    if (nombreEl) nombreEl.textContent = nombre;
    if (imgEl && imagen) {
        imgEl.src = imagen;
        imgEl.classList.remove("ruta-paso__img--oculto");
    }
    if (pasoB) {
        pasoB.classList.remove("ruta-paso--activo");
        pasoB.classList.add("ruta-paso--calculando");
    }
}
/* ================================================
OVERLAY DE CARGA
================================================ */
function _mostrarCargando() {
    var el = document.getElementById("ruta-cargando");
    if (!el) {
        el = document.createElement("div");
        el.id        = "ruta-cargando";
        el.className = "ruta-cargando";
        el.innerHTML =
            '<div class="ruta-cargando__tarjeta">'
          +   '<div class="ruta-cargando__spinner"></div>'
          +   '<span class="ruta-cargando__texto">Calculando ruta\u2026</span>'
          + '</div>';
        document.body.appendChild(el);
    }
    el.offsetHeight; /* forzar reflow para activar la transición */
    el.classList.add("activo");
}

function _ocultarCargando() {
    var el = document.getElementById("ruta-cargando");
    if (el) el.classList.remove("activo");
}

/* =================0===============================
CLICK EN CELDA DESDE MAPA.JS
================================================ */
function _onCeldaRuta(e) {
    if (_estado !== "eligiendo") return;

    var fila    = e.detail.fila;
    var col     = e.detail.col;
    var tipo    = e.detail.tipo;
    var celdaEl = e.detail.celdaEl;

    var def    = window.Edificios && window.Edificios.obtener(_idCatalogo(tipo));
    var nombre = def ? def.nombre : (tipo === "via" ? "Vía" : tipo);
    var imagen = def ? def.imagen : "";

    /* Deseleccionar A si se toca de nuevo */
    if (_puntoA && _puntoA.fila === fila && _puntoA.col === col) {
        _puntoA.celdaEl.classList.remove("celda--ruta-a");
        _puntoA = null;
        /* Resetear panel al estado inicial */
        var nombreAEl = document.getElementById("ruta-paso-a-nombre");
        var imgAEl    = document.getElementById("ruta-paso-a-img");
        var pasoA     = document.getElementById("ruta-paso-a");
        var pasoB     = document.getElementById("ruta-paso-b");
        if (nombreAEl) nombreAEl.textContent = "Toca un punto";
        if (imgAEl)  { imgAEl.classList.add("ruta-paso__img--oculto"); imgAEl.src = ""; }
        if (pasoA)     pasoA.classList.add("ruta-paso--activo");
        if (pasoB)     pasoB.classList.remove("ruta-paso--activo");
        return;
    }

    /* Primer toque → A */
    if (!_puntoA) {
        _puntoA = { fila: fila, col: col, tipo: tipo, celdaEl: celdaEl };
        celdaEl.classList.add("celda--ruta-a");
        _actualizarPanelA(nombre, imagen);
        return;
    }

    /* Segundo toque → B, luego calcular.
       setTimeout deja al navegador renderizar el amarillo y la imagen
       antes de lanzar el fetch. */
    if (!_puntoB) {
        _puntoB = { fila: fila, col: col, tipo: tipo, celdaEl: celdaEl };
        celdaEl.classList.add("celda--ruta-b");
        _actualizarPanelB(nombre, imagen);
        setTimeout(_calcular, 50);
    }
}

/* ================================================
API DIJKSTRA
================================================ */
function _calcular() {
    var ciudad = _getCiudad();
    if (!ciudad || !_puntoA || !_puntoB) return;

    _mostrarCargando();
    var _tiempoInicio = Date.now();

    var vias = ciudad.terreno.vias;
    var mapa = vias.map(function(f) { return f.slice(); });

    /* Marcar temporalmente las celdas de los edificios como transitables (1)
       en la copia del mapa. Así la API recibe start/end como las posiciones
       exactas de los edificios y calcula el camino completo sin que nosotros
       tengamos que deducir qué vía adyacente usar. */
    mapa[_puntoA.fila][_puntoA.col] = 1;
    mapa[_puntoB.fila][_puntoB.col] = 1;

    ApiRuta.calcularRuta({
        mapa: mapa,
        inicio: [_puntoA.fila, _puntoA.col],
        fin: [_puntoB.fila, _puntoB.col]
    })
    .then(function(result) {
        var MIN_MS   = 1000;//tiempo mínimo que debe durar la pantalla de carga antes de mostrar la ruta
        var elapsed  = Date.now() - _tiempoInicio;
        var restante = Math.max(0, MIN_MS - elapsed);

        setTimeout(function() {
            _ocultarCargando();

            if (!result.ok) {
                Notificaciones.mostrar(
                    result.data.error || "No hay ruta posible entre esos edificios.", "error"
                );
                _puntoB.celdaEl.classList.remove("celda--ruta-b");
                _puntoB = null;
                var pb = document.getElementById("ruta-paso-b");
                var nb = document.getElementById("ruta-paso-b-nombre");
                var ib = document.getElementById("ruta-paso-b-img");
                if (pb) { pb.classList.remove("ruta-paso--calculando"); pb.classList.add("ruta-paso--activo"); }
                if (nb) nb.textContent = "Pendiente";
                if (ib) { ib.classList.add("ruta-paso__img--oculto"); ib.src = ""; }
                return;
            }

            /* Éxito: pintar ruta, dejar A y B amarillos, cerrar panel,
               salir del modo "eligiendo" pero mantener amarillos */
            _pintarRuta(result.data.route);
            _eliminarPanel();
            _desactivarModo();
            _estado = "resultado";

            Notificaciones.mostrar(
                "Ruta: " + result.data.route.length + " pasos.", "exito"
            );
        }, restante);
    })
    .catch(function(err) {
        _ocultarCargando();
        console.error("Ruta API error de red:", err.message);
        Notificaciones.mostrar("No se pudo conectar con el servicio de rutas.", "error");
    });
}

/* ================================================
PINTAR RUTA EN EL MAPA
Sin auto-cierre — persiste hasta limpiarTodo()
================================================ */
function _pintarRuta(ruta) {
    var gridEl = document.getElementById("mapa-grid");
    if (!gridEl) return;
    ruta.forEach(function(coord) {
        _coordsRuta.push({
            fila: coord[0],
            col: coord[1]
        });
        var celda = gridEl.querySelector(
            '[data-fila="' + coord[0] + '"][data-col="' + coord[1] + '"]'
        );
        if (celda) {
            celda.classList.add("celda--ruta");
            _celdasRuta.push(celda);
        }
    });
}

/* ================================================
TAB: cambiar entre icono ruta / reiniciar
================================================ */
function _setTabIcono(tipo) {
    var tabs = document.querySelectorAll("#tabs-movil .tab");
    tabs.forEach(function(t) {
        if (t.dataset.panel !== "ruta") return;
        if (tipo === "reiniciar") {
            t.innerHTML = '<i class="fi fi-br-rotate-right"></i> Reiniciar';
        } else {
            t.innerHTML = '<i class="fi fi-br-route"></i> Ruta';
        }
    });
}

function _irATabMapa() {
    var btnMapa = document.querySelector("#tabs-movil .tab[data-panel='area-mapa']");
    if (btnMapa) {
        document.querySelectorAll("#tabs-movil .tab")
            .forEach(function(t) { t.classList.remove("tab--activo"); });
        btnMapa.classList.add("tab--activo");
    }
    document.dispatchEvent(new CustomEvent("ruta:completada"));
}
document.addEventListener("mapa:renderizado", function() {
    if (_estado === "inactivo") return;

    // A
    if (_puntoA) {
        const celda = document.querySelector(
            `[data-fila="${_puntoA.fila}"][data-col="${_puntoA.col}"]`
        );
        if (celda) {
            celda.classList.add("celda--ruta-a");
            _puntoA.celdaEl = celda;
        }
    }

    // B
    if (_puntoB) {
        const celda = document.querySelector(
            `[data-fila="${_puntoB.fila}"][data-col="${_puntoB.col}"]`
        );
        if (celda) {
            celda.classList.add("celda--ruta-b");
            _puntoB.celdaEl = celda;
        }
    }

    // Ruta
    _repintarRuta();
});
function _repintarRuta() {
    var gridEl = document.getElementById("mapa-grid");
    if (!gridEl) return;

    _celdasRuta = []; //  reset DOM actual

    _coordsRuta.forEach(function(coord) {
        var celda = gridEl.querySelector(
            '[data-fila="' + coord.fila + '"][data-col="' + coord.col + '"]'
        );

        if (celda) {
            celda.classList.add("celda--ruta");
            _celdasRuta.push(celda); //  vuelve a llenar DOM
        }
    });
}
/* ================================================
HELPERS
================================================ */

/**
 * Normaliza un ID de instancia a su ID de catálogo
 * Usa IdNormalizador centralizado para evitar duplicación
 * Ej: "casa3" → "casa", "luz1" → "planta-electrica"
 */
function _idCatalogo(idInstancia) {
    return IdNormalizador.normalizar(idInstancia);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.RutaMovil = {
    activar:     activar,
    desactivar:  limpiarTodo,
    limpiarTodo: limpiarTodo,
    /* limpiarRuta: solo quita clases amarillas del mapa,
       sin cancelar el modo activo del tablero */
    limpiarRuta: function() {
        if (_puntoA) { _puntoA.celdaEl.classList.remove("celda--ruta-a"); _puntoA = null; }
        if (_puntoB) { _puntoB.celdaEl.classList.remove("celda--ruta-b"); _puntoB = null; }
        _celdasRuta.forEach(function(c) { c.classList.remove("celda--ruta"); });
        _celdasRuta = [];
    },
    estaActivo:  function() { return _estado !== "inactivo"; }
};