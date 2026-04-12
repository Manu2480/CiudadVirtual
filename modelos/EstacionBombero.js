class EstacionBombero extends EdificioServicio {

    static contador = 0;

    static catalogoInfo = {
        costo:        4000,
        felicidad:    10,
        electricidad: -15,
    };

    constructor(ubicacion) {
        EstacionBombero.contador += 1;
        const idEstacionBomberos = "Bombero" + EstacionBombero.contador;
        const capacidad = new CapacidadNula();
        super(idEstacionBomberos, EstacionBombero.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["electricidad"] = EstacionBombero.catalogoInfo.electricidad;
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
        instance.capacidad = new CapacidadNula();
        return instance;
    }
}