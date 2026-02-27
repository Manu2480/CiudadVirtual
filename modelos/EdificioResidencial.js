
class EdificioResidencial extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {
        
        if (new.target === EdificioResidencial) {
            throw new TypeError("No se puede instanciar la clase abstracta EdificioResidencial directamente");
        }

        super(id, costo, ubicacion, capacidad);

        //afectan la felicidad de sus inquilinos
        this.recursosEdificio["felicidad"] = 10;

    }

    //metodo para agregar ciudadano al edificio residencial
}

//exportamos la clase para poder usarla en main.js
module.exports = EdificioResidencial;

