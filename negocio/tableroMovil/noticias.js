/* ================================================
NOTICIAS MÓVIL
Carrusel horizontal de noticias sobre el mapa.

Responsabilidad:
  - Consultar ApiNoticias una vez que Tablero esté listo
  - Construir e inyectar el carrusel de cards
    dentro de #area-mapa

Dependencias: tablero.js, apiNoticias.js
================================================ */

function inicializar() {
    const area = document.getElementById("area-mapa");
    if (!area) return;

    /* Espera a que Tablero.Estado.ciudad esté disponible */
    if (!window.Tablero?.Estado?.ciudad) {
        setTimeout(inicializar, 300);
        return;
    }

    const api = new ApiNoticias();

    api.getNoticias()
        .then(res => {
            const articulos = res.articles || [];
            if (articulos.length === 0) return;

            const carrusel = document.createElement("div");
            carrusel.className = "noticias-movil";
            carrusel.setAttribute("aria-label", "Noticias");

            articulos.forEach(art => {
                const card = document.createElement("div");
                card.className = "noticia-card";
                card.innerHTML = `
                    <p class="noticia-card__titulo">${art.title || "Sin título"}</p>
                    <p>${art.description || ""}</p>
                `;
                carrusel.appendChild(card);
            });

            area.appendChild(carrusel);
        })
        .catch(err => console.warn("NoticiasMovil: no disponibles.", err));
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.NoticiasMovil = { inicializar };