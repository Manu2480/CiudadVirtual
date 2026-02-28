
const EdificioIndustrial = require("./EdificioIndustrial");

class Fabrica extends EdificioIndustrial {

    static contador = 0;

    constructor(ubicacion) {

        Fabrica.contador += 1; // Incrementa el contador cada vez que se crea una nueva fábrica
        const idFabrica = "Fabrica" + Fabrica.contador; // Genera un ID único para la fábrica

        super(idFabrica, 5000, ubicacion, 15); 
        this.recursosEdificio["dinero"] = 800;
        this.recursosEdificio["electricidad"] = -20;
        this.recursosEdificio["agua"] = -15;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Fabrica;