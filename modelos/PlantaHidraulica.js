class PlantaHidraulica extends PlantaUtilidad {

    static contador = 0;

    static catalogoInfo = {
        costo:        8000,
        electricidad: -20,
        agua:         150,
    };

    constructor(ubicacion) {
        PlantaHidraulica.contador += 1;
        const idPlanta = "Agua" + PlantaHidraulica.contador;
        const capacidad = new CapacidadNula();
        super(idPlanta, PlantaHidraulica.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["electricidad"] = PlantaHidraulica.catalogoInfo.electricidad;
        this.recursosEdificio["agua"]         = PlantaHidraulica.catalogoInfo.agua;
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
        instance.capacidad = new CapacidadNula();
        return instance;
    }

    //Si al descontar la electricidad el recurso quedo negativo, no podra producir agua
}