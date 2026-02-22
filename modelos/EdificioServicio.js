
class EdificioServicio extends Edificio {

    constructor(id, costo, ubicacion, capacidad) {
        
        // No se pueden crear edificios de servicio directamente, ya que es una clase abstracta
        if (new.target === EdificioServicio) { // new.target debe ir dentro de un constructor para funcionar
            throw new TypeError("No se puede instanciar la clase abstracta EdificioServicio directamente");
        }

        super(id, costo, ubicacion, capacidad);

        // Por enunciado TODOS los edificios de servicio aumentan la felicidad en 10
        // this.recursosEdificio.felicidad = 10; // en js un diccionario almacena objetos asi que se puede esta sintaxis, para no confundirnos ya que no tenemos la clase recurso usare otra sintaxis
        this.recursosEdificio["felicidad"] = 10; // esta sintaxis es equivalente a la de arriba, pero es mas clara para entender que estamos agregando una propiedad al diccionario recursosEdificio
    }


    //Metodos para modificar la felicidad (requisito de enunciado)
    setFelicidad(nuevoValor) {
        // Validar que el nuevo valor de felicidad sea un número positivo menor de 100
        if (typeof nuevoValor !== "number" || nuevoValor < 0 || nuevoValor > 100 ) {
            throw new Error("La felicidad debe ser un número positivo menor de 100");
        }

        this.recursosEdificio["felicidad"] = nuevoValor;
    }

    getFelicidad() {
        return this.recursosEdificio["felicidad"];
    }


}
