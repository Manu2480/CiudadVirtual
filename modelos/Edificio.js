//Importamos ciudadano para poder tener el if if (!(persona instanceof Ciudadano))
const Ciudadano = require("./Ciudadano");

class Edificio{

    //no mandamos recursosEdificio ni ciudadanos en este constructor porque cada edificio los va a definir de manera diferente
    constructor(id, costo, ubicacion, capacidad){

        // Verificar que no se intente instanciar la clase abstracta directamente si se puede hacer ejemplo new Casa()
        if (new.target === Edificio) { //new.target es una propiedad que se refiere al constructor que fue llamado con new. Si new.target es igual a Edificio, significa que se está intentando crear una instancia de Edificio directamente, lo cual no está permitido porque es una clase abstracta.
            throw new TypeError("No se puede instanciar la clase abstracta Edificio directamente");
        }

        this.id = id;
        this.costo = costo;
        this.ubicacion = ubicacion;
        this.capacidad = capacidad;

        this.recursosEdificio = {}; // Los recursos seran definidos en las clases hijas mas concretas
        this.ciudadanos = []; // inicialmente vacío, se llenará con objetos Ciudadano
    }

    //Metodo para agregar ciudadano al edificio, se implementará en las clases hijas
    agregarPersona(persona) {
        if (!(persona instanceof Ciudadano)) {
            console.log("El objeto proporcionado no es una instancia de Ciudadano.");
            return;
        }
        if (this.ciudadanos.length < this.capacidad) {
            this.ciudadanos.push(persona);
        } else {
            console.log("No se puede agregar más ciudadanos, capacidad máxima alcanzada.");
        }
    }

}
//exportamos la clase para poder usarla en main.js
module.exports = Edificio;