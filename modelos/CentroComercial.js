const EdificioComercial = require("./EdificioComercial");

class CentroComercial extends EdificioComercial {

    static contador = 0;
    constructor(ubicacion) {
        CentroComercial.contador += 1; // Incrementa el contador cada vez que se crea un nuevo centro comercial
        const idCentroComercial = "centroComercial" + CentroComercial.contador;
        super(idCentroComercial, 8000, ubicacion, 20);
        this.recursosEdificio["dinero"] = 2000;
        this.recursosEdificio["electricidad"] = -25;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = CentroComercial;