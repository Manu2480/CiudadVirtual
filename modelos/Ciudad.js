
class Ciudad {
    recursosPorCiudadanoPredeterminado = {
        dinero: 0,
        electricidad: -1,
        agua: -1,
        alimento: -1
    }
    ciudadanosPorTurno = 3;
    valorMantenimiento = 0.01;

    constructor(nombre, alcalde, latitud, longitud, tiempoTurno, terreno, ciudadanos, estadoRecursos, historicoRecursos, recursosPorCiudadano) {

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
        this.recursosPorCiudadano = recursosPorCiudadano;
        if (!recursosPorCiudadano){
            this.recursosPorCiudadano = this.recursosPorCiudadanoPredeterminado;
        }
    }

    // El método modificarRecurso se encarga de modificar la cantidad de un recurso específico en el estado de recursos de la ciudad.
    // Recibe dos parámetros: tipo, que es el tipo de recurso a modificar (por ejemplo, "dinero", "agua", etc.), y cantidad, que es 
    // la cantidad a agregar o restar al recurso. Si el tipo de recurso no es válido (es decir, no existe en el estado de recursos), se lanza un error. De lo contrario, se actualiza la cantidad del recurso correspondiente sumando la cantidad proporcionada.
    modificarRecurso(tipo, cantidad) {

        if (!(tipo in this.estadoRecursos)) {
            throw new Error("Recurso no válido");
        }
        this.estadoRecursos[tipo] += cantidad;
        document.dispatchEvent(new CustomEvent("recursosModificados"));
    }   

    getRecurso(tipo) {
        return this.estadoRecursos[tipo];
    }

