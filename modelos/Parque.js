class Parque extends Edificio {

    static contador = 0;

    static catalogoInfo = {
        costo:     1500,
        capacidad: 0,
        felicidad: 5,
    };

    constructor(ubicacion) {
        Parque.contador += 1;
        const idParque = "Parque" + Parque.contador;
        super(idParque, Parque.catalogoInfo.costo, ubicacion, Parque.catalogoInfo.capacidad);
        this.recursosEdificio = { felicidad: Parque.catalogoInfo.felicidad };
        this.ciudadanos = [];
    }

    static fromData(obj) {
        if (obj instanceof Parque) return obj;
        const numMatch = String(obj.id).match(/\d+$/);
        if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > Parque.contador) Parque.contador = num;
        }
        const instance = Object.create(Parque.prototype);
        Object.assign(instance, obj);
        return instance;
    }
}