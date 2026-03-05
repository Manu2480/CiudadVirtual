
class Parque extends Edificio {

    static contador = 0;

    constructor(ubicacion) {

        Parque.contador += 1; // Incrementa el contador cada vez que se crea un nuevo parque
        const idParque = "Parque" + Parque.contador; // Genera un ID único para el parque

        super(idParque, 1500, ubicacion, 0); // por enunciado el costo es 1500 
        this.recursosEdificio = {felicidad: 5}; // por enunciado el parque aumenta la felicidad en 5
        this.ciudadanos = [];
    }

    static fromData(obj) {
        if (obj instanceof Parque) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Parque.contador) Parque.contador = num;
        }
        const instance = Object.create(Parque.prototype);
        
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
}