    calcularProduccionNeta() {
        const resultado = {
            produccion: {
                total: {},
                porEdificio: {
                    comercial: {},
                    industrial: {},
                    servicio: {},
                    residencial: {},
                    via: {},
                }
            },
            consumo: {
                total: {},
                porEdificio: {
                    comercial: {},
                    industrial: {},
                    servicio: {},
                    residencial: {},
                    via: {},
                },
                porCiudadano: {}
            },
            neto: {}
        };

        // 1. Inicializar todos los recursos
        for (const recurso in this.estadoRecursos) {
            resultado.produccion.total[recurso] = 0;
            resultado.consumo.total[recurso] = 0;
            resultado.consumo.porCiudadano[recurso] = 0;

            for (const tipo in resultado.produccion.porEdificio) {
                resultado.produccion.porEdificio[tipo][recurso] = 0;
                resultado.consumo.porEdificio[tipo][recurso] = 0;
            }

            resultado.neto[recurso] = 0;
        }

        // 2. EDIFICIOS
        this.terreno.edificios.forEach(edificio => {
            const recursos = edificio.recursosEdificio || {};

            let tipo = null;
            if (edificio instanceof EdificioComercial) tipo = "comercial";
            else if (edificio instanceof EdificioIndustrial) tipo = "industrial";
            else if (edificio instanceof EdificioServicio) tipo = "servicio";
            else if (edificio instanceof EdificioResidencial) tipo = "residencial";
            else if (edificio instanceof Via) tipo = "via";
         

            for (const recurso in recursos) {
                const valor = recursos[recurso] ?? 0;

                if (valor > 0) {
                    // PRODUCCIÓN
                    resultado.produccion.total[recurso] += valor;

                    if (tipo) {
                        resultado.produccion.porEdificio[tipo][recurso] += valor;
                    }

                } else if (valor < 0) {
                    // CONSUMO
                    resultado.consumo.total[recurso] += valor;

                    if (tipo) {
                        resultado.consumo.porEdificio[tipo][recurso] += valor;
                    }
                }
            }
            //aplicar costo mantenimiento
            if (tipo) {
                resultado.consumo.total["dinero"] -= edificio.costo * this.valorMantenimiento;
                resultado.consumo.porEdificio[tipo]["dinero"] -= edificio.costo * this.valorMantenimiento;
            }
        });

        // 3. CIUDADANOS
        this.ciudadanos.forEach(ciudadano => {
            const consumo = ciudadano.consumoCiudadano || {};

            for (const recurso in consumo) {
                const valor = consumo[recurso] ?? 0;

                resultado.consumo.total[recurso] += valor;
                resultado.consumo.porCiudadano[recurso] += valor;
            }
        });

        // 5. NETO
        for (const recurso in resultado.neto) {
            resultado.neto[recurso] =
                resultado.produccion.total[recurso] +
                resultado.consumo.total[recurso];
        }

        return resultado;
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
    cambiarConsumoCiudadanos(clave, nuevoValor){
        this.recursosPorCiudadano[clave] = nuevoValor;
        this.ciudadanos.forEach(ciudadano=>{
            ciudadano.consumoCiudadano = this.recursosPorCiudadano;
        });
        
    }

    // Metodo que calcula los recursos proporcionados o gastados por los edificios, se llama una vez en cada turno
    recursosPorEdificios() {
        this.terreno.edificios.forEach(edificio => {
            //const id = edificio.id.replace(/[0-9]/g, ''); //Elimina los números del id del edificio
            const recursos = edificio.recursosEdificio;

            for (const recurso in recursos) {
                // suma(producción)/resta(consumo) el recurso correspondiente 
                if (recurso != "felicidad"){
                    this.modificarRecurso(recurso, recursos[recurso]);
                }
            }
        });
    }
    cambiarRecursosEdificio(claveEdificio, recurso, nuevoValor){
        this.terreno.edificios.forEach(edificio =>{
            if (edificio.id.toLowerCase().startsWith(claveEdificio)){
                edificio.recursosEdificio[recurso] = nuevoValor;
            }
        });
    }

    // Costo de mantenimiento por turno (dinero) basado en edificios activos
    // Cada edificio cuesta el 0,01% de su costo original por turno
    aplicarCostoMantenimiento() {
        const edificios = this.terreno.edificios || [];
 
        const costoTotal = edificios
            .reduce((total, e) => total + (e.costo || 0) * this.valorMantenimiento, 0);
 
        if (costoTotal > 0) {
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
            return false;
        }

        // 2. debe haber al menos un empleo libre
        if (empleos.totalDisponibles <= 0) {
            return false;
        }

        // 3. la felicidad promedio de la ciudad debe ser mayor a 60
        // calculamos el promedio solo si ya hay al menos un ciudadano (evita división por cero)
        if (this.ciudadanos.length > 0) {
            this.calcularFelicidadPromedio();
            if (this.estadoRecursos.felicidad < 60) {
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
            }
            if ((ciudadano.empleo == false) || (ciudadano.empleo == null)){
                this.asignarEmpleo(ciudadano);
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
            }

            // Evitar colisiones: si ya existe un ciudadano con el mismo id en esta ciudad, reasignar
            const existe = this.ciudadanos.some(ch => ch.id === nuevoCiudadano.id);
            if (existe) {
                Ciudad.contador += 1;
                nuevoCiudadano.id = `ciudadano${Ciudad.contador}`;
                n = Ciudad.contador;
            }

            // Añadimos la instancia cargada al array de ciudadanos de la ciudad
            this.ciudadanos.push(nuevoCiudadano);

            // sincronizar contador para evitar colisiones futuras (si el id numérico es mayor)
            if (!Number.isNaN(n) && n > Ciudad.contador) Ciudad.contador = n;

            nuevoCiudadano.consumoCiudadano = this.recursosPorCiudadano;
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
        return nuevoCiudadano;
    }

    // Asigna vivienda disponible a un ciudadano específico (si hay)
    asignarVivienda(ciudadano) {
        // Viviendas tendra 2 atributos: 1totalDisponibles numero de viviendas dispo y 2edificios estructuras donde hay dispo
        const viviendas = this.terreno.viviendasDisponibles();
        if (viviendas.edificios.length > 0) {
            // Le asignamos la primer vivienda dispo por defecto
            viviendas.edificios[0].agregarPersona(ciudadano, "residente");
            ciudadano.vivienda = true; // cambiamos el estado del ciudadano
            this.asignarFelicidadInicial(ciudadano.id); //calcula la felicidad del ciudadano
            this.calcularFelicidadPromedio();
            return true;
        } else {
            return false;
        }
    }

    // Asigna empleo disponible a un ciudadano específico (si hay) Funciona igualq ue viviendas
    asignarEmpleo(ciudadano) {
        const empleos = this.terreno.empleosDisponibles();
        if (empleos.edificios.length > 0) {
            empleos.edificios[0].agregarPersona(ciudadano, "empleado");
            ciudadano.empleo = true;
            this.asignarFelicidadInicial(ciudadano.id); //calcula la felicidad del ciudadano
            this.calcularFelicidadPromedio();
            return true;
        } else {
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
        this.historicoRecursos.push({...this.estadoRecursos});
    }
    // Metodo que se encarga de ejecutar todas las acciones necesarias para avanzar un turno en el juego
    ejecutarTurno(){
        
        // 1. Actualizar felicidad inicial según infraestructura (ya se usa en el método calcularFelicidadPromedio).
        this.ciudadanos.forEach(ciudadano => {
            this.asignarFelicidadInicial(ciudadano.id);
        });
        this.calcularFelicidadPromedio();
        
        // 2. Validar si hay ciudadanos sin empleo o vivienda y asignarselos en caso de que se pueda
        this.asignarInfraestructuras();
        
        // 3. Poniendo en ceros el recurso agua y electricidad
        this.estadoRecursos.agua = 0;
        this.estadoRecursos.electricidad = 0;
        
        // 4. Consumo de ciudadanos
        this.consumoCiudadanos();
        
        // 5. Producción/Consumo de edificios
        this.recursosPorEdificios();

        // 5.b Costo de mantenimiento por edificio (dinero)
        this.aplicarCostoMantenimiento();
        
        // 6. Intentar crear nuevos ciudadanos
        let contador = 1;
        while (this.aumentarPoblacion() && contador <= this.ciudadanosPorTurno) {
            this.crearCiudadano(-1, -2, -3);
            contador++; 
        }
        document.dispatchEvent(new CustomEvent("recursosModificados"));

        // 7. Guardar historial de recursos
        this.guardarRecursos();

    }
    
    // Metodo para validar si se puede jugar otro turno o si se acaba el juego
    pasarTurno(){

        if (this.recursosNegativos().length > 0) {
            return false; // Indica que el juego ha terminado
        }else {
            return true; // Indica que podemos pasar al siguiente turno
        }

    }

    // Metodo para ejecutar un turno cada x tiempo
    iniciarSimulacion() {

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
