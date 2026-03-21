const api = new ApiNoticias(); //Se crea la api de noticias
//se obtienen los paneles de noticias de los dos modos
let panelVertical = document.getElementById("panel-noticias-tablet-vertical");
let panelHorizontal = document.getElementById("panel-noticias-tablet-horizontal");

function inicializar() {
    llamarNoticias() //Se llaman las noticias
    llamadoConIntervalo(); //Se inicia a llamar las noticias cada 30 minutos
}

function llamarNoticias() {
    /*Objetivo: llamar y renderizar las noticias */
    const articulos = api.getNoticias() //Se llaman los artículos
    //api.getNoticias().then((articulos) => {
        if (articulos && articulos.articles) {//Se confirma que se obtuvo respuesta, y que además existen artículos dentro del json
            const noticias = articulos.articles; //Se seleccionan las noticias

            renderizarNoticias(noticias, panelVertical);
            renderizarNoticias(noticias, panelHorizontal);

            console.log("Noticias cargadas:", noticias);
        } else {
            console.warn("No se encontraron artículos en la respuesta de noticias.");
        }
    //})
    //.catch(error => {
        //console.error("Error al obtener noticias:", error);
    //});
}
function llamadoConIntervalo(){
    setInterval(llamarNoticias(),1800000)
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
        panel.innerHTML += `<div class="noticia-tablet">
            <div class="titular-noticia">
            <img class="foto-noticia" src="${imagenUrl}" alt="foto noticia"></img>
            <h2 class="panel__titulo noticia">${noticia.title}</h2>
            </div>
            <p class="descripcion-noticia">${noticia.description}</p>
            <a href="${noticia.url}">ver noticia completa</a>
        </div>`
        
    });
    panel.innerHTML += '</div>'
}
window.NoticiasTablet = {inicializar};
