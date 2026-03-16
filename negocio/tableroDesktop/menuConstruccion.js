/*
MENÚ CONSTRUCCIÓN DESKTOP
Catálogo de edificios disponibles para construir en el sidebar.

Responsabilidad:
  - Renderizar la lista de edificios en el sidebar izquierdo
  - Manejar selección de edificio para construcción

Dependencias: edificios.js, tablero.js, edificaciones.js
*/

function inicializar() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;

    /* Edificios y Tablero se cargan con defer; reintenta si aún no están */
    const intentos = parseInt(menu.dataset._intentos || "0", 10);
    if (!window.Edificios || !window.Tablero) {
        if (intentos < 15) {
            menu.dataset._intentos = (intentos + 1).toString();
            requestAnimationFrame(inicializar);
        }
        return;
    }

    const contenido = document.createElement("div");
    contenido.className = "construccion-lista";

    window.Edificios.todos().forEach(edificio => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "construccion-item";
        btn.setAttribute("aria-label", `Construir ${edificio.nombre} — $${edificio.costo}`);

        btn.innerHTML = `
            <img src="${edificio.imagen}" alt="${edificio.nombre}" class="construccion-item__icono" />
            <span class="construccion-item__nombre">${edificio.nombre}</span>
            <span class="construccion-item__costo">$${edificio.costo.toLocaleString()}</span>
        `;

        // Hacer el botón arrastrable
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
            // Activar modo construcción con este edificio
            if (window.Edificaciones) {
                window.Edificaciones.seleccionarEdificio(edificio.id);
            }
        });

        contenido.appendChild(btn);
    });

    menu.appendChild(contenido);
}

window.MenuConstruccionDesktop = { inicializar };