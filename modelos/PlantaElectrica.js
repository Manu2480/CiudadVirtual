class PlantaElectrica extends PlantaUtilidad {

    static contador = 0;

    static catalogoInfo = {
        costo:        10000,
        electricidad: 200,
    };

    constructor(ubicacion) {
        PlantaElectrica.contador += 1;
        const idPlanta = "Luz" + PlantaElectrica.contador;
        const capacidad = new CapacidadNula()
        super(idPlanta, PlantaElectrica.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["electricidad"] = PlantaElectrica.catalogoInfo.electricidad;
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
        instance.capacidad = new CapacidadNula();
        return instance;
    }
}