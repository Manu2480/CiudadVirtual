class Ciudad {

    constructor(nombre, alcalde, latitud, longitud, mapa, tiempoTurno) {

        if (nombre.length > 50) {
            throw new Error("El nombre de la ciudad no puede superar 50 caracteres");
        }

        if (alcalde.length > 50) {
            throw new Error("El nombre del alcalde no puede superar 50 caracteres");
        }

        this.nombre = nombre;
        this.alcalde = alcalde;
        this.latitud = latitud;
        this.longitud = longitud;
        this.mapa = mapa;
        this.tiempoTurno = tiempoTurno;

        this.ciudadanos = [];

        //El diccionario se inicializa con estos valores por defecto segun el enunciado
        this.estadoRecursos = {
            dinero: 50000,
            agua: 0,
            electricidad: 0,
            alimento: 0,
            felicidad: 0
        };
    }

    // El método modificarRecurso se encarga de modificar la cantidad de un recurso específico en el estado de recursos de la ciudad.
    // Recibe dos parámetros: tipo, que es el tipo de recurso a modificar (por ejemplo, "dinero", "agua", etc.), y cantidad, que es 
    // la cantidad a agregar o restar al recurso. Si el tipo de recurso no es válido (es decir, no existe en el estado de recursos), se lanza un error. De lo contrario, se actualiza la cantidad del recurso correspondiente sumando la cantidad proporcionada.
    modificarRecurso(tipo, cantidad) {

        if (!(tipo in this.estadoRecursos)) {
            throw new Error("Recurso no válido");
        }

        this.estadoRecursos[tipo] += cantidad;
    }

    getRecurso(tipo) {
        return this.estadoRecursos[tipo];
    }

    //Crear Ciudadano
    // NECESITO LA CLASE TERRENO PARA HACER LAS VALIDACIONES CORRESPONDIENTES DE LAS CONDICIONES PARA CREAR UN CIUDADANO


    // Agrega un ciudadano a la ciudad. Recibe un objeto ciudadano como parámetro y lo agrega al arreglo de ciudadanos de la ciudad.
    agregarCiudadano(ciudadano) {
        this.ciudadanos.push(ciudadano);
    }



}