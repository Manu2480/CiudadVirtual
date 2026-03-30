class Casa extends EdificioResidencial {

    static contador = 0;

    static catalogoInfo = {
        costo:        1000,
        capacidad:    4,
        electricidad: -5,
        agua:         -3,
    };

    constructor(ubicacion) {
        Casa.contador += 1;
        const idCasa = "casa" + Casa.contador;
        super(idCasa, Casa.catalogoInfo.costo, ubicacion, Casa.catalogoInfo.capacidad);
        this.recursosEdificio["electricidad"] = Casa.catalogoInfo.electricidad;
        this.recursosEdificio["agua"]         = Casa.catalogoInfo.agua;
    }

    static fromData(obj) {
        if (obj instanceof Casa) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Casa.contador) Casa.contador = num;
        }
        const instance = Object.create(Casa.prototype);
        Object.assign(instance, obj);
        return instance;
    }
}