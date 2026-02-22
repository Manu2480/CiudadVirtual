
class EdificioComercial extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {
        
        if (new.target === EdificioComercial) {
            throw new TypeError("No se puede instanciar la clase abstracta EdificioComercial directamente");
        }

        super(id, costo, ubicacion, capacidad);
        this.recursosEdificio["felicidad"] = 15;
    }

    //metodo para agregar ciudadano al edificio comercial
}

