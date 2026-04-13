class Granja extends EdificioIndustrial {

    static contador = 0;

    static catalogoInfo = {
        costo:    3000,
        capacidad: {
            laboral: 8,
        },
        alimento: 50,
        agua:     -10,
    };

    constructor(ubicacion) {
        Granja.contador += 1;
        const idGranja = "Granja" + Granja.contador;
        const capacidad = new CapacidadLaboral(Granja.catalogoInfo.capacidad.laboral);
        super(idGranja, Granja.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["alimento"] = Granja.catalogoInfo.alimento;
        this.recursosEdificio["agua"]     = Granja.catalogoInfo.agua;
    }

    static fromData(obj) {
        if (obj instanceof Granja) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Granja.contador) Granja.contador = num;
        }
        const instance = Object.create(Granja.prototype);
        Object.assign(instance, obj);
        instance.capacidad = new new CapacidadLaboral(Granja.catalogoInfo.capacidad.laboral);
        return instance;
    }
}