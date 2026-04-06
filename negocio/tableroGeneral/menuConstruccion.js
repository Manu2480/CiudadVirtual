/* ================================================
MENÚ CONSTRUCCIÓN — UNIFICADO
Renderiza el catálogo de edificios en las 3 vistas:
  - Móvil:             #menu-construccion  (modal con scroll horizontal)
  - Tablet horizontal: #catalogo-edificios-tablet-horizontal
  - Tablet vertical:   #catalogo-edificios-tablet-vertical
  - Desktop:           #menu-construccion  (sidebar, drag & drop)

Dependencias: edificios.js, tablero.js, edificaciones.js,
              notificaciones.js
================================================ */

/* Celda pendiente donde se construirá al elegir edificio (móvil) */
let _celdaPendiente = null;
/* el que indicará si el modo demolición está activado o no en tablet */
let _modoDemolicionActivo = false;

/* Escucha el evento que dispara mapa.js al tocar una celda vacía
   en modo construcción sin edificio seleccionado (móvil) */
document.addEventListener("mapa:celdaParaConstruir", (e) => {
    const { fila, col, grid, gridEl } = e.detail;
    abrirCatalogo(fila, col, grid, gridEl);
});

/* ================================================
INICIALIZAR
Renderiza el catálogo en todos los contenedores
disponibles según la vista activa.
================================================ */
function inicializar() {
    if (!window.Edificios || !window.Tablero) {
        requestAnimationFrame(inicializar);
        return;
    }

    _inicializarMovil();
    _inicializarTablet();
    _inicializarDesktop();
}

/* ---------- MÓVIL ---------- */
function _inicializarMovil() {
    if (window.innerWidth >= 768) return;  /* no es móvil */

    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    const sidebar = menu.closest(".sidebar--izquierdo");
    if (sidebar) document.body.appendChild(menu);

    menu.classList.add("menu-construccion--sin-titulo");

    if (menu.querySelector(".construccion-lista")) return;

    const lista = _crearLista("movil");
    menu.appendChild(lista);
}

/* ---------- TABLET ---------- */
function _inicializarTablet() {
    const contenedores = [
        document.getElementById("catalogo-edificios-tablet-horizontal"),
        document.getElementById("catalogo-edificios-tablet-vertical"),
    ];

    contenedores.forEach(contenedor => {
        if (!contenedor || contenedor.querySelector(".construccion-lista")) return;
        let lista = _crearLista("tablet");
        _agregarBotonDemolicion(lista);

        contenedor.appendChild(lista);
    });
}

/* ---------- DESKTOP ---------- */
function _inicializarDesktop() {
    if (window.innerWidth < 1024) return;  /* no es desktop */

    const menu = document.getElementById("menu-construccion");
    if (!menu) return;
    if (menu.querySelector(".construccion-lista")) return;

    const lista = _crearLista("desktop");
    menu.appendChild(lista);
}

