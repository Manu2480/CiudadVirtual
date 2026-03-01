// IMPORTACIONES: este archivo utiliza módulos comunes de Node.js.
// El símbolo "class" es una sintaxis ES6 para declarar clases, que
// son funciones especiales con un constructor y métodos asociados.
// Más abajo exportamos la clase con module.exports para poder instanciarla
// desde otros archivos (como main.js).
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

        // sólo sumamos una vez; el console.log no debe volver a modificar el valor
        this.estadoRecursos[tipo] += cantidad;
        console.log(`Se modificó el recurso: ${tipo} -> ${this.estadoRecursos[tipo]}`);
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
        // si no hay ciudadanos no toca nada
        if (this.ciudadanos.length === 0) return;

        // sumamos las felicidades individuales (deben haberse calculado previamente)
        let total = 0;
        this.ciudadanos.forEach(ciudadano => {
            total += ciudadano.felicidad || 0;
        });

        let promedio = total / this.ciudadanos.length;

        // actualizo el recurso con la diferencia respecto al valor anterior
        this.modificarRecurso("felicidad", promedio - this.estadoRecursos.felicidad);
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
                if (recurso != "felicidad"){
                    this.modificarRecurso(recurso, recursos[recurso]);
                }
                //VALIDAR QUE SI ES UNA PLANTA Y NO HAY ELECTRICIDAD NO SE PRODUZCA AGUA 
            }
        });
    }

    // Metodo que valida si están las condiciones necesarias para crear un ciudadano
    // Si no se cumplen las condiciones, devuelve false y escribe en consola el motivo
    aumentarPoblacion() {

        // obtenemos la disponibilidad de viviendas y empleos
        const viviendas = this.terreno.viviendasDisponibles();
        const empleos = this.terreno.empleosDisponibles();

        // 1. debe haber al menos una vivienda libre
        if (viviendas.totalDisponibles <= 0) {
            console.log("No se pueden crear más ciudadanos, no hay viviendas disponibles.");
            return false;
        }

        // 2. debe haber al menos un empleo libre
        if (empleos.totalDisponibles <= 0) {
            console.log("No se pueden crear más ciudadanos, no hay empleos disponibles.");
            return false;
        }

        // 3. la felicidad promedio de la ciudad debe ser mayor a 60
        // calculamos el promedio solo si ya hay al menos un ciudadano (evita división por cero)
        if (this.ciudadanos.length > 0) {
            this.calcularFelicidadPromedio();
            if (this.estadoRecursos.felicidad < 60) {
                console.log("No se pueden crear más ciudadanos, no son lo suficientemente felices (felicidad < 60). Construye infraestructura que aumente la felicidad.");
                return false;
            }
        }

        // si todas las validaciones pasaron, se pueden añadir más ciudadanos
        return true;
    }

    asignarInfraestructuras(){
        //Asignar vivienda y empleo a ciudadanos que no tengan en caso de ser necesario
        this.ciudadanos.forEach(ciudadano =>{
            if ((ciudadano.vivienda == false) || (ciudadano.vivienda == null)){
                this.asignarVivienda(ciudadano);
                console.log(`ciudadano: ${ciudadano.id} - Felicidad: ${ciudadano.felicidad}, Vivienda: ${ciudadano.vivienda}`);
            } else {
                console.log("no hay ciudadanos sin hogar")
            }
            if ((ciudadano.empleo == false) || (ciudadano.empleo == null)){
                this.asignarEmpleo(ciudadano);
                console.log(`ciudadano: ${ciudadano.id} - Felicidad: ${ciudadano.felicidad}, Empleo: ${ciudadano.empleo}`);
            } else {
                console.log("no hay ciudadanos sin empleo")
            }
        });
    }

    static contador = 0;
    // Crea un nuevo ciudadano y se agrega 
    crearCiudadano(x,y,z) {

        Ciudad.contador += 1;
        const idCiudadano = "ciudadano" + Ciudad.contador;

        // Agrega un ciudadano a la ciudad. Recibe un objeto ciudadano como parámetro y lo agrega al arreglo de ciudadanos de la ciudad.
        const nuevoCiudadano = new Ciudadano(idCiudadano, null, null, null, null);
        this.ciudadanos.push(nuevoCiudadano);

        // Intentamos asignar vivienda y empleo al nuevo ciudadano
        this.asignarVivienda(nuevoCiudadano);
        this.asignarEmpleo(nuevoCiudadano);

        nuevoCiudadano.consumoCiudadano = {
            agua: x,
            electricidad: y,
            alimento: z
        };

        console.log(`[OK] ${nuevoCiudadano.id} creado - Felicidad: ${nuevoCiudadano.felicidad}, Vivienda: ${nuevoCiudadano.vivienda}, Empleo: ${nuevoCiudadano.empleo}`);
    }

    // Asigna vivienda disponible a un ciudadano específico (si hay)
    asignarVivienda(ciudadano) {
        // Viviendas tendra 2 atributos: 1totalDisponibles numero de viviendas dispo y 2edificios estructuras donde hay dispo
        const viviendas = this.terreno.viviendasDisponibles();
        if (viviendas.edificios.length > 0) {
            // Le asignamos la primer vivienda dispo por defecto
            viviendas.edificios[0].agregarPersona(ciudadano);
            ciudadano.vivienda = true; // cambiamos el estado del ciudadano
            this.asignarFelicidadInicial(ciudadano.id); //calcula la felicidad del ciudadano
            this.calcularFelicidadPromedio();
            console.log(`[OK] ${ciudadano.id} asignado a vivienda en ${viviendas.edificios[0].id}`);
            return true;
        } else {
            console.log(`[ERROR] ${ciudadano.id} no pudo ser asignado a vivienda (sin disponibilidad)`);
            return false;
        }
    }

    // Asigna empleo disponible a un ciudadano específico (si hay) Funciona igualq ue viviendas
    asignarEmpleo(ciudadano) {
        const empleos = this.terreno.empleosDisponibles();
        if (empleos.edificios.length > 0) {
            empleos.edificios[0].agregarPersona(ciudadano);
            ciudadano.empleo = true;
            this.asignarFelicidadInicial(ciudadano.id); //calcula la felicidad del ciudadano
            this.calcularFelicidadPromedio();
            console.log(`[OK] ${ciudadano.id} asignado a empleo en ${empleos.edificios[0].id}`);
            return true;
        } else {
            console.log(`[ERROR] ${ciudadano.id} no pudo ser asignado a empleo (sin disponibilidad)`);
            return false;
        }
    }

    // Valida los recursos negativos por turno para terminar el juego y hacer penalizaciones
    recursosNegativos() {

        let negativos = [];
        for (const [recurso, valor] of Object.entries(this.estadoRecursos)) {
            if (valor < 0) {
                negativos.push(recurso);
            }
        }
        return negativos;
    }

    // Metodo que se encarga de ejecutar todas las acciones necesarias para avanzar un turno en el juego
    ejecutarTurno(){
        console.log("\n========== EJECUTANDO TURNO ==========");
        
        // 1. Actualizar felicidad inicial según infraestructura (ya se usa en el método calcularFelicidadPromedio).
        console.log("\n--- Calculando felicidad ---");
        this.ciudadanos.forEach(ciudadano => {
            this.asignarFelicidadInicial(ciudadano.id);
        });
        this.calcularFelicidadPromedio();
        console.log(`Felicidad promedio de la ciudad: ${this.estadoRecursos.felicidad.toFixed(2)}`);
        
        // 2. Validar si hay ciudadanos sin empleo o vivienda y asignarselos en caso de que se pueda
        this.asignarInfraestructuras();
        
        // 3. (no es necesario recalcular aquí, ya se hará al inicio del siguiente turno)
        
        // 4. Consumo de ciudadanos
        console.log("\n--- Consumo de ciudadanos ---");
        this.consumoCiudadanos();
        
        // 5. Producción/Consumo de edificios
        console.log("\n--- Producción/Consumo de edificios ---");
        this.recursosPorEdificios();
        
        // 6. Intentar crear nuevos ciudadanos
        console.log("\n--- Intento de creación de ciudadanos ---");
        let contador = 1;
        while (this.aumentarPoblacion() && contador <= 3) {
            this.crearCiudadano(-1, -1, -1);
            contador++; 
        }
        console.log(`Se crearon ${this.ciudadanos.length} nuevos ciudadanos`);
        console.log("\n========== FIN DEL TURNO ==========");
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