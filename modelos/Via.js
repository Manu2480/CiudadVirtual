
class Via extends Edificio{

    // Contador estático para asignar IDs únicos a cada vía
    static contador = 0;

    // Esta clase por el momento no tiene recursos específicos, pero se puede extender en el futuro si es necesario
    constructor(ubicacion) {

        Via.contador += 1; // Incrementa el contador cada vez que se crea una nueva vía
        const idVia = "via" + Via.contador; // Genera un ID único para la vía

        //el id se genera automáticamente, el costo es 100 y su capacidad es 0 por enunciado
        super(idVia, 100, ubicacion, 0);
        this.recursosEdificio = {}; // Las vías no tienen recursos específicos por ahora
        this.ciudadanos = []; // Las vías no tienen ciudadanos asociados, pero se puede llenar si es necesario
    }

    // Crea una instancia de Via a partir de un objeto plano (JSON)
    static fromData(obj) {
        if (obj instanceof Via) return obj;
        
        // Extraer número del id y actualizar contador para evitar colisiones
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Via.contador) Via.contador = num;
        }
        
        // Crear instancia sin pasar por constructor (no incrementa contador)
        const instance = Object.create(Via.prototype);
        Object.assign(instance, obj);
        
        // Si hay ciudadanos, cargarlos con Ciudadano.fromData
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        
        return instance;
    }
}

