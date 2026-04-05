class ControladorStorage{
    static cargarEstadoTablero(){
        const raw = CiudadStorage.cargar();
        if (!raw) return null;

        const datos = JSON.parse(raw);

        const filasRaw = datos.terreno?.vias;
        const vias = (Array.isArray(filasRaw) && filasRaw.length > 0)
            ? filasRaw
            : Array.from({ length: 15 }, () => Array(15).fill(0));

        const terreno = new Terreno(vias, []);

        (datos.terreno?.edificios ?? []).forEach(ed => {
            if (!ed?.ubicacion) return;
            const idCatalogo = IdNormalizador.normalizar(ed.id);
            const def        = Edificios.obtener(idCatalogo);
            if (!def) { console.warn("ControladorStorage: sin definición para", ed.id); return; }

            const instancia = Edificaciones._crearInstancia
                ? Edificaciones._crearInstancia(idCatalogo, ed.ubicacion.fila, ed.ubicacion.columna, def)
                : null;
            if (!instancia) return;

            if (Array.isArray(ed.ciudadanos)) instancia.ciudadanos = ed.ciudadanos;
            if (ed.recursosEdificio) instancia.recursosEdificio = ed.recursosEdificio;
            terreno.edificios.push(instancia);

            if (def.categoria === "pavimentaria") {
                terreno.vias[ed.ubicacion.fila][ed.ubicacion.columna] = 1;
            }
        });

        const estadoRecursos = datos.estadoRecursos ?? {
            dinero: 50000, agua: 0, electricidad: 0, alimento: 0, felicidad: 0,
        };

        const historicoRecursos = datos.historicoRecursos ?? [];
        const ciudad = new Ciudad(
            datos.nombre      || "Mi Ciudad",
            datos.alcalde     || "Alcalde",
            datos.latitud     ?? 0,
            datos.longitud    ?? 0,
            datos.tiempoTurno ?? 30000,
            terreno,
            [],
            estadoRecursos,
            historicoRecursos,
            datos.recursosPorCiudadano
        );

        if (datos.genero) ciudad.genero = datos.genero;
        if (Array.isArray(datos.ciudadanos)) {
            datos.ciudadanos.forEach(c => ciudad.crearCiudadano(c));
        }

        // Reasigna en los edificios las mismas instancias de ciudadanos que viven en ciudad.ciudadanos.
        this.rehidratarCiudadano(ciudad);

        ciudad.fecha = (typeof datos.fecha === "string" && datos.fecha.trim())
            ? datos.fecha
            : new Date().toISOString().split("T")[0];
        
        ciudad.ciudadanosPorTurno = datos.ciudadanosPorTurno;

        const catalogo = Array.isArray(datos.catalogo) ? datos.catalogo : [];
        catalogo.forEach((edificio) => {
            if (!edificio?.id || typeof edificio.catalogoInfo !== "object" || !edificio.catalogoInfo) return;
            Object.entries(edificio.catalogoInfo).forEach(([recurso, valor]) => {
                Edificios.modificarRecursoEdificio(edificio.id, recurso, valor);
            });
        });

        return {
            ciudad,
            filas: ciudad.terreno?.vias?.length || 15,
            columnas: ciudad.terreno?.vias?.[0]?.length || 15,
            turno: datos.turno ?? 0,
        };
    }

    static guardarEstadoTablero(ciudad, turno){
        if (!ciudad) return;
        const datosCompletos = JSON.parse(JSON.stringify(ciudad));
        datosCompletos.turno = turno ?? 0;
        datosCompletos.fecha = (typeof ciudad.fecha === "string" && ciudad.fecha.trim())
            ? ciudad.fecha
            : new Date().toISOString().split("T")[0];

        const recursosEdificio = Edificios.todos();
        const catalogoSerializado = recursosEdificio.map(e => ({
            id: e.id,
            catalogoInfo: e.clase.catalogoInfo,
        }));

        datosCompletos.catalogo = catalogoSerializado;
        CiudadStorage.guardar(datosCompletos);
        return datosCompletos;
    }

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
        let recursosEdificio = Edificios.todos();

        //Serializamos tambien el catalogo para los constructores
        const catalogoSerializado = recursosEdificio.map(e => ({
            id: e.id,
            catalogoInfo: e.clase.catalogoInfo
        }));
        ciudadCopia.catalogo = catalogoSerializado;
        ciudadCopia.ciudadanosPorTurno = ciudad.ciudadanosPorTurno;
        console.log("Iniciando el guardado de la copia de la ciudad");
        console.log(ciudadCopia);
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
        console.log("Cargando ciudad desde ControladorStorage")
        //Llamado de métodos
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
            datos.historicoRecursos,
            datos.recursosPorCiudadano
        )
        ciudad.ciudadanosPorTurno = datos.ciudadanosPorTurno;
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
    static rehidratarCiudadano(ciudad){
        if (!ciudad || !Array.isArray(ciudad.ciudadanos) || !ciudad.terreno || !Array.isArray(ciudad.terreno.edificios)) {
            return;
        }

        //Se genera un mapa de ciudadanos con pares clave, valor
        const MapaCiudadanos = new Map(ciudad.ciudadanos.map(c => [c.id, c]));

        //Por cada edificio lee la lista de ciudadanos y compara el id para volver a asignar las instancias
        ciudad.terreno.edificios.forEach(e => {
            if (!Array.isArray(e.ciudadanos)) return;

            e.ciudadanos = e.ciudadanos.map(refCiudadano => {
                const id = (refCiudadano && typeof refCiudadano === "object")
                    ? refCiudadano.id
                    : refCiudadano;

                return MapaCiudadanos.get(id) || refCiudadano;
            });
        });
    }

    //Compatibilidad hacia atrás con llamadas existentes
    static rehidratarCiudadanos(ciudad){
        this.rehidratarCiudadano(ciudad);
    }

    static cargarCatalogo(){
        
    }
}