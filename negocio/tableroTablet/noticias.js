async function inicializar() {
    try {
        const api = new ApiNoticias();
        const articulos = await api.getNoticias(); // espera a que fetch termine
        if (articulos && articulos.articles) {
            const noticias = articulos.articles;       // ahora sí existe
            renderizarNoticias(noticias);
            console.log("Noticias cargadas:", noticias);
        } else {
            console.warn("No se encontraron artículos en la respuesta de noticias.");
        }
    } catch (error) {
        console.error("Error al obtener noticias:", error);
    }
}

function renderizarNoticias(noticias){
    const panelNoticias = document.getElementById("panel-noticias-tablet");
    if (!panelNoticias) {
        console.warn("No se encontró el contenedor panel-noticias-tablet");
        return;
    }
    
    // Opcional: limpiar antes de agregar
    panelNoticias.innerHTML = '<h2 class="panel__titulo">Noticias</h2>';

    panelNoticias.innerHTML += '<div class="seccion-noticias-tablet">'
    
    noticias.forEach(noticia => {
        const imagenUrl = noticia.urlToImage ? noticia.urlToImage : '../../media/inicio/logo.png';
        panelNoticias.innerHTML += `<div class="noticia-tablet">
            <div class="titular-noticia">
            <img class="foto-noticia" src="${imagenUrl}" alt="foto noticia"></img>
            <h2 class="panel__titulo noticia">${noticia.title}</h2>
            </div>
            <p class="descripcion-noticia">${noticia.description}</p>
            <a href="${noticia.url}">ver noticia completa</a>
        </div>`
        
    });
    panelNoticias.innerHTML += '</div>'
}
window.NoticiasTablet = {inicializar};
