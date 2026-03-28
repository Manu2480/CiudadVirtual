class Via extends Edificio {

    static contador = 0;

    static catalogoInfo = {
        costo:     100,
        capacidad: 0,
    };

    constructor(ubicacion) {
        Via.contador += 1;
        const idVia = "via" + Via.contador;
        super(idVia, Via.catalogoInfo.costo, ubicacion, Via.catalogoInfo.capacidad);
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
        return instance;
    }
}