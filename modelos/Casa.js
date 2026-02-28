
const EdificioResidencial = require("./EdificioResidencial");

class Casa extends EdificioResidencial {

    static contador = 0;
    constructor(ubicacion) {
        Casa.contador += 1; // Incrementa el contador cada vez que se crea una nueva casa
        const idCasa = "casa" + Casa.contador; // Genera un ID único para la casa
        super(idCasa, 1000, ubicacion, 4);
        this.recursosEdificio["electricidad"] = -5;
        this.recursosEdificio["agua"] = -3;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Casa;