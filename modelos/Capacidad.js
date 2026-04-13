/*
===============================================================================
Capacidad:
Es la que va a gestionar la capacidad de cada edificio, será una interfaz
en la que se gestionará la posibilidad de agregar a cualquier persona a los
ocupantes del edificio. Las clases que lo hereden definirán las reglas de esto. 
================================================================================
*/
class Capacidad {
    puedeAgregar(rol, ocupantes) {
        throw new Error("Debe implementarse");
    }
    getCapacidad(rol){
        throw new Error("Debe implementarse");
    }
    getDisponibles(rol,ocupantes){
        throw new Error("Debe implementarse");
    }
}