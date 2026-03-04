//Entorno sintetico con el fin de poder visualizar el proceso del Storage
document.addEventListener("DOMContentLoaded", function () {
    const filas = 15;
    const columnas = 15;
    const vias = Array.from({ length: filas }, () => Array(columnas).fill(0));
    const terreno = new Terreno(vias, []);
    const ciudadano1 = new Ciudadano(1, null, null, null, consumoCiudadano={'Agua': 1, 'Electricidad': 2});
    const ciudadano2 = new Ciudadano(2, null, null, null, consumoCiudadano={'Agua': 1, 'Electricidad': 2});
    const ciudad = new Ciudad(
        "Manizales",
        "pepito perez",
        1000,
        2000,
        10000,
        terreno,
        [ciudadano1, ciudadano2],
        { dinero: 50000, agua: 0, electricidad: 0, alimento: 0, felicidad: 0 }
    );
    const via1 = new Via({fila: 2, columna: 1});
    const via2 = new Via({fila: 2, columna: 2});
    const via3 = new Via({fila: 2, columna: 3});
    const casa = new Casa({fila: 3, columna: 2});
    const tienda = new Tienda({fila: 1, columna: 1});

    terreno.crearInfraestructura(2, 1, via1);
    terreno.crearInfraestructura(2, 2, via2);
    terreno.crearInfraestructura(2, 3, via3);
    terreno.crearInfraestructura(3, 2, casa);
    terreno.crearInfraestructura(1, 1, tienda);
    ciudad.asignarVivienda(ciudadano1);
    ciudad.asignarEmpleo(ciudadano1);
    ciudad.asignarVivienda(ciudadano2);
    ciudad.asignarEmpleo(ciudadano2);
    ControladorStorage.guardarCiudad(ciudad);
    ciudadnueva = ControladorStorage.cargarCiudad();
    console.log(ciudadnueva)
    console.log(ciudadnueva.terreno.edificios[4] instanceof Tienda)
    
})