class Apartamento extends EdificioResidencial {

    static contador = 0;

    static catalogoInfo = {
        costo:        3000,
        capacidad:    {
            residencial: 12,
        },
        electricidad: -15,
        agua:         -10,
    };

    constructor(ubicacion) {
        Apartamento.contador += 1;
        const idApartamento = "apartamento" + Apartamento.contador;
        const capacidad = new CapacidadResidencial(Apartamento.catalogoInfo.capacidad.residencial);
        super(idApartamento, Apartamento.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["electricidad"] = Apartamento.catalogoInfo.electricidad;
        this.recursosEdificio["agua"]         = Apartamento.catalogoInfo.agua;
    }

    static fromData(obj) {
        if (obj instanceof Apartamento) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Apartamento.contador) Apartamento.contador = num;
        }
        const instance = Object.create(Apartamento.prototype);
        Object.assign(instance, obj);
        instance.capacidad = new CapacidadResidencial(Apartamento.catalogoInfo.capacidad.residencial);
        return instance;
    }
}