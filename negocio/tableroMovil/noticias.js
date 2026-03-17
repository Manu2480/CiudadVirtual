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

/* ── Inicialización ── */

function inicializar() {
    _consultarNoticias();
    setInterval(_consultarNoticias, 30 * 60 * 1000);

    function _conectarBtn() {
        const btn = document.getElementById("btn-noticias");
        if (btn) btn.addEventListener("click", () => abrirCarrusel(0));
        else setTimeout(_conectarBtn, 200);
    }
    _conectarBtn();
}

/* ── Consulta API ── */

function _consultarNoticias() {
    const api = new ApiNoticias();
    api.getNoticias()
        .then(res => {
            _articulos = (res.articles || [])
                .filter(a => a.title && a.title !== "[Removed]")
                .slice(0, 5);
        })
        .catch(err => console.warn("NoticiasMovil: no disponibles.", err));
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

function _renderizarNoticia() {
    const art    = _articulos[_indiceActual];
    const cuerpo = document.getElementById("noticias-cuerpo");
    const dots   = document.getElementById("noticias-dots");
    if (!art || !cuerpo) return;

    cuerpo.innerHTML = `
        ${art.urlToImage ? `
            <img class="noticias-modal__imagen"
                 src="${art.urlToImage}" alt="${art.title}"
                 onerror="this.style.display='none'">` : ""}
        <div class="noticias-modal__contenido">
            <p class="noticias-modal__fuente">${art.source?.name || ""}</p>
            <h4 class="noticias-modal__noticia-titulo">${art.title}</h4>
            ${art.description ? `
                <p class="noticias-modal__descripcion">${art.description}</p>` : ""}
            ${art.url ? `
                <a class="noticias-modal__leer-mas"
                   href="${art.url}" target="_blank" rel="noopener">
                    Leer artículo completo
                </a>` : ""}
        </div>
    `;

    /* Puntos indicadores */
    dots.innerHTML = _articulos.map((_, i) => `
        <span class="noticias-modal__dot ${i === _indiceActual ? "activo" : ""}"></span>
    `).join("");

    /* Vuelve al inicio del cuerpo al cambiar noticia */
    cuerpo.scrollTop = 0;
}

/* ── Navegación ── */

function _navegar(delta) {
    _indiceActual = (_indiceActual + delta + _articulos.length) % _articulos.length;
    _renderizarNoticia();
}

/* ── API pública ── */

function abrirCarrusel(indice = 0) {
    if (_articulos.length === 0) {
        window.Notificaciones?.mostrar("Noticias no disponibles aún.", "aviso");
        return;
    }
    _construirModal();
    _indiceActual = indice;
    _renderizarNoticia();
    document.getElementById("noticias-overlay").classList.add("abierto");
}

function cerrarCarrusel() {
    document.getElementById("noticias-overlay")?.classList.remove("abierto");
}

/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.NoticiasMovil = {
    inicializar,
    abrirCarrusel,
    cerrarCarrusel,
    ocultarCarrusel: cerrarCarrusel,   /* alias para tabs.js */
    mostrarCarrusel: () => abrirCarrusel(0),
};