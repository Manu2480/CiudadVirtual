(function() {
    const apiCoordenadas = new ApiCoordenadas();

    function obtenerCoordenadas(ciudad, departamento) {
        return apiCoordenadas.obtenerJsonCoordenadas(ciudad, departamento).then(json => {
            if (!json || json.length === 0) {
                throw new Error("No se encontraron los datos para el municipio seleccionado");
            }

            return new Coordenadas(json[0].lon, json[0].lat);
        });
    }

    window.CoordenadasService = {
        obtenerCoordenadas,
    };
})();
