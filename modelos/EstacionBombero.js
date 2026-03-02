const EdificioServicio = require("./EdificioServicio");

class EstacionBombero extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        EstacionBombero.contador += 1;
        const idEstacionBomberos = "Bombero" + EstacionBombero.contador;

        super(idEstacionBomberos, 4000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -15; //El valor va negativo para que se sepa que es consume y no produce
        
    }

    static fromData(obj) {
        if (obj instanceof EstacionBombero) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > EstacionBombero.contador) EstacionBombero.contador = num;
        }
        const instance = Object.create(EstacionBombero.prototype);
        Object.assign(instance, obj);
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        return instance;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = EstacionBombero;