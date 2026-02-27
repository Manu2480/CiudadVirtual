class Ciudadano{

    constructor(id, felicidad, vivienda, empleo, consumoCiudadano){
        this._id = id;
        this._felicidad = felicidad || null;
        this._vivienda = vivienda || null;
        this._empleo = empleo || null;
        this._consumoCiudadano = consumoCiudadano;
    }

    editarConsumoCiudadano(recurso, valor){
        this._consumoCiudadano[recurso] = valor;
    }

    calcularFelicidad(felicidadGeneral){
        this._felicidad = felicidadGeneral
        this._felicidad += this._vivienda ? 20 : -20
        this._felicidad += this._empleo ? 10 : -10

        if (this._felicidad > 100) {
            this._felicidad = 100; // Limita la felicidad a un máximo de 100
        }
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Ciudadano;