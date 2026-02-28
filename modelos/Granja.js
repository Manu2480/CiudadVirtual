
const EdificioIndustrial = require("./EdificioIndustrial");

class Granja extends EdificioIndustrial {

    static contador = 0;

    constructor(ubicacion) {

        Granja.contador += 1; // Incrementa el contador cada vez que se crea una nueva fábrica
        const idGranja = "Granja" + Granja.contador; // Genera un ID único para la fábrica

        super(idGranja, 3000, ubicacion, 8); 
        this.recursosEdificio["alimento"] = 50;
        this.recursosEdificio["agua"] = -10;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Granja;