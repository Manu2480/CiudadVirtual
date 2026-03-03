
class CentroComercial extends EdificioComercial {

    static contador = 0;
    constructor(ubicacion) {
        CentroComercial.contador += 1; // Incrementa el contador cada vez que se crea un nuevo centro comercial
        const idCentroComercial = "centroComercial" + CentroComercial.contador;
        super(idCentroComercial, 8000, ubicacion, 20);
        this.recursosEdificio["dinero"] = 2000;
        this.recursosEdificio["electricidad"] = -25;
    }

    static fromData(obj) {
        if (obj instanceof CentroComercial) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > CentroComercial.contador) CentroComercial.contador = num;
        }
        const instance = Object.create(CentroComercial.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
}
