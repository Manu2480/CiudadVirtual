
class EstacionBombero extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        EstacionBombero.contador += 1;
        const idEstacionBomberos = "estacionBomberos" + EstacionBomberos.contador;

        super(idEstacionBomberos, 4000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -15; //El valor va negativo para que se sepa que es consume y no produce
        
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = EstacionBombero;