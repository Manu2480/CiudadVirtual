class Hospital extends EdificioServicio {

    static contador = 0;

    static catalogoInfo = {
        costo:        6000,
        felicidad:    10,
        electricidad: -20,
        agua:         -10,
    };

    constructor(ubicacion) {
        Hospital.contador += 1;
        const idHospital = "Hospital" + Hospital.contador;
        const capacidad = new CapacidadNula();
        super(idHospital, Hospital.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio["electricidad"] = Hospital.catalogoInfo.electricidad;
        this.recursosEdificio["agua"]         = Hospital.catalogoInfo.agua;
    }

    static fromData(obj) {
        if (obj instanceof Hospital) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Hospital.contador) Hospital.contador = num;
        }
        const instance = Object.create(Hospital.prototype);
        Object.assign(instance, obj);
        instance.capacidad = new CapacidadNula();
        return instance;
    }
}