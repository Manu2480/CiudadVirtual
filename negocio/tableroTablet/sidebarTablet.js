/*Control de la sidebar*/
boton.addEventListener("click", () => {
    sidebar.classList.toggle("cerrada");
    mapa.classList.toggle("full")
});

/*Catálogo de edificios*/

const construccionTablet = document.getElementById("catalogo-edificios-tablet")
const catalogo = Edificios.todos()
for (const edificio of catalogo){
    construccionTablet.insertAdjacentHTML("beforeend",_htmlCatalogo(edificio));
}

function _htmlCatalogo(edificio){
    return `
        <div class="tarjeta-edificio" data-id="${edificio.id}">
            <div class = "edificio-nombre">
                <span class="edificio__nombre">${edificio.nombre}</span>
            </div>
            <img class="edificio__imagen" src="${edificio.imagen}" alt="${edificio.nombre}">
            <div class="edificio__info">
                <span class="edificio__descripcion">${edificio.descripcion}</span>
            </div>
            <button class="comprar-edificio">$${edificio.costo.toLocaleString()}</button>
        </div>
    `;
}

