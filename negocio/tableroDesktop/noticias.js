/*
NOTICIAS DESKTOP
Panel de noticias en el sidebar derecho.
*/

function cargarNoticias(panel) {
    // Limpiar contenido (sin borrar el header)
    panel.querySelectorAll(".noticias-lista, p").forEach(e => e.remove());

    NoticiasService.obtenerNoticias({ limite: 5 })
        .then(articulos => {

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


function inicializar() {
    ActualizacionesPeriodicas.esperarConReintentos({
        condicion: () => {
            const panel = document.getElementById("panel-noticias");
            return Boolean(panel && window.Tablero?.Estado?.ciudad);
        },
        alCumplir: () => {
            const panel = document.getElementById("panel-noticias");
            if (!panel) return;

            // Crear header una sola vez
            panel.innerHTML = `
                <div class="modulo-header">
                    <h2 class="panel__titulo">Noticias</h2>
                </div>
            `;

            ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
                id: "noticias:desktop",
                accion: () => cargarNoticias(panel),
                intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_NOTICIAS,
                ejecutarAhora: true,
            });
        },
        maxIntentos: 10,
        delayMs: ActualizacionesPeriodicas.INTERVALOS_MS.REINTENTO_CORTO,
    });
}

window.NoticiasDesktop = { inicializar };