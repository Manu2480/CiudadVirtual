/* ================================================
NOTICIAS MÓVIL
Modal con las últimas 5 noticias + carrusel sobre el mapa.

Responsabilidades:
  - Consultar ApiNoticias al inicializar y cada 30 min
  - Mostrar carrusel horizontal sobre el mapa
  - Abrir modal con detalle al tocar una noticia

Dependencias: ApiNoticias.js
================================================ */

let _articulos = [];

function inicializar() {
    _consultarNoticias();
    setInterval(_consultarNoticias, 30 * 60 * 1000);

    /* Conecta el botón del header — reintenta si aún no está en el DOM */
    function _conectarBtn() {
        const btn = document.getElementById("btn-noticias");
        if (btn) btn.addEventListener("click", _mostrarListaNoticias);
        else setTimeout(_conectarBtn, 200);
    }
    _conectarBtn();
}

/* Muestra un modal con la lista de las 5 noticias */
function _mostrarListaNoticias() {
    if (_articulos.length === 0) {
        window.Notificaciones?.mostrar("Noticias no disponibles aún.", "aviso");
        return;
    }

    let overlay = document.getElementById("noticias-lista-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "noticias-lista-overlay";
        overlay.style.cssText = `
            position:fixed; inset:0;
            background:rgba(0,0,0,0.55);
            z-index:1299; display:none;
        `;
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.style.display = "none";
            if (e.target === overlay) document.getElementById("noticias-lista-panel").style.display = "none";
        });
        document.body.appendChild(overlay);
    }

    let panel = document.getElementById("noticias-lista-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "noticias-lista-panel";
        panel.style.cssText = `
            position:fixed; top:50%; left:50%;
            transform:translate(-50%,-50%);
            width:90vw; max-width:420px; max-height:80vh;
            background:#fff; border-radius:16px;
            box-shadow:0 8px 32px rgba(0,0,0,0.25);
            z-index:1300; overflow-y:auto;
            display:none; flex-direction:column;
        `;
        document.body.appendChild(panel);
    }

    const items = _articulos.map((art, i) => `
        <div onclick="window.NoticiasMovil._abrirNoticia(${i})"
             style="display:flex;gap:12px;padding:14px 16px;
                    border-bottom:1px solid var(--color-borde);
                    cursor:pointer;align-items:flex-start;">
            ${art.urlToImage ? `
                <img src="${art.urlToImage}" alt=""
                     style="width:64px;height:48px;object-fit:cover;
                            border-radius:6px;flex-shrink:0;"
                     onerror="this.style.display='none'">` : ""}
            <div style="flex:1;min-width:0;">
                <p style="font-size:10px;font-weight:700;color:var(--color-primario);
                           text-transform:uppercase;margin-bottom:4px;">
                    ${art.source?.name || ""}
                </p>
                <p style="font-size:13px;font-weight:600;color:var(--color-texto);
                           line-height:1.4;
                           display:-webkit-box;-webkit-line-clamp:2;
                           -webkit-box-orient:vertical;overflow:hidden;">
                    ${art.title}
                </p>
            </div>
        </div>
    `).join("");

    panel.innerHTML = `
        <div style="padding:16px 16px 12px;border-bottom:1px solid var(--color-borde);
                    display:flex;align-items:center;justify-content:space-between;">
            <h3 style="font-size:16px;font-weight:700;color:var(--color-texto);margin:0;">
                <i class="fi fi-br-newspaper" style="color:var(--color-primario);margin-right:8px;"></i>
                Noticias
            </h3>
            <button onclick="document.getElementById('noticias-lista-overlay').style.display='none';
                             document.getElementById('noticias-lista-panel').style.display='none';"
                style="background:none;border:none;font-size:20px;cursor:pointer;
                       color:var(--color-texto-s);padding:4px;">✕</button>
        </div>
        ${items}
    `;

    overlay.style.display = "block";
    panel.style.display   = "flex";
}

