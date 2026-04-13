class Fabrica extends EdificioIndustrial {

    static contador = 0;

    static catalogoInfo = {
        costo:        5000,
        capacidad:    {
            laboral: 15,
        },
        dinero:       800,
        electricidad: -20,
        agua:         -15,
    };

    constructor(ubicacion) {
        Fabrica.contador += 1;
        const idFabrica = "Fabrica" + Fabrica.contador;
        const capacidad = new CapacidadLaboral(Fabrica.catalogoInfo.capacidad.laboral);
        super(idFabrica, Fabrica.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["dinero"]       = Fabrica.catalogoInfo.dinero;
        this.recursosEdificio["electricidad"] = Fabrica.catalogoInfo.electricidad;
        this.recursosEdificio["agua"]         = Fabrica.catalogoInfo.agua;
    }

    static fromData(obj) {
        if (obj instanceof Fabrica) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Fabrica.contador) Fabrica.contador = num;
        }
        const instance = Object.create(Fabrica.prototype);
        Object.assign(instance, obj);
        instance.capacidad = new CapacidadLaboral(Fabrica.catalogoInfo.capacidad.laboral); 
        return instance;
    }
}