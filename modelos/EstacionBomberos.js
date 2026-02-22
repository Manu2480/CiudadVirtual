
class EstacionBomberos extends EdificioServicio {

    static contador = 0;

    constructor(ubicacion) {

        EstacionBomberos.contador += 1;
        const idEstacionBomberos = "estacionBomberos" + EstacionBomberos.contador;

        super(idEstacionBomberos, 4000, ubicacion, 0); 
        this.recursosEdificio["electricidad"] = -15; //El valor va negativo para que se sepa que es consume y no produce
        
    }
}