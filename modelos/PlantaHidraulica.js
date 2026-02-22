
class PlantaHidraulica extends PlantaUtilidad {

    static contador = 0;

    constructor(ubicacion) {

        PlantaHidraulica.contador += 1; // Incrementa el contador cada vez que se crea una nueva planta hidráulica
        const idPlanta = "plantaHidraulica" + PlantaHidraulica.contador; // Genera un ID único para la planta hidráulica

        super(idPlanta, 8000, ubicacion, 0);
        this.recursosEdificio["electricidad"] = -20;
        this.recursosEdificio["agua"] = 150; // El valor es positivo porque produce agua
    }

    //Si al descontar la electricidad el recurso quedo negativo, no podra producir agua
}