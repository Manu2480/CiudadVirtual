
class PlantaHidraulica extends PlantaUtilidad {

    static contador = 0;

    constructor(ubicacion) {

        PlantaHidraulica.contador += 1; // Incrementa el contador cada vez que se crea una nueva planta hidráulica
        const idPlanta = "Agua" + PlantaHidraulica.contador; // Genera un ID único para la planta hidráulica

        super(idPlanta, 8000, ubicacion, 0);
        this.recursosEdificio["electricidad"] = -20;
        this.recursosEdificio["agua"] = 150; // El valor es positivo porque produce agua
    }

    static fromData(obj) {
        if (obj instanceof PlantaHidraulica) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > PlantaHidraulica.contador) PlantaHidraulica.contador = num;
        }
        const instance = Object.create(PlantaHidraulica.prototype);
        Object.assign(instance, obj);
        /*
        if (obj.ciudadanos && Array.isArray(obj.ciudadanos)) {
            const Ciudadano = require("./Ciudadano");
            instance.ciudadanos = obj.ciudadanos.map(c => Ciudadano.fromData(c));
        }*/
        return instance;
    }

    //Si al descontar la electricidad el recurso quedo negativo, no podra producir agua
}

