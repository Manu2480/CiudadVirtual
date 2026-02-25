class Ciudad {

    constructor(nombre, alcalde, latitud, longitud, tiempoTurno, ciudadanos, estadoRecursos) {

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
        this.mapa = new Terreno(vias, mapa, edificios);
        this.tiempoTurno = tiempoTurno;

        this.ciudadanos = ciudadanos;
        estadoRecursos = estadoRecursos;

        //El diccionario se inicializa con estos valores por defecto segun el enunciado
        //this.estadoRecursos = {
            //dinero: 50000,
            //agua: 0,
            //electricidad: 0,
            //alimento: 0,
            //felicidad: 0
        //};
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

    // El método asignarFelicidadInicial se encarga de aumentar la felicidad del ciudadano creado en función de la infraestructura presente en el mapa.
    // y llama el metodo calcularFelicidad de ciudadano para actualizar su nivel de felicidad individualmente. 
    asignarFelicidadInicial(idCiudadano) {
        const felicidadInfraestructura = this.mapa.felicidadPorInfraestructura(); // Obtiene la felicidad total proporcionada por la infraestructura en el mapa
        this.ciudadanos.forEach(ciudadano => {
            if (ciudadano._id === idCiudadano) {
                ciudadano.calcularFelicidad(felicidadInfraestructura);
            }
        });
    }

    calcularFelicidadPromedio(){
        let felicidad = 0;
        this.ciudadanos.forEach(ciudadano => {
            felicidad += ciudadano._felicidad;
        });
        felicidad = felicidad / this.ciudadanos.length;
        //actualiza el recurso de felicidad con el nuevo valor promedio usando el metodo modificarRecurso para mantener la consistencia en la forma de actualizar los recursos
        this.modificarRecurso("felicidad", felicidad - this.estadoRecursos.felicidad); //le resta la felicidad anterior ya que se sumara en el metodo
    }

    // Metodo que valida si estan las condiciones necesarias para crear un ciudadano, 
    // Si se cumplen las condiciones, se crea un nuevo ciudadano y se agrega 
    // a la ciudad. Si no se cumplen las condiciones, se lanza un error indicando que no se pueden crear más ciudadanos y el motivo
    crearCiudadano(x,y,z) {

        //dentro tienen el totalDisponibles(contador) y edificios(array edificios)
        const viviendas = this.mapa.viviendasDisponibles();
        const empleos = this.mapa.empleosDisponible();

        // valido si hay viviendad disponible, si no hay, no se pueden crear mas ciudadanos
        if (viviendas.totalDisponibles <= this.ciudadanos.length){
            throw new Error("No se pueden crear más ciudadanos, no hay viviendas disponibles.");
        // valido si hay empleos disponibles, si no hay, no se pueden crear mas ciudadanos
        } else if (empleos.totalDisponibles <= this.ciudadanos.length){
            throw new Error("No se pueden crear más ciudadanos, no hay empleos disponibles.");
        //valido si la felicidad es mayor a 60, si no lo es, no se pueden crear mas ciudadanos por enunciado
        } else if (this.ciudadanos.length > 1 && this.estadoRecursos.felicidad < 60){
            throw new Error("No se pueden crear más ciudadanos, no se alcanzo el nivel requerido de felicidad.");
        } else{
            // Agrega un ciudadano a la ciudad. Recibe un objeto ciudadano como parámetro y lo agrega al arreglo de ciudadanos de la ciudad.
            const nuevoCiudadano = new Ciudadano(this.ciudadanos.length + 1);
            this.ciudadanos.push(nuevoCiudadano);

            //Asigno una vivienda disponible al nuevo ciudadano
            viviendas.edificios[0].ciudadanos.push(nuevoCiudadano); //agrega el nuevo ciudadano al primer edificio con disponibilidad de vivienda
            nuevoCiudadano._vivienda = true; //actualiza el atributo de vivienda del ciudadano a true para que pueda calcular su felicidad correctamente

            //Asigno un empleo disponible al nuevo ciudadano
            empleos.edificios[0].ciudadanos.pusg(nuevoCiudadano); //agrega el nuevo ciudadano al primer edificio con disponibilidad de empleo
            nuevoCiudadano._empleo = true; //actualiza el atributo de empleo del ciudadano a true para que pueda calcular su felicidad correctamente

            this.asignarFelicidadInicial(nuevoCiudadano._id); //calcula la felicidad del nuevo ciudadano con el nivel de felicidad actual de la ciudad

            nuevoCiudadano._consumoCiudadano = {
                agua: x,
                electricidad: y,
                alimento: z
            };

        }
        
    }

    // Metodo que modificar los recursos segun el consumo de los ciudadanos, se llama una vez en cada turno
    consumoCiudadanos() {
        this.ciudadanos.forEach(ciudadano => {
            let consumo = ciudadano._consumoCiudadano;
            for (const recurso in consumo) {
                // Suma (porque asumimos que el recurso esta en negativo al ser de consumo)
                // el consumo del ciudadano al recurso correspondiente en la ciudad
                this.modificarRecurso(recurso, consumo[recurso]); 
            }
        });
    }

    // Metodo que calcula los recursos proporcionados o gastados por los edificios, se llama una vez en cada turno
    recursosPorEdificios() {
        this.mapa._edificios.forEach(edificio => {
            let recursos = edificio.recursosEdificio;
            for (const recurso in recursos) {
                // suma(producción)/resta(consumo) el recurso correspondiente 
                this.modificarRecurso(recurso, consumo[recurso]); 
            }
        });

    }

    // Metodo para saber si hay recursos negativos lo que indica gameover y penitencias en la puntuación final
    recursosNegativos() {

        let negativos = [];
        for (const [recurso, valor] of Object.entries(this.estadoRecursos)) {
            if (valor < 0) {
                negativos.push(recurso);
            }
        }
        return negativos;
    }

    pasarTurno(){

        if (this.recursosNegativos().length > 0) {
            console.log("Game Over. Recursos negativos");
            return false; // Indica que el juego ha terminado
        }else {
            return true; // Indica que podemos pasar al siguiente turno
        }

    }



}