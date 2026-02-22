
class PlantaElectrica extends PlantaUtilidad {

    static contador = 0;

    constructor(ubicacion) {

        PlantaElectrica.contador += 1; // Incrementa el contador cada vez que se crea una nueva planta eléctrica
        const idPlanta = "planta" + PlantaElectrica.contador; // Genera un ID único para la planta eléctrica

        super(idPlanta, 10000, ubicacion, 0);
        this.recursosEdificio["electricidad"] = 200; // El valor es positivo porque produce electricidad
    }
}