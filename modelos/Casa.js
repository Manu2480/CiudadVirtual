
const EdificioResidencial = require("./EdificioResidencial");

class Casa extends EdificioResidencial {

    static contador = 0;
    constructor(ubicacion) {
        Casa.contador += 1; // Incrementa el contador cada vez que se crea una nueva casa
        const idCasa = "casa" + Casa.contador; // Genera un ID único para la casa
        super(idCasa, 1000, ubicacion, 4);
        this.recursosEdificio["electricidad"] = -5;
        this.recursosEdificio["agua"] = -3;
    }

    // Crea una instancia de Casa a partir de un objeto plano (JSON)
    static fromData(obj) {
        if (obj instanceof Casa) return obj;
        
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Casa.contador) Casa.contador = num;
        }
        
        const instance = Object.create(Casa.prototype);
        Object.assign(instance, obj);
        
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        
        return instance;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Casa;