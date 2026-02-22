
class Tienda extends EdificioComercial {

    static contador = 0;

    constructor(ubicacion) {

        Tienda.contador += 1;
        const idTienda = "tienda" + Tienda.contador; // Genera un ID único para la tienda
        super(idTienda, 2000, ubicacion, 6);
        this.recursosEdificio["dinero"] = 500;
        this.recursosEdificio["electricidad"] = -8;
    }
    
    //sin electricidad no dan ingresos
}