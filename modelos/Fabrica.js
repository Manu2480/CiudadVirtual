
class Fabrica extends EdificioIndustrial {

    static contador = 0;

    constructor(ubicacion) {

        Fabrica.contador += 1; // Incrementa el contador cada vez que se crea una nueva fábrica
        const idFabrica = "Fabrica" + Fabrica.contador; // Genera un ID único para la fábrica

        super(idFabrica, 5000, ubicacion, 15); 
        this.recursosEdificio["dinero"] = 800;
        this.recursosEdificio["electricidad"] = -20;
        this.recursosEdificio["agua"] = -15;
    }

    static fromData(obj) {
        if (obj instanceof Fabrica) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Fabrica.contador) Fabrica.contador = num;
        }
        const instance = Object.create(Fabrica.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
}

