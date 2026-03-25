
class Ciudad {
    recursosPorEdificioPredeterminado = [
        {
            id: "via",
            recursos: {
                dinero: -50,
                electricidad: 0,
                agua: 0,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            id: "casa",
            recursos: {
                dinero: -50,
                electricidad: -3,
                agua: -3,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            id: "apartamento",
            recursos: {
                dinero: -50,
                electricidad: -15,
                agua: -10,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            id: "tienda",
            recursos: {
                dinero: 500,
                electricidad: -8,
                agua: 0,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            recursos: {
                dinero: 2000,
                electricidad: -25,
                agua: 0,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            id: "fabrica",
            recursos: {
                dinero: 800,
                electricidad: -20,
                agua: -15,
                alimentos: 0,
            },
            felicidad:0
        },
        {
            id: "granja",
            recursos: {
                dinero: -50,
                electricidad: 0,
                agua: -10,
                alimentos: 50,
            },
            felicidad:0
        },

        {
            id: "hospital",
            recursos: {
                dinero: -50,
                electricidad: -20,
                agua: -10,
                alimentos: 0
            },
            felicidad:0
        },
        {
            id: "bombero",
            recursos: {
                dinero: -50,
                electricidad: -15,
                agua: 0,
                alimentos: 0,
            },
            felicidad:10
        },
        {
            id: "policia",
            recursos: {
                dinero: -50,
                electricidad: -15,
                agua: 0,
                alimentos: 0,
            },
            felicidad:0
        },
        {   id: "parque",
            recursos: {
                dinero: -50,
                electricidad: 0,
                agua: 0,
                alimentos: 0,
            },
            felicidad:5
        },
        {
            id: "planta-electrica",
            recursos: {
                dinero: -50,
                electricidad: 200,
                agua: 0,
                alimentos: 0,
            },
            felicidad:0
        },
        {   
            id: "planta-hidraulica",
            recursos: {
                dinero: -50,
                electricidad: -20,
                agua: 150,
                alimentos: 0,
            },
            felicidad:0
        }
    ]

    constructor(nombre, alcalde, latitud, longitud, tiempoTurno, terreno, ciudadanos, estadoRecursos, historicoRecursos) {

        this.nombre = nombre;
        this.alcalde = alcalde;
        this.latitud = latitud;
        this.longitud = longitud;
        this.tiempoTurno = tiempoTurno; //Debe estar en milisegundos para usarlo con setInterval

        
        this.terreno = terreno;
        this.ciudadanos = ciudadanos;
        this.estadoRecursos = estadoRecursos;
        this.historicoRecursos = historicoRecursos;
        if (!historicoRecursos){
            this.historicoRecursos = [];
        }
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

    // Costo de mantenimiento por turno (dinero) basado en edificios activos
    aplicarCostoMantenimiento() {
        const edificios = this.terreno.edificios || [];
        const cantidadEdificios = edificios.filter(e => !String(e.id || "").toLowerCase().startsWith("via")).length;
        const costoPorEdificio = 50; // monto fijo por turno
        const costoTotal = cantidadEdificios * costoPorEdificio;

        if (costoTotal > 0) {
            console.log(`Aplicando costo de mantenimiento: ${cantidadEdificios} edificios × ${costoPorEdificio} = ${costoTotal}`);
            this.modificarRecurso("dinero", -costoTotal);
        }
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
    // Crea un nuevo ciudadano y se agrega. Acepta dos modos:
    // - llamada normal: crearCiudadano(x, y, z) donde x/y/z son consumos
    // - carga desde JSON: crearCiudadano(obj) donde obj es un objeto con campos guardados
    crearCiudadano(x,y,z) {

        // Modo carga: si el primer argumento es un objeto con id -> cargar objeto ya hecho
        // Verificamos si x es un objeto serializado (proviene de JSON) y contiene un `id`.
        if (typeof x === 'object' && x !== null && x.id) {
            // Guardamos una referencia clara a los datos entrantes
            const data = x; // data es el objeto plano (por ejemplo, lo parseado desde JSON)

            // Creamos una instancia real de Ciudadano usando el método fromData
            const nuevoCiudadano = Ciudadano.fromData(data); // fromData devuelve una instancia con métodos y estructura correcta

            // Validar formato del id: debe cumplir 'ciudadano' seguido de dígitos
            const idStr = String(nuevoCiudadano.id || '');
            const match = idStr.match(/^ciudadano(\d+)$/);
            let n = match ? parseInt(match[1], 10) : NaN;

            // Si id no válido o no viene, asignar un id nuevo y único
            if (Number.isNaN(n)) {
                Ciudad.contador += 1;
                nuevoCiudadano.id = `ciudadano${Ciudad.contador}`;
                n = Ciudad.contador;
                console.log(`[WARN] id inválido o ausente en datos; reasignado a ${nuevoCiudadano.id}`);
            }

            // Evitar colisiones: si ya existe un ciudadano con el mismo id en esta ciudad, reasignar
            const existe = this.ciudadanos.some(ch => ch.id === nuevoCiudadano.id);
            if (existe) {
                Ciudad.contador += 1;
                nuevoCiudadano.id = `ciudadano${Ciudad.contador}`;
                n = Ciudad.contador;
                console.log(`[WARN] id duplicado detectado; reasignado a ${nuevoCiudadano.id}`);
            }

            // Añadimos la instancia cargada al array de ciudadanos de la ciudad
            this.ciudadanos.push(nuevoCiudadano);

            // sincronizar contador para evitar colisiones futuras (si el id numérico es mayor)
            if (!Number.isNaN(n) && n > Ciudad.contador) Ciudad.contador = n;

            console.log(`[OK] ${nuevoCiudadano.id} cargado - Felicidad: ${nuevoCiudadano.felicidad}, Vivienda: ${nuevoCiudadano.vivienda}, Empleo: ${nuevoCiudadano.empleo}`);

            return nuevoCiudadano;
        }

        // Modo creación normal (nuevos ciudadanos generados en el juego)
        Ciudad.contador += 1;
        const idCiudadano = "ciudadano" + Ciudad.contador;

        // crear con valores por defecto (constructor maneja felicidad/vivienda/empleo)
        const nuevoCiudadano = new Ciudadano(idCiudadano);
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
        return nuevoCiudadano;
    }

    /*
    // Crea una instancia de Ciudad a partir de un objeto plano (JSON)
    static fromData(obj) {
        if (obj instanceof Ciudad) return obj;

        // Cargar terreno: reutilizamos Terreno.crearInfraestructura que acepta objetos JSON
        const Terreno = require('./Terreno');
        const vias = obj.terreno?.vias || [];
        const terreno = new Terreno(vias, []);

        // Construir ciudad con listas vacías; luego cargamos edificios y ciudadanos
        const nombre = obj.nombre || '';
        const alcalde = obj.alcalde || '';
        const latitud = obj.latitud ?? 0;
        const longitud = obj.longitud ?? 0;
        const tiempoTurno = obj.tiempoTurno ?? 1000;
        const estadoRecursos = obj.estadoRecursos || { dinero: 0, agua: 0, electricidad: 0, alimento: 0, felicidad: 0 };

        const ciudad = new Ciudad(nombre, alcalde, latitud, longitud, tiempoTurno, terreno, [], estadoRecursos);

        // Cargar edificios desde JSON (si existen). Cada edificio JSON debe tener ubicacion.fila/columna
        if (Array.isArray(obj.terreno?.edificios)) {
            for (const ed of obj.terreno.edificios) {
                const fila = ed.ubicacion?.fila ?? ed.ubicacion?.row ?? 0;
                const columna = ed.ubicacion?.columna ?? ed.ubicacion?.col ?? 0;
                ciudad.terreno.crearInfraestructura(fila, columna, ed);
            }
        }

        // Cargar ciudadanos usando crearCiudadano (acepta objetos JSON y sincroniza contadores)
        if (Array.isArray(obj.ciudadanos)) {
            for (const c of obj.ciudadanos) {
                ciudad.crearCiudadano(c);
            }
        }

        // Sincronizar contador de Ciudad si viene un valor mayor en los datos
        if (Array.isArray(obj.ciudadanos) && obj.ciudadanos.length > 0) {
            const maxN = obj.ciudadanos.reduce((max, it) => {
                const m = parseInt(String(it.id || '').replace(/^ciudadano/, ''), 10);
                return Number.isNaN(m) ? max : Math.max(max, m);
            }, 0);
            if (maxN > Ciudad.contador) Ciudad.contador = maxN;
        }

        return ciudad;
    }*/

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
        //Object.entries() en JavaScript convierte un objeto en un array de pares [clave, valor] 
        //propios y enumerables. Facilita la iteración sobre las propiedades de un objeto al 
        //transformarlo en una estructura de array, permitiendo el uso de métodos como map() o forEach()
        for (const [recurso, valor] of Object.entries(this.estadoRecursos)) {
            if (valor < 0) {
                negativos.push(recurso);
            }
        }
        return negativos;
    }
    guardarRecursos(){
        if (!this.historicoRecursos){
            this.historicoRecursos = [];
        }
        if (this.historicoRecursos.length >= 20){
            this.historicoRecursos = this.historicoRecursos.slice(1); //El array nuevo empieza desde la posición 1, para así evitar exceder los 20
        }
        this.historicoRecursos.push(this.estadoRecursos);
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

        // 5.b Costo de mantenimiento por edificio (dinero)
        this.aplicarCostoMantenimiento();
        
        // 6. Intentar crear nuevos ciudadanos
        console.log("\n--- Intento de creación de ciudadanos ---");
        let contador = 1;
        while (this.aumentarPoblacion() && contador <= 3) {
            this.crearCiudadano(-1, -2, -3);
            contador++; 
        }
        console.log("\n========== FIN DEL TURNO ==========");

        // 7. Guardar historial de recursos
        this.guardarRecursos();

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
