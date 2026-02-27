class Ciudadano{
    //Se implementa el constructor de ciudadano, especificando que si no se mandan ciertos atributos se asuman null.
    constructor(id, felicidad, vivienda, empleo, consumoCiudadano){
        this._id = id;
        this._felicidad = felicidad || null;
        this._vivienda = vivienda || null;
        this._empleo = empleo || null;
        this._consumoCiudadano = consumoCiudadano;
    }

    //Se edita el consumo del ciudadano para un único recurso, según la necesidad del sistema
    editarConsumoCiudadano(recurso, valor){
        this._consumoCiudadano[recurso] = valor;
    }

    //Se calcula la felicidad individual del ciudadano, según el paramétro de felicidad general dada por las edificaciones
    calcularFelicidad(felicidadGeneral){
        this._felicidad = felicidadGeneral
        this._felicidad += this._vivienda ? 20 : -20
        this._felicidad += this._empleo ? 10 : -10

        if (this._felicidad > 100) {
            this._felicidad = 100; // Limita la felicidad a un máximo de 100
        }
    }

}