class ControladorStorage{
    static guardarCiudad(ciudad){
        // Creee una copia para no modificar el objeto original
        const ciudadCopia = JSON.parse(JSON.stringify(ciudad));
        
        // Serializar edificios con sus tipos
        // Serializar es empacar el objeto para poder guardarlo
        let edificios = ciudad.terreno.edificios.map(obj => {
            return {
                tipo: obj.constructor.name,
                edificio: JSON.parse(JSON.stringify(obj))
            };
        });
        // Asignamos la lista serializada a los edificios de la copia de ciudad
        ciudadCopia.terreno.edificios = edificios;
        CiudadStorage.guardar(ciudadCopia);
    }

    //Se genera un objeto que contiene cada uno de los tipos de edificios
    //Se usa para la reconstrucción de la ciudad al cargarla
    static TipoClases = {
        Apartamento,
        Casa,
        CentroComercial,
        EstacionBombero,
        EstacionPolicia,
        Fabrica,
        Granja,
        Hospital,
        Tienda,
        Parque,
        PlantaElectrica,
        PlantaHidraulica,
        Via
    }

    //Método encargado de la reconstrucción de la ciudad.
    static cargarCiudad(){
        //Llamaddo de métodos
        const datos = JSON.parse(CiudadStorage.cargar());
        let ciudadanos = this.obtenerCiudadanos(datos)
        let edificios = this.obtenerEdificios(datos);
        let terreno = new Terreno(datos.terreno.vias, edificios);
        //Construcción de la ciudad
        let ciudad = new Ciudad(
            datos.nombre,
            datos.alcalde,
            datos.latitud,
            datos.longitud,
            datos.tiempoTurno,
            terreno,
            ciudadanos,
            datos.estadoRecursos,
            datos.historicoRecursos
        )
        //Se realiza la rehidratación de los ciudadanos
        this.rehidratarCiudadanos(ciudad);
        return ciudad;
    }

    //Método para cargar los ciudadanos desde el local storage
    static obtenerCiudadanos(datos){
        let ciudadanos = datos.ciudadanos.map(c => 
            Ciudadano.fromData(c)
        );
        return ciudadanos;
    }

    //Método para la reconstrucción de los edificios con su respectivo tipo(clase)
    static obtenerEdificios(datos){
        //En esta parte se usa el objeto TipoClases para saber a que clase hace referencia
        let edificios = datos.terreno.edificios.map(e => {
            const claseref = ControladorStorage.TipoClases[e.tipo];
            return claseref.fromData(e.edificio);
        })
        return edificios;
    }

    //Se encarga de guardar los ciudadanos de ciudad en cada uno de sus respectivos edificios
    static rehidratarCiudadanos(ciudad){
        //Se genera un mapa de ciudadanos con pares clave, valor
        const MapaCiudadanos = new Map(ciudad.ciudadanos.map(c => [c.id, c]))
        //Por cada edificio lee la lista de ciudadanos y compara el id para volver a asignar las instancias
        ciudad.terreno.edificios.forEach(e => 
            e.ciudadanos = e.ciudadanos.map(id => {
                const objetoCiudadano = MapaCiudadanos.get(id.id);
                return objetoCiudadano;
            })
        )
    }
}