
class Hospital extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        Hospital.contador += 1; // Incrementa el contador cada vez que se crea un nuevo hospital
        const idHospital = "Hospital" + Hospital.contador; // Genera un ID único para el hospital

        super(idHospital, 6000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -20; //El valor va negativo para que se sepa que es consume y no produce
        this.recursosEdificio["agua"] = -10;
    }

    static fromData(obj) {
        if (obj instanceof Hospital) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Hospital.contador) Hospital.contador = num;
        }
        const instance = Object.create(Hospital.prototype);
        Object.assign(instance, obj);
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        return instance;
    }
}
