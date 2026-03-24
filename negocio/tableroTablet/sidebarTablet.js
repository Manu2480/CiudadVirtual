function inicializar() {
    // Intentar obtener todos los elementos
    console.log("inicializando")
    const sidebar = document.getElementById("sidebar-tablet");
    const botonRecConEst = document.getElementById("btn-recConEst-tablet");
    const botonClima = document.getElementById("btn-clima-tablet");
    const botonNoticias = document.getElementById("btn-noticias-tablet");
    const botonSidebarDerecho = document.getElementById("btn-sidebar-derecho-tablet");
    const botonSidebarIzquierdo = document.getElementById("btn-sidebar-izquierdo-tablet");
    const panelesVertical = {
        recConEst: document.getElementById("recConEst-tablet"),
        clima:    document.getElementById("clima-tablet-vertical"),
        noticias: document.getElementById("noticias-tablet-vertical")
    };
    const panelesHorizontal = {
        izquierdo: document.getElementById("sidebar-izquierdo-tablet"),
        derecho: document.getElementById("sidebar-derecho-tablet")
    }
    const elementosHover = document.querySelectorAll(".hover");
    const mapa = document.getElementById("area-mapa");
    // Si algún elemento todavía no existe, reintentar en 50ms
    if (!sidebar || !botonRecConEst || !botonClima || !botonNoticias ||
        !panelesVertical.recConEst || !panelesVertical.clima || !panelesVertical.noticias || !mapa) {
        console.log("No se cargó bien la sidebar")
        setTimeout(inicializar, 50);
        return;
    }
    console.log("Se inicializó la sidebar")
    let panelActivo = null;

    // Función para mostrar panel
    function togglePanelVertical(panelKey) {
        const panel = panelesVertical[panelKey];
        const sidebarAbierta = !sidebar.classList.contains("cerrada");
        console.log("Se clickeo el panel")

        if (panelActivo === panelKey && sidebarAbierta) {
            sidebar.classList.toggle("cerrada");
            mapa.classList.toggle("full");
            panel.classList.remove("abierto");
            panelActivo = null;
            return;
        }

        for (const key in panelesVertical) panelesVertical[key].classList.remove("abierto");
        panel.classList.add("abierto");
        sidebar.classList.toggle("cerrada");
        mapa.classList.toggle("full");
        panelActivo = panelKey;
    }
    function togglePanelHorizontal(panelKey){
        const panel = panelesHorizontal[panelKey];
        panel.classList.toggle("abierta");
        mapa.classList.toggle(panelKey);
        celdasTablet.renderizarViewport();
        celdasTablet.mostrarIndices();

    }

    // Asignar eventos a botones
    botonRecConEst.addEventListener("click", () => togglePanelVertical("recConEst"));
    botonClima.addEventListener("click", () => togglePanelVertical("clima"));
    botonNoticias.addEventListener("click", () => togglePanelVertical("noticias"));
    botonSidebarDerecho.addEventListener("click",()=>togglePanelHorizontal("derecho"));
    botonSidebarIzquierdo.addEventListener("click",()=>togglePanelHorizontal("izquierdo"));
   elementosHover.forEach((elemento) => {
    elemento.addEventListener("touchstart", () => {
        const tooltip = elemento.querySelector(".tooltip");
        const rect = elemento.getBoundingClientRect(); //Da las medidas del elemento y su posición en pantalla
        const padding = 10;
        elemento.classList.add("hover-activo");

        // Posición base (centrado respecto al elemento)
        let left = rect.left + rect.width / 2;
        let top = rect.top;

        const tooltipRect = tooltip.getBoundingClientRect();

        // Calcular borde izquierdo real (restando la mitad del ancho del tooltip)
        let finalLeft = left - tooltipRect.width / 2;

        // Limitar por la izquierda
        if (finalLeft < padding) {
            finalLeft = padding;
        }

        // Limitar por la derecha
        if (finalLeft + tooltipRect.width > window.innerWidth - padding) {
            finalLeft = window.innerWidth - tooltipRect.width - padding;
        }

        // Aplicar posición final
        tooltip.style.left = finalLeft + "px";
        tooltip.style.top = top + "px";

    });


    elemento.addEventListener("touchend", () => {
        elemento.classList.remove("hover-activo");
    });
});
}

window.SidebarTablet = { inicializar };