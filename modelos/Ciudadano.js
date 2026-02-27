class Ciudadano{

    constructor(id, felicidad, vivienda, empleo, consumoCiudadano){
        this.id = id;
        this.felicidad = felicidad || null;
        this.vivienda = vivienda || null;
        this.empleo = empleo || null;
        this.consumoCiudadano = consumoCiudadano;
    }

    editarConsumoCiudadano(recurso, valor){
        this.consumoCiudadano[recurso] = valor;
    }

    calcularFelicidad(felicidadGeneral){
        this.felicidad = felicidadGeneral
        this.felicidad += this.vivienda ? 20 : -20
        this.felicidad += this.empleo ? 10 : -10

        if (this.felicidad > 100) {
            this.felicidad = 100; // Limita la felicidad a un máximo de 100
        }
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Ciudadano;