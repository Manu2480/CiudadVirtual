const apiNoticias = new ApiNoticias(); //Se crea la api de noticias
//se obtienen los paneles de noticias de los dos modos
let panelNoticiasVertical = document.getElementById("panel-noticias-tablet-vertical");
let panelNoticiasHorizontal = document.getElementById("panel-noticias-tablet-horizontal");

function inicializar() {
    // Primera carga inmediata
    llamarNoticias();
    
    // 🔁 Actualizar cada 30 minutos
    setInterval(llamarNoticias, 1800000);
}

function llamarNoticias() {
    /*Objetivo: llamar y renderizar las noticias */
    apiNoticias.getNoticias().then((articulos) => {
        if (articulos && articulos.articles) {//Se confirma que se obtuvo respuesta, y que además existen artículos dentro del json
            const noticias = articulos.articles; //Se seleccionan las noticias

            renderizarNoticias(noticias, panelNoticiasVertical);
            renderizarNoticias(noticias, panelNoticiasHorizontal);

            console.log("Noticias cargadas:", noticias);
        } else {
            console.warn("No se encontraron artículos en la respuesta de noticias.");
        }
    })
    .catch(error => {
        console.error("Error al obtener noticias:", error);
    });
}
function renderizarNoticias(noticias,panel){
    if (!panel) {
        console.warn("No se encontró el contenedor panel-noticias-tablet");
        return;
    }
    
    // Opcional: limpiar antes de agregar
    panel.innerHTML = '<h2 class="panel__titulo">Noticias</h2>';

    panel.innerHTML += '<div class="seccion-noticias-tablet">'
    
    noticias.forEach(noticia => {
        const imagenUrl = noticia.urlToImage ? noticia.urlToImage : '../../media/inicio/logo.png';
        const fechaISO = noticia.publishedAt; //la fecha en el formato que entrega la api, ej: "2026-02-27T15:30:11Z"
        const fecha = new Date(fechaISO); //paso la fecha al formato humano
        const opciones = { //Expreso el formato en el que voy a mostrar la fecha, abajito en el toLocaleString lo muestro ya con estas convenciones
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        panel.innerHTML += `<div class="noticia-tablet">
            <div class="titular-noticia">
            <img class="foto-noticia" src="${imagenUrl}" alt="foto noticia"></img>
            <h2 class="panel__titulo noticia">${noticia.title}</h2>
            </div>
            <p class="fecha-noticia">${fecha.toLocaleString('es-CO',opciones)}</p>
            <p class="descripcion-noticia">${noticia.description}</p>
            <a href="${noticia.url}">ver noticia completa</a>
        </div>`
        
    });
    panel.innerHTML += '</div>'
}
window.NoticiasTablet = {inicializar, llamarNoticias};
