
class Via extends Edificio{

    // Contador estático para asignar IDs únicos a cada vía
    static contador = 0;

    // Esta clase por el momento no tiene recursos específicos, pero se puede extender en el futuro si es necesario
    constructor(ubicacion) {

        Via.contador += 1; // Incrementa el contador cada vez que se crea una nueva vía
        const idVia = "via" + Via.contador; // Genera un ID único para la vía

        //el id se genera automáticamente, el costo es 100 y su capacidad es 0 por enunciado
        super(idVia, 100, ubicacion, 0);
        this.recursosEdificio = {}; // Las vías no tienen recursos específicos por ahora
        this.ciudadanos = []; // Las vías no tienen ciudadanos asociados, pero se puede llenar si es necesario
    }
}