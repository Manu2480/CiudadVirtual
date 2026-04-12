class CapacidadNula extends Capacidad {
    puedeAgregar() {
        return false;
    }
    getCapacidad(){
        return 0;
    }
    getDisponibles(){
        return 0;
    }
}