/* ================================================
CREAR LISTA
Genera el contenedor con todos los botones de edificios.
vista: "movil" | "tablet" | "desktop"
================================================ */
function _crearLista(vista) {
    const contenido = document.createElement("div");
    contenido.className = "construccion-lista";

    Edificios.todos().forEach(edificio => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "construccion-item";
        btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo.toLocaleString()}`);
        btn.title = Edificios.tooltip ? Edificios.tooltip(edificio) : edificio.nombre;

        const mantenimiento = Math.round(edificio.costo * 0.01);

        btn.innerHTML = `
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="construccion-item__imagen" />
            <div class="construccion-item__info">
                <span class="edificio-categoria edificio-categoria--${edificio.categoria}">${edificio.categoria}</span>
                <span class="construccion-item__nombre">${edificio.nombre}</span>
                <div class="construccion-item__costo">Precio: $${edificio.costo.toLocaleString()}</div>
                <div class="construccion-item__mantenimiento">Mant: -$${mantenimiento.toLocaleString()}/turno</div>
                <p class="construccion-item__desc">${edificio.descripcion || ""}</p>
                <div class="construccion-item__detalles">${_detallesHtml(edificio)}</div>
            </div>
        `;

        /* Desktop: drag & drop */
        if (vista === "desktop") {
            btn.draggable = true;
            btn.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", edificio.id);
                e.dataTransfer.effectAllowed = "copy";
                btn.classList.add("construccion-item--dragging");
            });
            btn.addEventListener("dragend", () => {
                btn.classList.remove("construccion-item--dragging");
            });
            btn.addEventListener("click", () => {
                if (window.Edificaciones) {
                    window.Edificaciones.seleccionarEdificio(edificio.id);
                }
                /* Marcar seleccionado */
                contenido.querySelectorAll(".construccion-item").forEach(b => b.classList.remove("construccion-item--seleccionado"));
                btn.classList.add("construccion-item--seleccionado");
            });
        }

        /* Tablet: click selecciona edificio */
        if (vista === "tablet") {
            btn.addEventListener("click", () => {
                /* Quita selección previa en AMBOS catálogos tablet */
                document.querySelectorAll("#catalogo-edificios-tablet-horizontal .construccion-item, #catalogo-edificios-tablet-vertical .construccion-item")
                    .forEach(b => b.classList.remove("construccion-item--seleccionado"));
                btn.classList.add("construccion-item--seleccionado");

                if (window.Tablero?.Estado?.edificioSeleccionado === edificio.id) {
                    btn.classList.remove("construccion-item--seleccionado");
                    Tablero.cancelarModo?.();
                } else {
                    Tablero.seleccionarEdificio?.(edificio.id);
                }
            });
        }

        /* Móvil: click construye en la celda pendiente */
        if (vista === "movil") {
            btn.addEventListener("click", () => {
                cerrarCatalogo();
                if (_celdaPendiente) {
                    const { fila, col, grid, gridEl } = _celdaPendiente;
                    Edificaciones.construir(fila, col, edificio.id, grid, gridEl);
                    _celdaPendiente = null;
                }
            });
        }

        contenido.appendChild(btn);
    });

    return contenido;
}

/* ================================================
ABRIR / CERRAR CATÁLOGO (móvil)
================================================ */
function abrirCatalogo(fila, col, grid, gridEl) {
    _celdaPendiente = { fila, col, grid, gridEl };

    let overlay = document.getElementById("catalogo-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "catalogo-overlay";
        overlay.className = "catalogo-overlay";
        overlay.addEventListener("click", cerrarCatalogo);
        document.body.appendChild(overlay);
    }
    overlay.classList.add("activo");

    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    menu.classList.add("catalogo-abierto");
}

function cerrarCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (menu) {
        menu.classList.remove("catalogo-abierto");
    }
    const overlay = document.getElementById("catalogo-overlay");
    if (overlay) overlay.classList.remove("activo");
}

/* ================================================
DETALLES HTML
Indicadores de recursos del edificio.
- capacidad (hab) solo en edificios SIN empleos (residencial)
- empleos solo en edificios CON empleos (comercial/industrial)
================================================ */
function _detallesHtml(edificio) {
    const indicadores = [
        { key: "electricidad", icono: "fi-br-bolt",       fmt: v => `${v > 0 ? "+" : ""}${v} kW`   },
        { key: "agua",         icono: "fi-br-raindrops",  fmt: v => `${v > 0 ? "+" : ""}${v} L`    },
        { key: "alimento",     icono: "fi-br-wheat",      fmt: v => `+${v} kg`                      },
        { key: "dinero",       icono: "fi-br-coins",      fmt: v => `+$${v.toLocaleString()}/turno` },
        { key: "felicidad",    icono: "fi-br-smile-beam", fmt: v => `${v > 0 ? "+" : ""}${v}`       },
        { key: "empleos",      icono: "fi-br-briefcase",  fmt: v => `+${v} empleos`                 },
    ];

    /* Habitantes solo para edificios residenciales (sin empleos) */
    if (!edificio.empleos) {
        indicadores.push(
            { key: "capacidad", icono: "fi-br-users", fmt: v => `+${v} hab` }
        );
    }

    return indicadores
        .map(({ key, icono, fmt }) => {
            const valor = edificio[key];
            if (valor === null || valor === undefined || valor === 0) return "";
            return `<span class="construccion-item__atributo">
                        <i class="fi ${icono}"></i> ${fmt(valor)}
                    </span>`;
        })
        .filter(Boolean)
        .join("");
}

function _agregarBotonDemolicion(contenido){
    const btnDemo = document.createElement("button");
    btnDemo.type = "button";
    btnDemo.className = "construccion-item construccion-item--demolicion";
    btnDemo.setAttribute("aria-label", "Modo demolición");
    btnDemo.title = "Demoler edificio";

    btnDemo.innerHTML = `
        <div class="construccion-item__info">
            <span class="edificio-categoria edificio-categoria--demolicion">Acción</span>
            <span class="construccion-item__nombre">Demoler</span>
            <div class="construccion-item__costo">Eliminar edificio existente</div>
            <p class="construccion-item__desc">Activa el modo demolición para eliminar construcciones del mapa.</p>
        </div>
    `;
    btnDemo.addEventListener("click", () => {

        _modoDemolicionActivo = !_modoDemolicionActivo;

        document.querySelectorAll(
            "#catalogo-edificios-tablet-horizontal .construccion-item, #catalogo-edificios-tablet-vertical .construccion-item"
        ).forEach(b => b.classList.remove("construccion-item--seleccionado"));

        if (_modoDemolicionActivo) {
            Tablero.activarModo?.("demolicion");
            btnDemo.classList.add("construccion-item--seleccionado");
        } else {
            Tablero.cancelarModo?.();
        }
    });

    contenido.appendChild(btnDemo);
}


/* Rerenderiza si el catálogo cambia (ej: modificarRecursoEdificio) */
document.addEventListener("catalogoModificado", () => {
    ["catalogo-edificios-tablet-horizontal", "catalogo-edificios-tablet-vertical", "menu-construccion"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const lista = el.querySelector(".construccion-lista");
            if (lista) lista.remove();
        }
    });
    inicializar();
});

/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.MenuConstruccion      = { inicializar, abrirCatalogo, cerrarCatalogo };
window.MenuConstruccionMovil = { inicializar, abrirCatalogo, cerrarCatalogo };
window.MenuConstruccionDesktop = { inicializar };
window.ConstruccionTablet    = { inicializar };