
class EdificioIndustrial extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {

        if (new.target === EdificioIndustrial) { 
            throw new TypeError("No se puede instanciar la clase abstracta EdificioIndustrial directamente");
        }

        super(id, costo, ubicacion, capacidad);
        this.recursosEdificio["felicidad"] = 15;
    }

    // A sus hijos hace falta implementar el metodo que agrega los ciudadanos al array
}

