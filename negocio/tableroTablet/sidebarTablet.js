
// Botones
const botonRecConEst = document.getElementById("btn-recConEst-tablet");
const botonClima = document.getElementById("btn-clima-tablet");
const botonNoticias = document.getElementById("btn-noticias-tablet");

// Paneles
const paneles = {
    recConEst: document.getElementById("recConEst-tablet"),
    clima: document.getElementById("clima-tablet"),
    noticias: document.getElementById("noticias-tablet")
};
const mapa = document.getElementById("area-mapa");
const sidebar = document.getElementById("sidebar-tablet")

let panelActivo = null;

// Función para mostrar panel
function togglePanel(panelKey) {
    const panel = paneles[panelKey];
    const sidebarAbierta = !sidebar.classList.contains("cerrada");

    // Si el panel ya está activo se cierra todo
    if (panelActivo === panelKey && sidebarAbierta) {
        sidebar.classList.add("cerrada");
        mapa.classList.toggle("full");
        panel.classList.remove("abierto");
        panelActivo = null;
        return;
    }

    // Cambiar a otro panel o abrir sidebar
    for (const key in paneles) paneles[key].classList.remove("abierto");
    panel.classList.add("abierto");
    sidebar.classList.remove("cerrada");
    mapa.classList.toggle("full");
    panelActivo = panelKey;
}

// Eventos
botonRecConEst.addEventListener("click", () => togglePanel("recConEst"));
botonClima.addEventListener("click", () => togglePanel("clima"));
botonNoticias.addEventListener("click", () => togglePanel("noticias"));

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

