
class EstacionPolicia extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        EstacionPolicia.contador += 1; // Incrementa el contador cada vez que se crea una nueva estación de policía
        const idEstacionPolicia = "Policia" + EstacionPolicia.contador; // Genera un ID único para la estación de policía
        
        super(idEstacionPolicia, 4000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -15; //El valor va negativo para que se sepa que es consume y no produce
        
    }

    static fromData(obj) {
        if (obj instanceof EstacionPolicia) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > EstacionPolicia.contador) EstacionPolicia.contador = num;
        }
        const instance = Object.create(EstacionPolicia.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }
}
