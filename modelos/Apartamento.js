class Apartamento extends EdificioResidencial {

    static contador = 0;
    constructor(ubicacion) {
        Apartamento.contador += 1; // Incrementa el contador cada vez que se crea una nueva casa
        const idApartamento = "apartamento" + Apartamento.contador; // Genera un ID único para la casa
        super(idApartamento, 3000, ubicacion, 12);
        this.recursosEdificio["electricidad"] = -15;
        this.recursosEdificio["agua"] = -10;
    }

    // Crea una instancia de Apartamento a partir de un objeto plano (JSON)
    static fromData(obj) {
        if (obj instanceof Apartamento) return obj;
        
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Apartamento.contador) Apartamento.contador = num;
        }
        
        const instance = Object.create(Apartamento.prototype);
        Object.assign(instance, obj);
        
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        
        return instance;
    }
}
