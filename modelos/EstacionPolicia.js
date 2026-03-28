class EstacionPolicia extends EdificioServicio {

    static contador = 0;

    static catalogoInfo = {
        costo:        4000,
        capacidad:    0,
        felicidad:    10,
        electricidad: -15,
    };

    constructor(ubicacion) {
        EstacionPolicia.contador += 1;
        const idEstacionPolicia = "Policia" + EstacionPolicia.contador;
        super(idEstacionPolicia, EstacionPolicia.catalogoInfo.costo, ubicacion, EstacionPolicia.catalogoInfo.capacidad);
        this.recursosEdificio["electricidad"] = EstacionPolicia.catalogoInfo.electricidad;
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
        return instance;
    }
}