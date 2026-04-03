const construccionTabletVertical = document.getElementById("catalogo-edificios-tablet-vertical");
const construccionTabletHorizontal = document.getElementById("catalogo-edificios-tablet-horizontal");
let edificioSeleccionado = null;
function inicializar(){
    _renderizarCatalogo();
}
construccionTabletVertical.addEventListener("click", manejarClickTarjeta);
construccionTabletHorizontal.addEventListener("click", manejarClickTarjeta);

function manejarClickTarjeta(elemento){
    /*Guarda la variable de la tarjeta del edificio seleccionado */
    const tarjeta = elemento.target.closest(".tarjeta-edificio");
    if (!tarjeta) return;

    const id = tarjeta.dataset.id;

    // Si la tarjeta ya estaba seleccionada, se deselecciona
    if (Tablero.Estado.edificioSeleccionado === id) {
        tarjeta.classList.remove("seleccionada");
        Tablero.cancelarModo()
        console.log("Deseleccionado");
        return;
    }

    // Si se selecciona uno nuevo

    // quita la parte "seleccionado" a la tarjeta
    document.querySelectorAll(".tarjeta-edificio")
        .forEach(t => t.classList.remove("seleccionada"));

    // marca la tarjeta que fue seleccionada
    tarjeta.classList.add("seleccionada");

    Tablero.seleccionarEdificio(id);

    console.log("Edificio seleccionado:",Tablero.Estado.edificioSeleccionado);
}


// modificado para que muestre el edificio padre
function _htmlCatalogo(edificio){
    return `
        <div class="tarjeta-edificio" data-id="${edificio.id}">
            <span class="edificio-categoria edificio-categoria--${edificio.categoria}">${edificio.categoria}</span>
            <div class="edificio-nombre">
                <span class="edificio__nombre">${edificio.nombre}</span>
            </div>
            <img class="edificio__imagen" src="${edificio.imagen}" alt="${edificio.nombre}">
            <div class="edificio__info">
                <span class="edificio__descripcion">${edificio.descripcion}</span>
            </div>
            <div class="edificio__info seleccionado">
                <div class="construccion-item__detalles">${_detallesHtml(edificio)}</div>
            </div>
            <br>
            <span class="valor-edificio">$${edificio.costo.toLocaleString()}</span>
        </div>
    `;
}

function _detallesHtml(edificio) {
    const indicadores = [
        { key: "electricidad", icono: "fi-br-bolt",       fmt: v => `${v > 0 ? "+" : ""}${v} kW`         },
        { key: "agua",         icono: "fi-br-raindrops",  fmt: v => `${v > 0 ? "+" : ""}${v} L`          },
        { key: "alimento",     icono: "fi-br-wheat",      fmt: v => `+${v} kg`                            },
        { key: "dinero",       icono: "fi-br-coins",      fmt: v => `+$${v.toLocaleString()}/turno`       },
        { key: "felicidad",    icono: "fi-br-smile-beam",      fmt: v => `${v > 0 ? "+" : ""}${v}`             },
        { key: "capacidad",    icono: "fi-br-users",      fmt: v => `+${v} hab`                           },
        { key: "empleos",      icono: "fi-br-briefcase",  fmt: v => `+${v} empleos`                       },
    ];

    return indicadores
        .map(({ key, icono, fmt }) => {
            const valor = edificio[key];
            if (valor === null || valor === undefined || valor === 0) return "";
            return `<span class="construccion-item__atributo">
                        <i class="fi ${icono}"></i> ${fmt(valor)}
                    </span>
                    <br>`;
        })
        .filter(Boolean)
        .join("");
}
function _renderizarCatalogo(){
    // Crear catálogo de edificios
    edificioSeleccionado = null;
    construccionTabletHorizontal.innerHTML = "";
    construccionTabletVertical.innerHTML = "";
    const catalogo = Edificios.todos();
    for (const edificio of catalogo){
        construccionTabletVertical.insertAdjacentHTML("beforeend", _htmlCatalogo(edificio));
        construccionTabletHorizontal.insertAdjacentHTML("beforeend", _htmlCatalogo(edificio));
    }
}
document.addEventListener("catalogoModificado", _renderizarCatalogo);
window.ConstruccionTablet = {inicializar}