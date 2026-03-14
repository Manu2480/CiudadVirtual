/* ================================================
RECURSOS.JS
Puente entre la UI del tablero y la clase Ciudad.

NO contiene lógica de negocio propia. Toda la
lógica de recursos vive en Ciudad.js:
  - Ciudad.modificarRecurso(tipo, cantidad)
  - Ciudad.getRecurso(tipo)
  - Ciudad.consumoCiudadanos()
  - Ciudad.recursosPorEdificios()
  - Ciudad.calcularFelicidadPromedio()
  - Ciudad.recursosNegativos()
  - Ciudad.ejecutarTurno()

Responsabilidades de este módulo:
  1. Guardar la referencia a la instancia activa de Ciudad
  2. Leer estadoRecursos desde esa instancia y actualizar la UI
  3. Verificar si se puede construir (delegando a Ciudad)
  4. Notificar a la UI cuando los recursos cambian

Recursos que muestra la UI (vienen de Ciudad.estadoRecursos):
  dinero        → moneda del juego
  poblacion     → this.ciudadanos.length  (calculado)
  felicidad     → promedio calculado por Ciudad
  electricidad  → balance de energía
  agua          → balance de agua
  alimento      → balance de alimento
================================================ */


/* ================================================
ICONOS DE RECURSOS
Definidos aquí para que todas las vistas los usen
sin repetir clases ni nombres.
================================================ */
const ICONOS_RECURSOS = {
    dinero: {
        nombre: "Dinero",
        icono:  "fi-br-coins",
        link:   "https://www.flaticon.com/free-icon/coins",
    },
    agua: {
        nombre: "Agua",
        icono:  "fi-br-water",
        link:   "https://www.flaticon.com/free-icon/water",
    },
    alimento: {
        nombre: "Alimento",
        icono:  "fi-br-wheat",
        link:   "https://www.flaticon.com/free-icon/wheat",
    },
    poblacion: {
        nombre: "Población",
        icono:  "fi-br-users",
        link:   "https://www.flaticon.com/free-icon/users",
    },
    felicidad: {
        nombre: "Felicidad",
        icono:  "fi-br-smile",
        link:   "https://www.flaticon.com/free-icon/smile",
    },
    electricidad: {
        nombre: "Electricidad",
        icono:  "fi-br-bolt",
        link:   "https://www.flaticon.com/free-icon/bolt",
    },
    capacidadResidencial: {
        nombre: "Capacidad residencial",
        icono:  "fi-br-users",
        link:   "https://www.flaticon.com/free-icon/users",
    },
    capacidadLaboral: {
        nombre: "Capacidad laboral",
        icono:  "fi-br-handshake",
        link:   "https://www.flaticon.com/free-icon/handshake",
    },
};

/* ================================================
REFERENCIA A LA INSTANCIA ACTIVA DE CIUDAD
Se asigna desde tablero.js al arrancar:
  Recursos.setCiudad(instanciaDeCiudad);
================================================ */
let _ciudad = null;


/* ================================================
ASIGNAR LA INSTANCIA DE CIUDAD
Llamado desde tablero.js una vez que la ciudad
se carga o se crea desde el formulario.
================================================ */
function setCiudad(ciudad) {
    _ciudad = ciudad;
    _renderizarUI();
}


/* ================================================
INICIALIZAR
Verifica que la instancia de Ciudad esté asignada
y pinta los indicadores iniciales en la UI.
================================================ */
function inicializar() {
    if (!_ciudad) {
        console.warn("recursos.js: Ciudad no asignada. Llama a Recursos.setCiudad() primero.");
        return;
    }
    _renderizarUI();
}


/* ================================================
OBTENER TODOS LOS RECURSOS
Lee directamente desde Ciudad.estadoRecursos
y agrega la población (ciudadanos.length).
Devuelve un objeto plano para que la UI lo consuma.
================================================ */
function obtenerTodos() {
    if (!_ciudad) return {};

    const recursos = {
        ..._ciudad.estadoRecursos,
        /* La población no es un recurso en estadoRecursos sino
           el tamaño del array de ciudadanos */
        poblacion: _ciudad.ciudadanos.length,
    };

    /* Añadimos métricas de capacidad (vivienda + empleo) para mostrarlas en la UI */
    if (_ciudad.terreno) {
        recursos.capacidadResidencial = _ciudad.terreno.capacidadTotalViviendas?.() ?? 0;
        recursos.capacidadLaboral   = _ciudad.terreno.capacidadTotalEmpleos?.()   ?? 0;
    }

    return recursos;
}


/* ================================================
VERIFICAR SI SE PUEDE CONSTRUIR
Comprueba que haya dinero suficiente para el costo
del edificio. La lógica real de cobro y efectos
la ejecuta Ciudad al recibir el edificio construido.

@param {object} edificio - Objeto del catálogo (edificios.js)
@returns {boolean}
================================================ */
function puedeConstructir(edificio) {
    if (!_ciudad) return false;
    return _ciudad.getRecurso("dinero") >= edificio.costo;
}


