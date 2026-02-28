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
        // this.ciudadanos es un arreglo; .length obtiene su tamaño.
        if (this.ciudadanos.length === 0) {
            // no hay ciudadanos, no modificamos el recurso de felicidad
            return;
        }

        // Ejemplo de uso de arrow function en forEach: c => { ... }
        let felicidad = 0;
        this.ciudadanos.forEach(ciudadano => {
            felicidad += ciudadano.felicidad;
        });
        felicidad = felicidad / this.ciudadanos.length;
        //actualiza el recurso de felicidad con el nuevo valor promedio usando el metodo modificarRecurso para mantener la consistencia en la forma de actualizar los recursos
        this.modificarRecurso("felicidad", felicidad - this.estadoRecursos.felicidad); //le resta la felicidad anterior ya que se sumara en el metodo
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


    static contador = 0;
    // Crea un nuevo ciudadano y se agrega 
    crearCiudadano(x,y,z) {

        Ciudad.contador += 1;
        const idCiudadano = "ciudadano" + Ciudad.contador;

        // Agrega un ciudadano a la ciudad. Recibe un objeto ciudadano como parámetro y lo agrega al arreglo de ciudadanos de la ciudad.
        const nuevoCiudadano = new Ciudadano(idCiudadano, null, null, null, null);
        this.ciudadanos.push(nuevoCiudadano);

        // Obtengo los edificios con empleos y viviendad
        //dentro tienen el totalDisponibles(contador) y edificios(array edificios)
        const viviendas = this.terreno.viviendasDisponibles();
        const empleos = this.terreno.empleosDisponibles();

        //Asigno una vivienda disponible al nuevo ciudadano usando el método de edificio
        if (viviendas.edificios.length > 0) {
            viviendas.edificios[0].agregarPersona(nuevoCiudadano);
            nuevoCiudadano.vivienda = true; //actualiza el atributo de vivienda del ciudadano a true para que pueda calcular su felicidad correctamente
        }

        //Asigno un empleo disponible al nuevo ciudadano usando el método de edificio
        if (empleos.edificios.length > 0) {
            empleos.edificios[0].agregarPersona(nuevoCiudadano);
            nuevoCiudadano.empleo = true; //actualiza el atributo de empleo del ciudadano a true para que pueda calcular su felicidad correctamente
        }

        this.asignarFelicidadInicial(nuevoCiudadano.id); //calcula la felicidad del nuevo ciudadano con el nivel de felicidad actual de la ciudad

        nuevoCiudadano.consumoCiudadano = {
            agua: x,
            electricidad: y,
            alimento: z
        };

        console.log(`✓ ${nuevoCiudadano.id} creado - Felicidad: ${nuevoCiudadano.felicidad}, Vivienda: ${nuevoCiudadano.vivienda}, Empleo: ${nuevoCiudadano.empleo}`);
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
                this.modificarRecurso(recurso, recursos[recurso]);
                //VALIDAR QUE SI ES UNA PLANTA Y NO HAY ELECTRICIDAD NO SE PRODUZCA AGUA 
            }
        });
    }

    // Metodo que intenta asignar vivienda o empleo a ciudadanos que no tengan
    asignarViviendaOEmpleos() {
        console.log("\n--- Asignando viviendas y empleos ---");
        
        // Asignar viviendas a ciudadanos sin vivienda
        // filter crea un nuevo arreglo con los elementos que cumplen la
        // condición. Aquí c => !c.vivienda es otra arrow function que devuelve
        // true si el ciudadano no tiene casa.
        let sinVivienda = this.ciudadanos.filter(c => !c.vivienda);
        if (sinVivienda.length > 0) {
            sinVivienda.forEach(ciudadano => {
                const viviendas = this.terreno.viviendasDisponibles();
                if (viviendas.edificios.length > 0) {
                    // Remover el ciudadano de cualquier edificio anterior (en caso de reasignacion)
                    this.terreno.edificios.forEach(e => {
                        if (e.ciudadanos && e.ciudadanos.includes(ciudadano)) {
                            e.ciudadanos = e.ciudadanos.filter(c => c !== ciudadano);
                        }
                    });
                    // Agregar a nuevo edificio
                    viviendas.edificios[0].agregarPersona(ciudadano);
                    ciudadano.vivienda = true;
                    // Aquí usamos un template literal de nuevo para componer el
                    // mensaje con el id del ciudadano y el id del edificio.
                    console.log(`[OK] ${ciudadano.id} asignado a vivienda en ${viviendas.edificios[0].id}`);
                } else {
                    console.log(`[ERROR] ${ciudadano.id} no pudo ser asignado a vivienda (sin disponibilidad)`);
                }
            });
        }
        
        // Asignar empleos a ciudadanos sin empleo
        let sinEmpleo = this.ciudadanos.filter(c => !c.empleo);
        if (sinEmpleo.length > 0) {
            sinEmpleo.forEach(ciudadano => {
                const empleos = this.terreno.empleosDisponibles();
                if (empleos.edificios.length > 0) {
                    // Remover el ciudadano de cualquier edificio anterior (en caso de reasignacion)
                    this.terreno.edificios.forEach(e => {
                        if (e.ciudadanos && e.ciudadanos.includes(ciudadano)) {
                            e.ciudadanos = e.ciudadanos.filter(c => c !== ciudadano);
                        }
                    });
                    // Agregar a nuevo edificio
                    empleos.edificios[0].agregarPersona(ciudadano);
                    ciudadano.empleo = true;
                    console.log(`[OK] ${ciudadano.id} asignado a empleo en ${empleos.edificios[0].id}`);
                } else {
                    console.log(`[ERROR] ${ciudadano.id} no pudo ser asignado a empleo (sin disponibilidad)`);
                }
            });
        }
    }
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
        
        // 1. Actualizar felicidad inicial según infraestructura
        console.log("\n--- Calculando felicidad ---");
        this.ciudadanos.forEach (ciudadano =>{
            this.asignarFelicidadInicial(ciudadano.id);
        });
        this.calcularFelicidadPromedio();
        console.log(`Felicidad promedio de la ciudad: ${this.estadoRecursos.felicidad.toFixed(2)}`);
        
        // 2. Asignar vivienda y empleo a ciudadanos que no tengan
        this.asignarViviendaOEmpleos();
        
        // 3. Actualizar felicidad después de nuevas asignaciones
        this.ciudadanos.forEach (ciudadano =>{
            this.asignarFelicidadInicial(ciudadano.id);
        });
        this.calcularFelicidadPromedio();
        
        // 4. Consumo de ciudadanos
        console.log("\n--- Consumo de ciudadanos ---");
        this.consumoCiudadanos();
        console.log(`Total ciudadanos consumiendo: ${this.ciudadanos.length}`);
        
        // 5. Producción de edificios
        console.log("\n--- Producción de edificios ---");
        this.recursosPorEdificios();
        console.log(`Total edificios produciendo: ${this.terreno.edificios.length}`);
        
        // 6. Intentar crear nuevos ciudadanos
        console.log("\n--- Intento de creación de ciudadanos ---");
        let contador = 0;
        while (this.aumentarPoblacion() && contador < 3) {
            this.crearCiudadano(-1, -1, -1);
            contador++; 
        }
        console.log(`Se crearon ${contador} nuevos ciudadanos`);
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