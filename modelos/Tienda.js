
class Tienda extends EdificioComercial {

    static contador = 0;

    constructor(ubicacion) {

        Tienda.contador += 1;
        const idTienda = "tienda" + Tienda.contador; // Genera un ID único para la tienda
        super(idTienda, 2000, ubicacion, 6);
        this.recursosEdificio["dinero"] = 500;
        this.recursosEdificio["electricidad"] = -8;
    }

    static fromData(obj) {
        if (obj instanceof Tienda) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Tienda.contador) Tienda.contador = num;
        }
        const instance = Object.create(Tienda.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
    
    //sin electricidad no dan ingresos
}

