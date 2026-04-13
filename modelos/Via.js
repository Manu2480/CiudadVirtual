class Via extends Edificio {

    static contador = 0;

    static catalogoInfo = {
        costo:     100,
    };

    constructor(ubicacion) {
        Via.contador += 1;
        const idVia = "via" + Via.contador;
        const capacidad = new CapacidadNula();
        super(idVia, Via.catalogoInfo.costo, ubicacion, capacidad);
        this.recursosEdificio = {};
        this.ciudadanos = [];
    }

    static fromData(obj) {
        if (obj instanceof Via) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Via.contador) Via.contador = num;
        }
        const instance = Object.create(Via.prototype);
        Object.assign(instance, obj);
        capacidad = new CapacidadNula();
        return instance;
    }
}