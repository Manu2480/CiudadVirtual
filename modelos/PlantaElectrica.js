
class PlantaElectrica extends PlantaUtilidad {

    static contador = 0;

    constructor(ubicacion) {

        PlantaElectrica.contador += 1; // Incrementa el contador cada vez que se crea una nueva planta eléctrica
        const idPlanta = "Luz" + PlantaElectrica.contador; // Genera un ID único para la planta eléctrica

        super(idPlanta, 10000, ubicacion, 0);
        this.recursosEdificio["electricidad"] = 200; // El valor es positivo porque produce electricidad
    }

    static fromData(obj) {
        if (obj instanceof PlantaElectrica) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > PlantaElectrica.contador) PlantaElectrica.contador = num;
        }
        const instance = Object.create(PlantaElectrica.prototype);
        Object.assign(instance, obj);
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }
        return instance;
    }
}

