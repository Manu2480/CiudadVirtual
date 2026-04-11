(function() {
    const apiColombia = new ApiColombia();

    function obtenerDepartamentos() {
        return apiColombia.getJsonDepartamentos().then(departamentos => {
            return departamentos.map(dep => new Colombia(dep.name, dep.id));
        });
    }

    function obtenerCiudadesDepartamento(idDepartamento) {
        return apiColombia.getJsonCiudades(idDepartamento).then(ciudades => {
            return ciudades.map(ciudad => new Colombia(ciudad.name, ciudad.id));
        });
    }

    window.ColombiaService = {
        obtenerDepartamentos,
        obtenerCiudadesDepartamento,
    };
})();
