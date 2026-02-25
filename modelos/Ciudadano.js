class Ciudadano{
    constructor(id){
        this._id = id;
        this._felicidad;
        this._vivienda;
        this._empleo;
        this._consumoCiudadano = {};
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