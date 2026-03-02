
class PlantaUtilidad extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {
        
        if (new.target === PlantaUtilidad) {
            throw new TypeError("No se puede instanciar la clase abstracta PlantaUtilidad directamente");
        }

        super(id, costo, ubicacion, capacidad);
     } 
}

