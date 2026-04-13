/* ================================================
NOTICIAS MÓVIL
Modal carrusel — una noticia a la vez, navegable.

Responsabilidades:
  - Consultar ApiNoticias al inicializar y cada 30 min
  - Abrir modal carrusel al pulsar btn-noticias del header
  - Navegar entre noticias con botones anterior / siguiente

Dependencias: ApiNoticias.js
================================================ */

let _articulos    = [];
let _indiceActual = 0;
let _paneles = [];
let btnNoticiasMovil;
/* ── Inicialización ── */

function inicializar() {
    const vistaActual = document.documentElement.getAttribute("data-vista");

    if (vistaActual == "movil"){
        _inicializarNoticiasMovil();
    }
    else if (vistaActual == "tablet"){
        _inicializarNoticiasTablet();
    }
    else if (vistaActual == "desktop"){
        _inicializarNoticiasDesktop();
    }
    ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
        id: "noticias",
        accion: _consultarNoticias,
        intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_NOTICIAS,
        ejecutarAhora: true,
    });
}
function _inicializarNoticiasMovil(){
    _conectarBtn();
}
function _inicializarNoticiasTablet(){
    let panelNoticiasVertical = document.getElementById("panel-noticias-tablet-vertical");
    let panelNoticiasHorizontal = document.getElementById("panel-noticias-tablet-horizontal");
    _paneles.push(panelNoticiasHorizontal);
    _paneles.push(panelNoticiasVertical)
}
function _inicializarNoticiasDesktop(){
    const panelDesktop = document.getElementById("panel-noticias");
    _paneles.push(panelDesktop);
}
function _actualizarContenidoPaneles(){
    if (_paneles.length > 0){
        _paneles.forEach(panel => {
            _renderizarPanelNoticias(panel);
        });
    }
}
function _conectarBtn() {
    btnNoticiasMovil = document.getElementById("btn-noticias");
    if (btnNoticiasMovil) btnNoticiasMovil.addEventListener("click", () => abrirCarrusel(0));
    else setTimeout(_conectarBtn, 200);
}
/* ── Consulta API ── */

function _consultarNoticias() {
    NoticiasService.obtenerNoticias({ limite: 5 })
        .then(articulos => {
            _articulos = articulos;
            _actualizarContenidoPaneles();
        })
        .catch(err => {
            console.error("Error al cargar noticias:", err);
        });
}

/* ── Construcción del modal (solo una vez) ── */

function _construirModal() {
    if (document.getElementById("noticias-overlay")) return;

    /* Overlay */
    const overlay = document.createElement("div");
    overlay.id = "noticias-overlay";
    overlay.className = "noticias-overlay";
    overlay.addEventListener("click", e => {
        if (e.target === overlay) cerrarCarrusel();
    });

    /* Modal */
    const modal = document.createElement("div");
    modal.id = "noticias-modal";
    modal.className = "noticias-modal";

    modal.innerHTML = `
        <div class="noticias-modal__header">
            <h3 class="noticias-modal__titulo">
                <i class="fi fi-br-newspaper"></i> Noticias
            </h3>
            <button class="noticias-modal__cerrar" id="noticias-btn-cerrar"
                    aria-label="Cerrar">✕</button>
        </div>

        <div class="noticias-modal__cuerpo" id="noticias-cuerpo"></div>

        <div class="noticias-modal__nav">
            <button class="noticias-modal__btn-nav" id="noticias-btn-prev" aria-label="Anterior">
                <i class="fi fi-br-angle-left"></i>
            </button>
            <div class="noticias-modal__dots" id="noticias-dots"></div>
            <button class="noticias-modal__btn-nav" id="noticias-btn-next" aria-label="Siguiente">
                <i class="fi fi-br-angle-right"></i>
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    /* Eventos de navegación */
    document.getElementById("noticias-btn-cerrar")
        .addEventListener("click", cerrarCarrusel);
    document.getElementById("noticias-btn-prev")
        .addEventListener("click", () => _navegar(-1));
    document.getElementById("noticias-btn-next")
        .addEventListener("click", () => _navegar(1));
}

/* ── Renderizado de la noticia actual ── */

function _renderizarNoticiaMovil() {
    const art    = _articulos[_indiceActual];
    const cuerpo = document.getElementById("noticias-cuerpo");
    const dots   = document.getElementById("noticias-dots");
    if (!art || !cuerpo) return;

    cuerpo.innerHTML = _htmlNoticia(art);
            
    //para evitar imágenes rotas, oculta la imagen si no carga correctamente
    const img = cuerpo.querySelector(".noticias-modal__imagen");
    if (img) img.addEventListener("error", () => img.classList.add("oculta"));

    /* Puntos indicadores */
    dots.innerHTML = _articulos.map((_, i) => `
        <span class="noticias-modal__dot ${i === _indiceActual ? "activo" : ""}"></span>
    `).join("");

    /* Vuelve al inicio del cuerpo al cambiar noticia */
    cuerpo.scrollTop = 0;
}
function _renderizarPanelNoticias(panel){
    panel.innerHTML = '<h2 class="panel__titulo modulo-header">Noticias</h2>';
    panel.innerHTML += '<div class="seccion-noticias">'
    _articulos.forEach(articulo => {
        panel.insertAdjacentHTML("beforeend", _htmlNoticia(articulo));
    });
    panel.innerHTML += "</div>";
    if (_articulos.length == 0){
        panel.insertAdjacentHTML("beforeend", `<p>Sin noticias</p>`);
    }

}

function _htmlNoticia(articulo){
    return(`
        ${articulo.urlToImage ? `
            <img class="noticias-modal__imagen"
                src="${articulo.urlToImage}" alt="${articulo.title}">` : ""}
        <div class="noticias-modal__contenido">
            <p class="noticias-modal__fuente">${articulo.source?.name || ""}</p>
            ${articulo.publishedAt ? `
                <p class="noticias-modal__fecha">${new Date(articulo.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>` : ""}
            <h4 class="noticias-modal__noticia-titulo">${articulo.title}</h4>
            ${articulo.description ? `
                <p class="noticias-modal__descripcion">${articulo.description}</p>` : ""}
            ${articulo.url ? `
                <a class="noticias-modal__leer-mas"
                href="${articulo.url}" target="_blank" rel="noopener">
                    Leer artículo completo
                </a>` : ""}
        </div>
    `);
}

/* ── Navegación ── */

function _navegar(delta) {
    _indiceActual = (_indiceActual + delta + _articulos.length) % _articulos.length;
    _renderizarNoticiaMovil();
}

/* ── API pública ── */

function abrirCarrusel(indice = 0) {
    if (_articulos.length === 0) {
        window.Notificaciones?.mostrar("Noticias no disponibles aún.", "aviso");
        return;
    }
    _construirModal();
    _indiceActual = indice;
    _renderizarNoticiaMovil();
    document.getElementById("noticias-overlay").classList.add("abierto");
}

function cerrarCarrusel() {
    document.getElementById("noticias-overlay")?.classList.remove("abierto");
}

/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.PanelNoticias = {
    inicializar,
    abrirCarrusel,
    cerrarCarrusel,
    ocultarCarrusel: cerrarCarrusel,   /* alias para tabs.js */
    mostrarCarrusel: () => abrirCarrusel(0),
};