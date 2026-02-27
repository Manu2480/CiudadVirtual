
//Es para que node herede
const Edificio = require("./Edificio");

class PlantaUtilidad extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {
        
        if (new.target === PlantaUtilidad) {
            throw new TypeError("No se puede instanciar la clase abstracta PlantaUtilidad directamente");
        }

        super(id, costo, ubicacion, capacidad);
     } 
}

//exportamos la clase para poder usarla en main.js
module.exports = PlantaUtilidad;