function _consultarNoticias() {
    const api = new ApiNoticias();
    api.getNoticias()
        .then(res => {
            _articulos = (res.articles || [])
                .filter(a => a.title && a.title !== "[Removed]")
                .slice(0, 5);
            _renderizarCarrusel();
        })
        .catch(err => console.warn("NoticiasMovil: no disponibles.", err));
}

function _renderizarCarrusel() {
    const area = document.getElementById("area-mapa");
    if (!area || _articulos.length === 0) return;

    /* Elimina carrusel anterior si existe */
    area.querySelector(".noticias-movil")?.remove();

    const carrusel = document.createElement("div");
    carrusel.className = "noticias-movil";
    carrusel.setAttribute("aria-label", "Noticias");

    _articulos.forEach((art, i) => {
        const card = document.createElement("div");
        card.className = "noticia-card";
        card.innerHTML = `
            <p class="noticia-card__fuente">${art.source?.name || "Noticia"}</p>
            <p class="noticia-card__titulo">${art.title}</p>
        `;
        card.addEventListener("click", () => _mostrarModalNoticia(i));
        carrusel.appendChild(card);
    });

    area.appendChild(carrusel);
}

function _mostrarModalNoticia(indice) {
    const art = _articulos[indice];
    if (!art) return;

    let overlay = document.getElementById("noticia-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "noticia-overlay";
        overlay.style.cssText = `
            position:fixed; inset:0;
            background:rgba(0,0,0,0.55);
            z-index:1299; display:none;
        `;
        overlay.addEventListener("click", _cerrarModalNoticia);
        document.body.appendChild(overlay);
    }

    let panel = document.getElementById("noticia-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "noticia-panel";
        panel.style.cssText = `
            position:fixed; top:50%; left:50%;
            transform:translate(-50%,-50%);
            width:90vw; max-width:400px; max-height:80vh;
            background:#fff; border-radius:16px;
            box-shadow:0 8px 32px rgba(0,0,0,0.25);
            z-index:1300; overflow-y:auto;
            display:none; flex-direction:column;
        `;
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        ${art.urlToImage ? `
            <img src="${art.urlToImage}" alt="${art.title}"
                 style="width:100%;height:180px;object-fit:cover;border-radius:16px 16px 0 0;"
                 onerror="this.style.display='none'">` : ""}
        <div style="padding:20px;display:flex;flex-direction:column;gap:12px;">
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:0.5px;color:var(--color-primario);">
                ${art.source?.name || ""}
            </p>
            <h3 style="font-size:16px;font-weight:700;color:var(--color-texto);
                       line-height:1.4;margin:0;">
                ${art.title}
            </h3>
            ${art.description ? `
                <p style="font-size:13px;color:var(--color-texto-s);line-height:1.5;">
                    ${art.description}
                </p>` : ""}
            <div style="display:flex;gap:8px;margin-top:4px;">
                ${art.url ? `
                    <a href="${art.url}" target="_blank"
                       style="flex:1;padding:10px;background:var(--color-primario);
                              color:#fff;border-radius:8px;font-weight:600;
                              font-size:13px;text-align:center;text-decoration:none;">
                        Leer más
                    </a>` : ""}
                <button onclick="document.getElementById('noticia-overlay').style.display='none';
                                 document.getElementById('noticia-panel').style.display='none';"
                    style="flex:1;padding:10px;background:var(--color-fondo);
                           color:var(--color-texto);border:1px solid var(--color-borde);
                           border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">
                    Cerrar
                </button>
            </div>
        </div>
    `;

    overlay.style.display = "block";
    panel.style.display   = "flex";
}

function _cerrarModalNoticia() {
    document.getElementById("noticia-overlay").style.display = "none";
    document.getElementById("noticia-panel").style.display   = "none";
}

window.NoticiasMovil = { inicializar, mostrarLista: _mostrarListaNoticias, _abrirNoticia: _mostrarModalNoticia };