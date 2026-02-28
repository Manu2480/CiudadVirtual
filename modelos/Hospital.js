
const EdificioServicio = require("./EdificioServicio");

class Hospital extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        Hospital.contador += 1; // Incrementa el contador cada vez que se crea un nuevo hospital
        const idHospital = "Hospital" + Hospital.contador; // Genera un ID único para el hospital

        super(idHospital, 6000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -20; //El valor va negativo para que se sepa que es consume y no produce
        this.recursosEdificio["agua"] = -10;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Hospital;