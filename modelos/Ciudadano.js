class Ciudadano{
    //Se implementa el constructor de ciudadano, especificando que si no se mandan ciertos atributos se asuman null.
    constructor(id, felicidad = 0, vivienda = null, empleo = null, consumoCiudadano){
        this.id = id;
        // la felicidad arranca en cero si no se pasa valor (antes podía quedar null)
        this.felicidad = felicidad;
        this.vivienda = vivienda;
        this.empleo = empleo;
        this.consumoCiudadano = consumoCiudadano;
    }

    //Se edita el consumo del ciudadano para un único recurso, según la necesidad del sistema
    editarConsumoCiudadano(recurso, valor){
        this.consumoCiudadano[recurso] = valor;
    }

    //Se calcula la felicidad individual del ciudadano, según el paramétro de felicidad general dada por las edificaciones
    calcularFelicidad(felicidadGeneral){
        // la fórmula deja la felicidad igual al valor general de infraestructura
        // y luego aplica bonos/malos por vivienda y empleo.
        this.felicidad = felicidadGeneral;
        this.felicidad += this.vivienda ? 20 : -20;
        this.felicidad += this.empleo ? 10 : -10;

        // límites
        if (this.felicidad > 100) this.felicidad = 100;
        if (this.felicidad < 0) this.felicidad = 0;
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Ciudadano;