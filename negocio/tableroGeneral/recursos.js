/* recursos.js
Puente entre la UI del tablero y Ciudad.js.
No contiene lógica de negocio — solo lee y pinta.
*/

/* Catálogo de recursos: icono UIcons y etiqueta visible */
const RECURSOS = {
    dinero:               { nombre: "Dinero",                icono: "fi-br-coins" },
    agua:                 { nombre: "Agua",                  icono: "fi-br-raindrops"  },
    alimento:             { nombre: "Comida",                icono: "fi-br-wheat"      },
    poblacion:            { nombre: "Población",             icono: "fi-br-users"  },
    felicidad:            { nombre: "Felicidad",             icono: "fi-br-happy" },
    electricidad:         { nombre: "Electricidad",          icono: "fi-br-bolt"       },
    capacidadResidencial: { nombre: "Cap. residencial",      icono: "fi-br-users"  },
    capacidadLaboral:     { nombre: "Cap. laboral",          icono: "fi-br-handshake"  },
};

let _ciudad = null;

function setCiudad(ciudad) {
    _ciudad = ciudad;
    _renderizarUI();
}

function inicializar() {
    if (!_ciudad) { console.warn("recursos.js: llama a setCiudad() primero."); return; }
    _renderizarUI();
}

function obtenerTodos() {
    if (!_ciudad) return {};
    const r = {
        ..._ciudad.estadoRecursos,
        poblacion: _ciudad.ciudadanos.length,
    };
    if (_ciudad.terreno) {
        r.capacidadResidencial = _ciudad.terreno.capacidadTotalViviendas?.() ?? 0;
        r.capacidadLaboral     = _ciudad.terreno.capacidadTotalEmpleos?.()   ?? 0;
    }
    return r;
}

function puedeConstructir(edificio) {
    return _ciudad ? _ciudad.getRecurso("dinero") >= edificio.costo : false;
}

function cobrarConstruccion(edificio) {
    if (!_ciudad) return;
    _ciudad.modificarRecurso("dinero", -edificio.costo);
    _renderizarUI();
}

function calcularTurno() {
    if (!_ciudad) return;
    _ciudad.ejecutarTurno();
    _renderizarUI();
}

/* Genera un <span> por cada recurso */
function _htmlIndicadores(datos, extendido = false) {
    const claves = extendido
        ? Object.keys(RECURSOS)
        : ["dinero", "poblacion", "felicidad", "electricidad"];

    return claves.map(k => {
        const def = RECURSOS[k];
        if (!def) return "";
        let valor = datos[k] ?? 0;
        if (k === "dinero")    valor = `$${Number(valor).toLocaleString()}`;
        if (k === "felicidad") valor = `${Math.round(valor)}`;
        return `
            <span class="recurso recurso--${k}">
                <i class="fi ${def.icono} recurso__icono"></i>
                <span class="recurso__valor">${valor}</span>
            </span>`;
    }).join("");
}

function _renderizarUI() {
    const datos = obtenerTodos();

    const header = document.getElementById("panel-recursos");
    if (header && !(document.documentElement.getAttribute("data-vista") === "tablet")) header.innerHTML = _htmlIndicadores(datos);

    if (document.documentElement.getAttribute("data-vista") === "desktop") {
        const side = document.getElementById("panel-recursos-side");
        if (side) {
            const titulo = side.querySelector(".panel__titulo");
            side.innerHTML = "";
            if (titulo) side.appendChild(titulo);
            side.insertAdjacentHTML("beforeend", _htmlIndicadores(datos, true));
        }
    }
    else if (document.documentElement.getAttribute("data-vista") === "tablet"){
        const panelTablet = document.getElementById("panel-recursos-tablet")
        panelTablet.innerHTML = "";
        panelTablet.innerHTML= '<h2 class="panel__titulo">Recursos</h2>';
        panelTablet.insertAdjacentHTML("beforeend", _htmlIndicadores(datos,true));
    }
}

window.Recursos = { RECURSOS, setCiudad, inicializar, obtenerTodos, puedeConstructir, cobrarConstruccion, calcularTurno };