/* ================================================
MENÚ CONSTRUCCIÓN MÓVIL
Catálogo de edificios disponibles para construir.

Responsabilidad:
  - Renderizar la lista de edificios con nombre,
    costo, descripción e indicadores de recursos
  - Recordar la celda que el usuario tocó para
    construir en ella al seleccionar el edificio
  - Abrir y cerrar el catálogo sobre el mapa
  - Reubicar el menú fuera del sidebar si es necesario

Dependencias: edificios.js, tablero.js, edificaciones.js,
              recursos.js, notificaciones.js
================================================ */

/* Celda pendiente donde se construirá al elegir edificio */
let _celdaPendiente = null;   /* { fila, col, grid, gridEl } */

/* Escucha el evento que dispara mapa.js al tocar una celda vacía
   en modo construcción sin edificio seleccionado */
document.addEventListener("mapa:celdaParaConstruir", (e) => {
    const { fila, col, grid, gridEl } = e.detail;
    abrirCatalogo(fila, col, grid, gridEl);
});

function inicializar() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    /* Si el menú está dentro del sidebar oculto, lo movemos al body
       para que pueda desplegarse sobre toda la pantalla */
    const sidebar = menu.closest(".sidebar--izquierdo");
    if (sidebar) {
        document.body.appendChild(menu);
    }

    /* Oculta el título del panel — en móvil el catálogo es un modal,
       no necesita el h2 del sidebar */
    const titulo = menu.querySelector(".panel__titulo");
    if (titulo) titulo.style.display = "none";

    /* Edificios y Tablero se cargan con defer; reintenta si aún no están */
    const intentos = parseInt(menu.dataset._intentos || "0", 10);
    if (!window.Edificios || !window.Tablero) {
        if (intentos < 15) {
            menu.dataset._intentos = (intentos + 1).toString();
            requestAnimationFrame(inicializar);
        }
        return;
    }

    /* Evita renderizar el contenido dos veces */
    if (menu.querySelector(".construccion-lista")) return;

    const contenido = document.createElement("div");
    contenido.className = "construccion-lista";

    Edificios.todos().forEach(edificio => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "construccion-item";
        btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo}`);

        //modificado para que muestre el edificio padre
        btn.innerHTML = `
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="construccion-item__imagen" />
            <span class="edificio-categoria edificio-categoria--${edificio.categoria}">${edificio.categoria}</span>
            <span class="construccion-item__nombre">${edificio.nombre}</span>
            <span class="construccion-item__costo">$${edificio.costo.toLocaleString()}</span>
            <p class="construccion-item__desc">${edificio.descripcion || ""}</p>
            <div class="construccion-item__detalles">${_detallesHtml(edificio)}</div>
        `;

        btn.addEventListener("click", () => {
            cerrarCatalogo();

            /* Construye directamente en la celda que el usuario tocó */
            if (_celdaPendiente) {
                const { fila, col, grid, gridEl } = _celdaPendiente;
                Edificaciones.construir(fila, col, edificio.id, grid, gridEl);
                _celdaPendiente = null;
            }
        });

        contenido.appendChild(btn);
    });

    menu.appendChild(contenido);
}

/* Abre el catálogo recordando la celda donde el usuario tocó.
   Llamado desde mapa.js a través del evento personalizado. */
function abrirCatalogo(fila, col, grid, gridEl) {
    _celdaPendiente = { fila, col, grid, gridEl };

    /* Overlay oscuro detrás del catálogo */
    let overlay = document.getElementById("catalogo-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "catalogo-overlay";
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 1299;
        `;
        /* Cerrar al tocar fuera */
        overlay.addEventListener("click", cerrarCatalogo);
        document.body.appendChild(overlay);
    }
    overlay.style.display = "block";

    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    menu.style.cssText = `
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90vw;
        max-height: 70vh;
        background: rgba(255,255,255,0.98);
        overflow-y: auto;
        z-index: 1300;
        padding: var(--espacio-m);
        border-radius: var(--radio-m, 12px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        animation: slideUp 0.22s ease;
    `;
    menu.classList.add("abierto");
}

function cerrarCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (menu) {
        menu.style.cssText = "";
        menu.classList.remove("abierto");
    }

    const overlay = document.getElementById("catalogo-overlay");
    if (overlay) overlay.style.display = "none";
}


/* Genera el HTML de los indicadores de recursos del edificio */
function _detallesHtml(edificio) {
    const indicadores = [
        { key: "electricidad", icono: "fi-br-bolt",       fmt: v => `${v > 0 ? "+" : ""}${v} kW`         },
        { key: "agua",         icono: "fi-br-raindrops",  fmt: v => `${v > 0 ? "+" : ""}${v} L`          },
        { key: "alimento",     icono: "fi-br-wheat",      fmt: v => `+${v} kg`                            },
        { key: "dinero",       icono: "fi-br-coins",      fmt: v => `+$${v.toLocaleString()}/turno`       },
        { key: "felicidad",    icono: "fi-br-smile",      fmt: v => `${v > 0 ? "+" : ""}${v}`             },
        { key: "capacidad",    icono: "fi-br-users",      fmt: v => `+${v} hab`                           },
        { key: "empleos",      icono: "fi-br-briefcase",  fmt: v => `+${v} empleos`                       },
    ];

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


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.MenuConstruccionMovil = { inicializar, abrirCatalogo, cerrarCatalogo };