class Ciudadano{
    // Se implementa el constructor de ciudadano.
    // Parámetros:
    //  - id: identificador (ej. 'ciudadano1').
    //  - felicidad: número entre 0 y 100 (por defecto 0 para evitar null/undefined).
    //  - vivienda: booleano o null indicando si tiene vivienda asignada.
    //  - empleo: booleano o null indicando si tiene empleo asignado.
    //  - consumoCiudadano: objeto con consumos por recurso (ej. { agua, electricidad, alimento }).
    constructor(id, felicidad = 0, vivienda = null, empleo = null, consumoCiudadano){
        // guardamos el id tal cual viene (puede venir desde JSON o generarse en tiempo de juego)
        this.id = id;
        // inicializamos la felicidad con 0 por defecto para evitar estados nulos
        this.felicidad = felicidad;
        // estados de vivienda y empleo, pueden ser true/false/null
        this.vivienda = vivienda;
        this.empleo = empleo;
        // consumos por recurso; puede inicializarse posteriormente si no viene en el JSON
        this.consumoCiudadano = consumoCiudadano;
    }

    // Crea una instancia de Ciudadano a partir de un objeto plano (JSON)
    static fromData(obj) {
        // Si ya es una instancia de Ciudadano, la devolvemos tal cual (evita cargar dos veces)
        if (obj instanceof Ciudadano) return obj;

        // Extraemos campos del objeto plano que vino del JSON
        const id = obj.id; // id esperado como string, por ejemplo 'ciudadano12'

        // Felicidad: si existe y es número la usamos, si no asumimos 0
        const felicidad = typeof obj.felicidad === 'number' ? obj.felicidad : 0;

        // Vivienda y empleo normalizamos a null si no existen
        const vivienda = obj.vivienda ?? null;
        const empleo = obj.empleo ?? null;

        // Consumos: si no vienen, los inicializamos con 0 para evitar errores al referenciarlos
        const consumoCiudadano = obj.consumoCiudadano || { agua: 0, electricidad: 0, alimento: 0 };

        // Creamos la instancia usando el constructor para obtener métodos y estructura correctos
        const c = new Ciudadano(id, felicidad, vivienda, empleo, consumoCiudadano);

        // Devolvemos la instancia ya con los datos cargados de json
        return c;
    }

    //Se edita el consumo del ciudadano para un único recurso, según la necesidad del sistema
    editarConsumoCiudadano(recurso, valor){
        this.consumoCiudadano[recurso] = valor;
    }

    // Se calcula la felicidad individual del ciudadano, según la felicidad general de infraestructura
    calcularFelicidad(felicidadGeneral){
        // partimos de la felicidad general que aportan las infraestructuras
        this.felicidad = felicidadGeneral;

        // aplicamos ajustes por vivienda y empleo
        // si tiene vivienda suma 20, si no resta 20
        this.felicidad += this.vivienda ? 20 : -20;
        // si tiene empleo suma 10, si no resta 10
        this.felicidad += this.empleo ? 10 : -10;

        // límites: mantenemos la felicidad dentro 0..100
        if (this.felicidad > 100) this.felicidad = 100;
        if (this.felicidad < 0) this.felicidad = 0;
    }
}
