/*
NOTICIAS DESKTOP
Panel de noticias en el sidebar derecho.
*/

function inicializar() {
    const panel = document.getElementById("panel-noticias");
    if (!panel) return;

    if (!window.Tablero?.Estado?.ciudad) {
        setTimeout(inicializar, 300);
        return;
    }

    const api = new ApiNoticias();

    api.getNoticias()
        .then(res => {
            const articulos = res.articles || [];

            panel.querySelector("h2")?.remove();
            panel.innerHTML = `<h2 class="panel__titulo">Noticias</h2>`;

            if (articulos.length === 0) {
                panel.insertAdjacentHTML("beforeend", `<p">Sin noticias</p>`);
                return;
            }

            const lista = document.createElement("div");
            lista.className = "noticias-lista";
            lista.style.cssText = "display: flex; flex-direction: column; gap: 8px;";

            articulos.slice(0, 5).forEach(art => {
                const item = document.createElement("div");
                item.innerHTML = `<a href="${art.url}" target="_blank">${art.title}</a>`;
                item.onmouseover = () => item.style.background = "#f0f0f0";
                item.onmouseout = () => item.style.background = "#f9f9f9";
                lista.appendChild(item);
            });

            panel.appendChild(lista);
        })
        .catch(err => {
            console.warn("NoticiasDesktop: no disponibles", err);
            panel.querySelector("h2")?.remove();
            panel.innerHTML = `<h2 class="panel__titulo">Noticias</h2><p>No disponible</p>`;
        });
}

window.NoticiasDesktop = { inicializar };