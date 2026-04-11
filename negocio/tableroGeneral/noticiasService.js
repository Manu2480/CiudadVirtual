(function() {
    const apiNoticias = new ApiNoticias();

    function _esArticuloValido(articulo) {
        return Boolean(articulo?.title && articulo.title !== "[Removed]");
    }

    function obtenerNoticias({ limite = 5 } = {}) {
        return apiNoticias.getNoticiasAPI().then(respuesta => {
            const articulos = respuesta?.articles || [];
            return articulos
                .filter(_esArticuloValido)
                .slice(0, limite)
                .map(articulo => new Noticias(articulo.title, articulo.description, articulo.url, articulo.urlToImage, articulo.publishedAt));
        });
    }

    window.NoticiasService = {
        obtenerNoticias,
    };
})();