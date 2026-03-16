/*
NOTICIAS DESKTOP
Panel de noticias en el sidebar derecho.
*/

function inicializar(reintentos = 0) {
    const panel = document.getElementById("panel-noticias");
    if (!panel || reintentos > 10) return; // Límite de seguridad

    // Comprobación de estado
    if (!window.Tablero?.Estado?.ciudad) {
        setTimeout(() => inicializar(reintentos + 1), 300);
        return;
    }

    const api = new ApiNoticias();
    
    // Preparar panel de forma limpia
    panel.innerHTML = `<div class="modulo-header"><h2 class="panel__titulo">Noticias</h2></div>`;

    api.getNoticias()
        .then(res => {
            const articulos = res.articles || [];
            if (articulos.length === 0) {
                panel.insertAdjacentHTML("beforeend", `<p>Sin noticias</p>`);
                return;
            }
            console.log("hola",articulos.length);
            const lista = document.createElement("div");
            lista.className = "noticias-lista"; // Estilos movidos a CSS

            articulos.slice(0, 5).forEach(art => {
                const item = document.createElement("div");
                item.className = "noticia-item"; // Usa CSS para el hover
                item.innerHTML = `<div class="noticia-contenido">
                    <img src="${art.urlToImage || 'https://via.placeholder.com/150'}" alt="Imagen de noticia" class="noticia-imagen">
                    <p class="noticia-titulo">${art.title}</p>
                    <p class="noticia-descripcion">${art.description}</p>
                    <a href="${art.url}" target="_blank" rel="noopener">${art.url}</a>
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

window.NoticiasDesktop = { inicializar };