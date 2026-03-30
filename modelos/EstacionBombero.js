class EstacionBombero extends EdificioServicio {

    static contador = 0;

    static catalogoInfo = {
        costo:        4000,
        capacidad:    0,
        felicidad:    10,
        electricidad: -15,
    };

    constructor(ubicacion) {
        EstacionBombero.contador += 1;
        const idEstacionBomberos = "Bombero" + EstacionBombero.contador;
        super(idEstacionBomberos, EstacionBombero.catalogoInfo.costo, ubicacion, EstacionBombero.catalogoInfo.capacidad);
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
        return instance;
    }
}