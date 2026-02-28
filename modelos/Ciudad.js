//IMPORTAMOS  
const Ciudadano = require("./Ciudadano");
class Ciudad {

    constructor(nombre, alcalde, latitud, longitud, tiempoTurno, terreno, ciudadanos, estadoRecursos) {

        this.nombre = nombre;
        this.alcalde = alcalde;
        this.latitud = latitud;
        this.longitud = longitud;
        this.tiempoTurno = tiempoTurno; //Debe estar en milisegundos para usarlo con setInterval

        
        this.terreno = terreno;
        this.ciudadanos = ciudadanos;
        this.estadoRecursos = estadoRecursos;
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

    //Modificar tiempo del turno nuevoTiempo debe estar en milisegundos
    modificarTiempoTurno(nuevoTiempo) {
        if (nuevoTiempo <= 0) {
            throw new Error("El tiempo del turno debe ser un número positivo");
        }
        this.tiempoTurno = nuevoTiempo;
    }

    // El método asignarFelicidadInicial se encarga de aumentar la felicidad del ciudadano creado en función de la infraestructura presente en el terreno.
    // y llama el metodo calcularFelicidad de ciudadano para actualizar su nivel de felicidad individualmente. 
    asignarFelicidadInicial(idCiudadano) {
        const felicidadInfraestructura = this.terreno.felicidadPorInfraestructura(); // Obtiene la felicidad total proporcionada por la infraestructura en el terreno
        this.ciudadanos.forEach(ciudadano => {
            if (ciudadano.id === idCiudadano) {
                ciudadano.calcularFelicidad(felicidadInfraestructura);
            }
        });
    }

    calcularFelicidadPromedio(){
        let felicidad = 0;
        this.ciudadanos.forEach(ciudadano => {
            felicidad += ciudadano.felicidad;
        });
        felicidad = felicidad / this.ciudadanos.length;
        //actualiza el recurso de felicidad con el nuevo valor promedio usando el metodo modificarRecurso para mantener la consistencia en la forma de actualizar los recursos
        this.modificarRecurso("felicidad", felicidad - this.estadoRecursos.felicidad); //le resta la felicidad anterior ya que se sumara en el metodo
    }

    // Metodo que valida si estan las condiciones necesarias para crear un ciudadano
    // Si no se cumplen las condiciones, se lanza un error indicando que no se pueden crear más ciudadanos y el motivo
    aumentarPoblacion() {

        console.log("Entro al metodo de aumentar población")

        //dentro tienen el totalDisponibles(contador) y edificios(array edificios)
        const viviendas = this.terreno.viviendasDisponibles();
        console.log(viviendas.totalDisponibles);
        const empleos = this.terreno.empleosDisponibles();

        // valido si hay viviendad disponible, si no hay, no se pueden crear mas ciudadanos
        if (viviendas.totalDisponibles <= this.ciudadanos.length){
            console.log("No se pueden crear más ciudadanos, no hay viviendas disponibles.");
            return false;
        // valido si hay empleos disponibles, si no hay, no se pueden crear mas ciudadanos
        } else if (empleos.totalDisponibles <= this.ciudadanos.length){
            console.log("No se pueden crear más ciudadanos, no hay empleos disponibles.");
            return false;
        //valido si la felicidad es mayor a 60, si no lo es, no se pueden crear mas ciudadanos por enunciado
        } else if (this.ciudadanos.length > 1 && this.estadoRecursos.felicidad < 60){
            console.log("No se pueden crear más ciudadanos, no se alcanzo el nivel requerido de felicidad. Puedes construir parques para aumentar la felicidad de tus ciudadanos");
            return false;
        } else{
            return true; //indica que se pueden crear mas ciudadanos
        }
    }


    static contador = 0;
    // Crea un nuevo ciudadano y se agrega 
    crearCiudadano(x,y,z) {

        console.log("entro al metodo de crear ciudadano")

        Ciudad.contador += 1;
        const idCiudadano = "ciudadano" + Ciudad.contador;

        // Agrega un ciudadano a la ciudad. Recibe un objeto ciudadano como parámetro y lo agrega al arreglo de ciudadanos de la ciudad.
        const nuevoCiudadano = new Ciudadano(idCiudadano, null, null, null, null);
        this.ciudadanos.push(nuevoCiudadano);

        // Obtengo los edificios con empleos y viviendad
        //dentro tienen el totalDisponibles(contador) y edificios(array edificios)
        const viviendas = this.terreno.viviendasDisponibles();
        const empleos = this.terreno.empleosDisponibles();

        console.log(viviendas.edificios);
        console.log(empleos.edificios);

        //Asigno una vivienda disponible al nuevo ciudadano
        viviendas.edificios[0].ciudadanos.push(nuevoCiudadano); //agrega el nuevo ciudadano al primer edificio con disponibilidad de vivienda
        nuevoCiudadano.vivienda = true; //actualiza el atributo de vivienda del ciudadano a true para que pueda calcular su felicidad correctamente

        //Asigno un empleo disponible al nuevo ciudadano
        empleos.edificios[0].ciudadanos.push(nuevoCiudadano); //agrega el nuevo ciudadano al primer edificio con disponibilidad de empleo
        nuevoCiudadano.empleo = true; //actualiza el atributo de empleo del ciudadano a true para que pueda calcular su felicidad correctamente

        this.asignarFelicidadInicial(nuevoCiudadano.id); //calcula la felicidad del nuevo ciudadano con el nivel de felicidad actual de la ciudad

        nuevoCiudadano.consumoCiudadano = {
            agua: x,
            electricidad: y,
            alimento: z
        };

        
    }

    // Metodo que modificar los recursos segun el consumo de los ciudadanos, se llama una vez en cada turno
    consumoCiudadanos() {
        this.ciudadanos.forEach(ciudadano => {
            let consumo = ciudadano.consumoCiudadano;
            for (const recurso in consumo) {
                // Suma (porque asumimos que el recurso esta en negativo al ser de consumo)
                // el consumo del ciudadano al recurso correspondiente en la ciudad
                this.modificarRecurso(recurso, consumo[recurso]); 
            }
        });
    }

    // Metodo que calcula los recursos proporcionados o gastados por los edificios, se llama una vez en cada turno
    recursosPorEdificios() {
        this.terreno.edificios.forEach(edificio => {
            let recursos = edificio.recursosEdificio;
            for (const recurso in recursos) {
                // suma(producción)/resta(consumo) el recurso correspondiente 
                this.modificarRecurso(recurso, consumo[recurso]);
                //VALIDAR QUE SI ES UNA PLANTA Y NO HAY ELECTRICIDAD NO SE PRODUZCA AGUA 
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

    // Metodo que se encarga de ejecutar todas las acciones necesarias para avanzar un turno en el juego, 
    // como consumir recursos por parte de los ciudadanos, calcular los recursos proporcionados o gastados
    // por los edificios, y aumentar la población si se cumplen las condiciones necesarias.
    ejecutarTurno(){
        //En cada turno se calcula nuevamente la felicidad inicial (hace referencia a la infraestructura que aumenta la felicidad)
        //Ya que pueden haber estructuras nuevas o eliminadas que afectan la felicidad y la condición de vivienda y empleo de los ciudadanos.
        this.ciudadanos.forEach (ciudadano =>{
            ciudadano.this.asignarFelicidadInicial(ciudadano.id)
        });
        this.calcularFelicidadPromedio();
        this.consumoCiudadanos();
        this.recursosPorEdificios();
        //añadir metodo para asignar viveinda y empleo en caso de ser necesario
        let contador = 0;
        while (this.aumentarPoblacion() && contador < 3) {
            this.crearCiudadano(x, y, z); //ejemplo de consumo para cada ciudadano
            contador += 1; 
        };
    }
    
    // Metodo para validar si se puede jugar otro turno o si se acaba el juego
    pasarTurno(){

        if (this.recursosNegativos().length > 0) {
            console.log("Game Over. Recursos negativos");
            return false; // Indica que el juego ha terminado
        }else {
            return true; // Indica que podemos pasar al siguiente turno
        }

    }

    // Metodo para ejecutar un turno cada x tiempo
    iniciarSimulacion() {

        console.log("entro al metodo iniciarSimulacion")

        //Condicional para evitar que se inicie la simulación si ya está corriendo, lo que podría 
        //causar múltiples intervalos ejecutándose al mismo tiempo y generar resultados inesperados.
        if (this.intervalo) return; // ya está corriendo
        this.intervalo = setInterval(() => {
            if (this.pasarTurno()){ //si no hay recursos negativos se puede ejecutar un nuevo turno
                this.ejecutarTurno();
            } else {
                this.detenerSimulacion();//en caso de que no se pueda ejecutar el turno se detiene la simulación
            }
        }, this.tiempoTurno);
    }

    // Metodo para detener la simulación.
    detenerSimulacion() {
        clearInterval(this.intervalo);
        this.intervalo = null;
    }

}

//exportamos la clase para poder usarla en main.js
module.exports = Ciudad;