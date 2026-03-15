/* ================================================
MENÚ CONSTRUCCIÓN MÓVIL
Lista de edificios disponibles para construir.

Responsabilidad:
  - Renderizar la lista de edificios con nombre,
    costo, descripción e indicadores de recursos
  - Notificar a Tablero el edificio seleccionado
  - Reubicar el menú fuera del sidebar si es necesario

Dependencias: edificios.js, tablero.js,
              recursos.js, notificaciones.js
================================================ */

function inicializar() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    console.log("MenuConstruccionMovil: inicializando", { menu });

    /* Si el menú está dentro del sidebar oculto, lo movemos al body
       para que pueda desplegarse sobre toda la pantalla */
    const sidebar = menu.closest(".sidebar--izquierdo");
    if (sidebar) {
        document.body.appendChild(menu);
        console.log("MenuConstruccionMovil: movido fuera del sidebar", { parent: menu.parentElement });
    }

    /* Edificios y Tablero se cargan con defer; reintenta si aún no están */
    const intentos = parseInt(menu.dataset._intentos || "0", 10);
    if (!window.Edificios || !window.Tablero) {
        console.log("MenuConstruccionMovil: esperando Edificios/Tablero", { intentos });
        if (intentos < 15) {
            menu.dataset._intentos = (intentos + 1).toString();
            requestAnimationFrame(inicializar);
        }
        return;
    }

    const contenido = document.createElement("div");
    contenido.className = "construccion-lista";

    Edificios.todos().forEach(edificio => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "construccion-item";
        btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo}`);

        btn.innerHTML = `
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="construccion-item__imagen" />
            <span class="construccion-item__nombre">${edificio.nombre}</span>
            <span class="construccion-item__costo">$${edificio.costo.toLocaleString()}</span>
            <p class="construccion-item__desc">${edificio.descripcion || ""}</p>
            <div class="construccion-item__detalles">${_detallesHtml(edificio)}</div>
        `;

        btn.addEventListener("click", () => {
            Tablero.seleccionarEdificio(edificio.id);
            window.Notificaciones?.mostrar(
                `Seleccionado: ${edificio.nombre}. Toca una celda vacía para construir.`,
                "aviso"
            );
        });

        contenido.appendChild(btn);
    });

    menu.appendChild(contenido);
    console.log("MenuConstruccionMovil: menú preparado", { items: contenido.childElementCount });
}


/* Genera el HTML de los indicadores de recursos del edificio */
function _detallesHtml(edificio) {
    const cat = window.Recursos?.RECURSOS || {};
    const icono = key => cat[key]?.icono || "fi-br-question";

    const indicadores = [
        { key: "electricidad", icono: icono("electricidad"), fmt: v => `${v > 0 ? "+" : ""}${v} kW`          },
        { key: "agua",         icono: icono("agua"),         fmt: v => `${v > 0 ? "+" : ""}${v} L`           },
        { key: "alimento",     icono: icono("alimento"),     fmt: v => `+${v} kg`                             },
        { key: "dinero",       icono: icono("dinero"),       fmt: v => `+$${v.toLocaleString()}/turno`        },
        { key: "felicidad",    icono: icono("felicidad"),    fmt: v => `${v > 0 ? "+" : ""}${v}`              },
        { key: "capacidad",    icono: icono("capacidadResidencial"), fmt: v => `+${v} hab`                    },
        { key: "empleos",      icono: icono("capacidadLaboral"),     fmt: v => `+${v} empleos`                },
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
window.MenuConstruccionMovil = { inicializar };