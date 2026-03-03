class ControladorStorage{
    static guardarCiudad(ciudad){
        let edificios = ciudad.terreno.edificios.map(obj => {
            return {
                tipo: obj.constructor.name,
                edificio: obj
            };
        });
        ciudad.terreno.edificios = edificios;
        CiudadStorage.guardar(ciudad);
    }

    static TipoClases = {
        Apartamento,
        Casa,
        CentroComercial,
        EstacionBombero,
        EstacionPolicia,
        Fabrica,
        Granja,
        Hospital,
        Parque,
        PlantaElectrica,
        PlantaHidraulica,
        Via
    }

    static cargarCiudad(){
        const datos = JSON.parse(CiudadStorage.cargar());
        let ciudadanos = this.obtenerCiudadanos(datos)
        let edificios = this.obtenerEdificios(datos);
        let terreno = new Terreno(datos.terreno.vias, edificios);
        let ciudad = new Ciudad(
            datos.nombre,
            datos.alcalde,
            datos.latitud,
            datos.longitud,
            datos.tiempoTurno,
            terreno,
            ciudadanos,
            datos.estadoRecursos
        )
        this.rehidratarCiudadanos(ciudad);
        return ciudad;
    }

    static obtenerCiudadanos(datos){
        let ciudadanos = datos.ciudadanos.map(c => 
            Ciudadano.fromData(c)
        );
        return ciudadanos;
    }

    static obtenerEdificios(datos){
        let edificios = datos.terreno.edificios.map(e => {
            const claseref = ControladorStorage.TipoClases[e.tipo];
            return claseref.fromData(e.edificio);
        })
        return edificios;
    }

    static rehidratarCiudadanos(ciudad){
        const MapaCiudadanos = new Map(ciudad.ciudadanos.map(c => [c.id, c]))

        ciudad.terreno.edificios.forEach(e => 
            e.ciudadanos = e.ciudadanos.map(id => {
                const objetoCiudadano = MapaCiudadanos.get(id.id);
                return objetoCiudadano;
            })
        )
    }
}