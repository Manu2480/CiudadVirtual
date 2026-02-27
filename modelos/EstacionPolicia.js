
class EstacionPolicia extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        EstacionPolicia.contador += 1; // Incrementa el contador cada vez que se crea una nueva estación de policía
        const idEstacionPolicia = "estacionPolicia" + EstacionPolicia.contador; // Genera un ID único para la estación de policía
        
        super(idEstacionPolicia, 4000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -15; //El valor va negativo para que se sepa que es consume y no produce
        
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = EstacionPolicia;