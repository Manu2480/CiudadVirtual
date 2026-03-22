/*
NOTICIAS DESKTOP
Panel de noticias en el sidebar derecho.
*/

function cargarNoticias(panel) {
    const api = new ApiNoticias();

    // Limpiar contenido (sin borrar el header)
    panel.querySelectorAll(".noticias-lista, p").forEach(e => e.remove());

    api.getNoticias()
        .then(res => {
            const articulos = res.articles || [];

            if (articulos.length === 0) {
                panel.insertAdjacentHTML("beforeend", `<p>Sin noticias</p>`);
                return;
            }

            const lista = document.createElement("div");
            lista.className = "noticias-lista";

            articulos.slice(0, 5).forEach(art => {
                const item = document.createElement("div");
                item.className = "noticia-item";
                item.innerHTML = `
                <div class="noticia-contenido">
                    <img src="${art.urlToImage || 'https://via.placeholder.com/150'}">
                    <p class="noticia-titulo">${art.title}</p>
                    <p class="noticia-descripcion">${art.description}</p>
                    <a href="${art.url}" target="_blank">${art.url}</a>
                    <p class="noticia-fecha">${new Date(art.publishedAt).toLocaleString()}</p>
                </div>`;
                lista.appendChild(item);
            });

            panel.appendChild(lista);
        })
        .catch(err => {
            console.error("Error al cargar noticias:", err);
            panel.insertAdjacentHTML("beforeend", `<p>No disponible temporalmente</p>`);
        });
}


function inicializar(reintentos = 0) {
    const panel = document.getElementById("panel-noticias");
    if (!panel || reintentos > 10) return;

    if (!window.Tablero?.Estado?.ciudad) {
        setTimeout(() => inicializar(reintentos + 1), 300);
        return;
    }

    // Crear header una sola vez
    panel.innerHTML = `
        <div class="modulo-header">
            <h2 class="panel__titulo">Noticias</h2>
        </div>
    `;

    // Primera carga inmediata
    cargarNoticias(panel);

    // 🔁 Actualizar cada 30 minutos
    setInterval(() => {
        console.log("Actualizando noticias...");
        cargarNoticias(panel);
    }, 30 * 60 * 1000); // 30 minutos
}

window.NoticiasDesktop = { inicializar };