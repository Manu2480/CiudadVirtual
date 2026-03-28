class CentroComercial extends EdificioComercial {

    static contador = 0;

    static catalogoInfo = {
        costo:        8000,
        capacidad:    20,
        dinero:       2000,
        electricidad: -25,
    };

    constructor(ubicacion) {
        CentroComercial.contador += 1;
        const idCentroComercial = "centroComercial" + CentroComercial.contador;
        super(idCentroComercial, CentroComercial.catalogoInfo.costo, ubicacion, CentroComercial.catalogoInfo.capacidad);
        this.recursosEdificio["dinero"]       = CentroComercial.catalogoInfo.dinero;
        this.recursosEdificio["electricidad"] = CentroComercial.catalogoInfo.electricidad;
    }

    static fromData(obj) {
        if (obj instanceof CentroComercial) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > CentroComercial.contador) CentroComercial.contador = num;
        }
        const instance = Object.create(CentroComercial.prototype);
        Object.assign(instance, obj);
        return instance;
    }
}