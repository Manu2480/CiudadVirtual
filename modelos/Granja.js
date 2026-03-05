
class Granja extends EdificioIndustrial {

    static contador = 0;

    constructor(ubicacion) {

        Granja.contador += 1; // Incrementa el contador cada vez que se crea una nueva fábrica
        const idGranja = "Granja" + Granja.contador; // Genera un ID único para la fábrica

        super(idGranja, 3000, ubicacion, 8); 
        this.recursosEdificio["alimento"] = 50;
        this.recursosEdificio["agua"] = -10;
    }

    static fromData(obj) {
        if (obj instanceof Granja) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Granja.contador) Granja.contador = num;
        }
        const instance = Object.create(Granja.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
}

