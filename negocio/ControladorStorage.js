class ControladorStorage{
    static guardarCiudad(ciudad){
        console.log(ciudad.terreno.edificios.length)
        let edificios = ciudad.terreno.edificios.map(obj => {
            return {
                tipo: obj.constructor.name,
                edificio: obj
            };
        });
        console.log(edificios.length)

        ciudad.terreno.edificios = edificios;

        CiudadStorage.guardar(ciudad)
    }
}