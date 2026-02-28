const EdificioResidencial = require("./EdificioResidencial");

class Apartamento extends EdificioResidencial {

    static contador = 0;
    constructor(ubicacion) {
        Apartamento.contador += 1; // Incrementa el contador cada vez que se crea una nueva casa
        const idApartamento = "apartamento" + Apartamento.contador; // Genera un ID único para la casa
        super(idApartamento, 3000, ubicacion, 12);
        this.recursosEdificio["electricidad"] = -15;
        this.recursosEdificio["agua"] = -10;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Apartamento;