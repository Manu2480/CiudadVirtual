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

var API_RUTA = "http://127.0.0.1:5000/api/calculate-route";

var _estado     = "inactivo";   /* "inactivo" | "eligiendo" | "resultado" */
var _puntoA     = null;         /* { fila, col, celdaEl } */
var _puntoB     = null;
var _celdasRuta = [];           /* celdas de la ruta pintada */

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

    _eliminarPanel();
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
      +     '<img class="ruta-paso__img" id="ruta-paso-a-img" src="" alt="" style="display:none">'
      +     '<div class="ruta-paso__info">'
      +       '<span class="ruta-paso__label">Origen</span>'
      +       '<span class="ruta-paso__nombre" id="ruta-paso-a-nombre">Toca un punto</span>'
      +     '</div>'
      +   '</div>'
      +   '<i class="fi fi-br-arrow-right ruta-panel-estado__flecha"></i>'
      +   '<div class="ruta-paso" id="ruta-paso-b">'
      +     '<div class="ruta-paso__circulo ruta-paso__circulo--b">B</div>'
      +     '<img class="ruta-paso__img" id="ruta-paso-b-img" src="" alt="" style="display:none">'
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
        imgEl.src           = imagen;
        imgEl.style.display = "block";
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
        imgEl.src           = imagen;
        imgEl.style.display = "block";
    }
    if (pasoB) {
        pasoB.classList.remove("ruta-paso--activo");
        pasoB.classList.add("ruta-paso--calculando");
    }
}

/* ================================================
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
        if (imgAEl)  { imgAEl.style.display  = "none"; imgAEl.src = ""; }
        if (pasoA)     pasoA.classList.add("ruta-paso--activo");
        if (pasoB)     pasoB.classList.remove("ruta-paso--activo");
        return;
    }

    /* Primer toque → A */
    if (!_puntoA) {
        _puntoA = { fila: fila, col: col, celdaEl: celdaEl };
        celdaEl.classList.add("celda--ruta-a");
        _actualizarPanelA(nombre, imagen);
        return;
    }

    /* Segundo toque → B, luego calcular.
       setTimeout deja al navegador renderizar el amarillo y la imagen
       antes de lanzar el fetch. */
    if (!_puntoB) {
        _puntoB = { fila: fila, col: col, celdaEl: celdaEl };
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

    var vias = ciudad.terreno.vias;
    var mapa = vias.map(function(f) { return f.slice(); });

    var startCoord = _coordParaApi(vias, _puntoA.fila, _puntoA.col);
    var endCoord   = _coordParaApi(vias, _puntoB.fila, _puntoB.col);

    if (!startCoord || !endCoord) {
        var msg = !startCoord
            ? "El origen no tiene vía adyacente."
            : "El destino no tiene vía adyacente.";
        Notificaciones.mostrar(msg, "error");
        /* Quita solo el punto problemático */
        if (!startCoord) {
            _puntoA.celdaEl.classList.remove("celda--ruta-a");
            _puntoA = null;
            var pasoA2 = document.getElementById("ruta-paso-a");
            var pasoB2 = document.getElementById("ruta-paso-b");
            var nomA   = document.getElementById("ruta-paso-a-nombre");
            var imgA   = document.getElementById("ruta-paso-a-img");
            if (pasoA2) pasoA2.classList.add("ruta-paso--activo");
            if (pasoB2) pasoB2.classList.remove("ruta-paso--activo");
            if (nomA)   nomA.textContent = "Toca un punto";
            if (imgA)  { imgA.style.display = "none"; imgA.src = ""; }
        } else {
            _puntoB.celdaEl.classList.remove("celda--ruta-b");
            _puntoB = null;
            var pasoB3 = document.getElementById("ruta-paso-b");
            var nomB   = document.getElementById("ruta-paso-b-nombre");
            var imgB   = document.getElementById("ruta-paso-b-img");
            if (pasoB3) {
                pasoB3.classList.remove("ruta-paso--calculando");
                pasoB3.classList.add("ruta-paso--activo");
            }
            if (nomB) nomB.textContent = "Pendiente";
            if (imgB) { imgB.style.display = "none"; imgB.src = ""; }
        }
        return;
    }

    fetch(API_RUTA, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
            map:   mapa,
            start: [startCoord.fila, startCoord.columna],
            end:   [endCoord.fila,   endCoord.columna]
        })
    })
    .then(function(res) {
        return res.json().then(function(data) { return { ok: res.ok, data: data }; });
    })
    .then(function(result) {
        if (!result.ok) {
            Notificaciones.mostrar(
                result.data.error || "No hay ruta posible entre esos puntos.", "error"
            );
            /* Resetea B para reintentar con otro destino */
            _puntoB.celdaEl.classList.remove("celda--ruta-b");
            _puntoB = null;
            var pb = document.getElementById("ruta-paso-b");
            var nb = document.getElementById("ruta-paso-b-nombre");
            var ib = document.getElementById("ruta-paso-b-img");
            if (pb) { pb.classList.remove("ruta-paso--calculando"); pb.classList.add("ruta-paso--activo"); }
            if (nb) nb.textContent = "Pendiente";
            if (ib) { ib.style.display = "none"; ib.src = ""; }
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
    })
    .catch(function(err) {
        console.error("Ruta API:", err);
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

/* ================================================
HELPERS
================================================ */
function _coordParaApi(vias, fila, col) {
    if (vias[fila] && vias[fila][col] === 1) return { fila: fila, columna: col };
    return _viaMasCercana(vias, fila, col);
}

function _viaMasCercana(vias, fila, col) {
    var vecinos = [
        { fila: fila - 1, columna: col },
        { fila: fila + 1, columna: col },
        { fila: fila,     columna: col - 1 },
        { fila: fila,     columna: col + 1 }
    ];
    for (var i = 0; i < vecinos.length; i++) {
        var v = vecinos[i];
        if (vias[v.fila] && vias[v.fila][v.columna] === 1) return v;
    }
    return null;
}

function _idCatalogo(idInstancia) {
    var mapa = {
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
        "agua":            "planta-hidraulica"
    };
    var lower = (idInstancia || "").toLowerCase();
    for (var prefijo in mapa) {
        if (lower.startsWith(prefijo)) return mapa[prefijo];
    }
    return idInstancia;
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