(function() {
    function _esArticuloValido(articulo) {
        return Boolean(articulo?.title && articulo.title !== "[Removed]");
    }

    function obtenerNoticias({ limite = 5 } = {}) {
        const api = new ApiNoticias();

        return api.getNoticias().then(respuesta => {
            const articulos = respuesta?.articles || [];
            return articulos.filter(_esArticuloValido).slice(0, limite);
        });
    }

    window.NoticiasService = {
        obtenerNoticias,
    };
})();