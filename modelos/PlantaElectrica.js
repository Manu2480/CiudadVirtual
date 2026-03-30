class PlantaElectrica extends PlantaUtilidad {

    static contador = 0;

    static catalogoInfo = {
        costo:        10000,
        capacidad:    0,
        electricidad: 200,
    };

    constructor(ubicacion) {
        PlantaElectrica.contador += 1;
        const idPlanta = "Luz" + PlantaElectrica.contador;
        super(idPlanta, PlantaElectrica.catalogoInfo.costo, ubicacion, PlantaElectrica.catalogoInfo.capacidad);
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
        return instance;
    }
}