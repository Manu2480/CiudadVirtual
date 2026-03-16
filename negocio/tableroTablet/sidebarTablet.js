function inicializar() {
    // Intentar obtener todos los elementos
    const sidebar = document.getElementById("sidebar-tablet");
    const botonRecConEst = document.getElementById("btn-recConEst-tablet");
    const botonClima = document.getElementById("btn-clima-tablet");
    const botonNoticias = document.getElementById("btn-noticias-tablet");
    const paneles = {
        recConEst: document.getElementById("recConEst-tablet"),
        clima:    document.getElementById("clima-tablet"),
        noticias: document.getElementById("noticias-tablet")
    };
    const mapa = document.getElementById("area-mapa");
    const construccionTablet = document.getElementById("catalogo-edificios-tablet");

    // Si algún elemento todavía no existe, reintentar en 50ms
    if (!sidebar || !botonRecConEst || !botonClima || !botonNoticias ||
        !paneles.recConEst || !paneles.clima || !paneles.noticias || !mapa || !construccionTablet) {
        setTimeout(inicializar, 50);
        return;
    }

    let panelActivo = null;

    // Función para mostrar panel
    function togglePanel(panelKey) {
        const panel = paneles[panelKey];
        const sidebarAbierta = !sidebar.classList.contains("cerrada");

        if (panelActivo === panelKey && sidebarAbierta) {
            sidebar.classList.toggle("cerrada");
            mapa.classList.toggle("full");
            panel.classList.remove("abierto");
            panelActivo = null;
            return;
        }

        for (const key in paneles) paneles[key].classList.remove("abierto");
        panel.classList.add("abierto");
        sidebar.classList.toggle("cerrada");
        mapa.classList.toggle("full");
        panelActivo = panelKey;
    }

    // Asignar eventos a botones
    botonRecConEst.addEventListener("click", () => togglePanel("recConEst"));
    botonClima.addEventListener("click", () => togglePanel("clima"));
    botonNoticias.addEventListener("click", () => togglePanel("noticias"));

    // Crear catálogo de edificios
    const catalogo = Edificios.todos();
    for (const edificio of catalogo){
        construccionTablet.insertAdjacentHTML("beforeend", _htmlCatalogo(edificio));
    }

    function _htmlCatalogo(edificio){
        return `
            <div class="tarjeta-edificio" data-id="${edificio.id}">
                <div class="edificio-nombre">
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

    console.log("SidebarTablet: inicialización completa, DOM listo");
}

window.SidebarTablet = { inicializar };