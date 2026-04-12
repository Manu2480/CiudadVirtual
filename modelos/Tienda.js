class Tienda extends EdificioComercial {

    static contador = 0;

    static catalogoInfo = {
        costo:        2000,
        capacidad:    {
            laboral: 6,
        },
        dinero:       500,
        electricidad: -8,
    };

    constructor(ubicacion) {
        Tienda.contador += 1;
        const idTienda = "tienda" + Tienda.contador;
        const capacidad = new CapacidadLaboral(Tienda.catalogoInfo.capacidad.laboral);
        super(idTienda, Tienda.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["dinero"]       = Tienda.catalogoInfo.dinero;
        this.recursosEdificio["electricidad"] = Tienda.catalogoInfo.electricidad;
    }

    static fromData(obj) {
        if (obj instanceof Tienda) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Tienda.contador) Tienda.contador = num;
        }
        const instance = Object.create(Tienda.prototype);
        Object.assign(instance, obj);
        instance.capacidad = new CapacidadLaboral(Tienda.catalogoInfo.capacidad.laboral);
        return instance;
    }
}