/* ================================================
COBRAR CONSTRUCCIÓN
Descuenta el dinero usando Ciudad.modificarRecurso.
Los efectos de población/felicidad/energía los
gestiona Ciudad en cada turno (ejecutarTurno).

@param {object} edificio - Objeto del catálogo (edificios.js)
================================================ */
function cobrarConstruccion(edificio) {
    if (!_ciudad) return;
    _ciudad.modificarRecurso("dinero", -edificio.costo);
    _renderizarUI();
}


/* ================================================
CALCULAR TURNO
Delega completamente a Ciudad.ejecutarTurno(),
que ya incluye:
  - calcularFelicidadPromedio
  - asignarInfraestructuras
  - consumoCiudadanos
  - recursosPorEdificios
  - aumentarPoblacion / crearCiudadano

Después refresca la UI con los nuevos valores.
================================================ */
function calcularTurno() {
    if (!_ciudad) return;
    _ciudad.ejecutarTurno();
    _renderizarUI();
}


/* ================================================
RENDERIZAR INDICADORES EN LA UI
Lee estadoRecursos desde la instancia de Ciudad
y actualiza los paneles del encabezado y sidebar.
================================================ */
function _renderizarUI() {
    const datos = obtenerTodos();
    const html  = _htmlIndicadores(datos);

    /* Panel en el encabezado: siempre visible */
    const panelHeader = document.getElementById("panel-recursos");
    if (panelHeader) panelHeader.innerHTML = html;

    /* Panel en el sidebar: solo en desktop, con recursos extendidos */
    const vista = document.documentElement.getAttribute("data-vista");
    if (vista === "desktop") {
        const panelSide = document.getElementById("panel-recursos-side");
        if (panelSide) {
            const titulo = panelSide.querySelector(".panel__titulo");
            panelSide.innerHTML = "";
            if (titulo) panelSide.appendChild(titulo);
            panelSide.insertAdjacentHTML("beforeend", _htmlIndicadores(datos, true));
        }
    }
}


/* ================================================
GENERAR HTML DE INDICADORES
@param {object}  datos      - Objeto con todos los recursos
@param {boolean} extendido  - Si true, muestra agua y alimento
                              además de los 4 principales.
                              Usado en el sidebar de desktop/tablet.
================================================ */
function _htmlIndicadores(datos, extendido = false) {

    const getIcon = (key) => ICONOS_RECURSOS[key]?.icono || "fi-br-question";

    const principal = `
        <span class="recurso recurso--dinero">
            <i class="fi ${getIcon("dinero")} recurso__icono"></i>
            <span class="recurso__valor">$${(datos.dinero || 0).toLocaleString()}</span>
        </span>
        <span class="recurso recurso--agua">
            <i class="fi ${getIcon("agua")} recurso__icono"></i>
            <span class="recurso__valor">${datos.agua || 0} L</span>
        </span>
        <span class="recurso recurso--alimento">
            <i class="fi ${getIcon("alimento")} recurso__icono"></i>
            <span class="recurso__valor">${datos.alimento || 0} kg</span>
        </span>
        <span class="recurso recurso--poblacion">
            <i class="fi ${getIcon("poblacion")} recurso__icono"></i>
            <span class="recurso__valor">${(datos.poblacion || 0).toLocaleString()}</span>
        </span>
        <span class="recurso recurso--felicidad">
            <i class="fi ${getIcon("felicidad")} recurso__icono"></i>
            <span class="recurso__valor">${Math.round(datos.felicidad || 0)}</span>
        </span>
        <span class="recurso recurso--energia">
            <i class="fi ${getIcon("electricidad")} recurso__icono"></i>
            <span class="recurso__valor">${datos.electricidad || 0} kW</span>
        </span>
        <span class="recurso recurso--capacidad-residencial">
            <i class="fi ${getIcon("capacidadResidencial")} recurso__icono"></i>
            <span class="recurso__valor">${datos.capacidadResidencial || 0}</span>
        </span>
        <span class="recurso recurso--capacidad-laboral">
            <i class="fi ${getIcon("capacidadLaboral")} recurso__icono"></i>
            <span class="recurso__valor">${datos.capacidadLaboral || 0}</span>
        </span>
    `;

    /* En el sidebar también mostramos agua y alimento */
    const extra = extendido ? `
        <span class="recurso recurso--agua">
            <i class="fi ${getIcon("agua")} recurso__icono"></i>
            <span class="recurso__valor">${datos.agua || 0} L</span>
        </span>
        <span class="recurso recurso--alimento">
            <i class="fi ${getIcon("alimento")} recurso__icono"></i>
            <span class="recurso__valor">${datos.alimento || 0} kg</span>
        </span>
    ` : "";

    return principal + extra;
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Recursos = {
    iconos: ICONOS_RECURSOS,
    setCiudad,
    inicializar,
    obtenerTodos,
    puedeConstructir,
    cobrarConstruccion,
    calcularTurno,
};