
const Edificio = require("./Edificio");

class Parque extends Edificio {

    static contador = 0;

    constructor(ubicacion) {

        Parque.contador += 1; // Incrementa el contador cada vez que se crea un nuevo parque
        const idParque = "parque" + Parque.contador; // Genera un ID único para el parque

        super(idParque, 1500, ubicacion, 0); // por enunciado el costo es 1500 
        this.recursosEdificio = {felicidad: 5}; // por enunciado el parque aumenta la felicidad en 5
        this.ciudadanos = [];
    }
}

//exportamos la clase para poder usarla en main.js
module.exports = Parque;