(function() {
    function calcularRuta({ mapa, inicio, fin }) {
        return ApiRuta.calcularRuta({ mapa, inicio, fin })
            .then(data => {
                const route = Array.isArray(data?.route) ? data.route : [];
                return new Ruta(true, route, "", false);
            })
            .catch(err => {
                const error = err?.responseData?.error || err?.message || "No se pudo calcular la ruta.";
                const networkError = !err?.responseData;
                return new Ruta(false, [], error, networkError);
            });
    }

    window.RutaService = {
        calcularRuta,
    };
})();
