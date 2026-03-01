//Entorno sintetico con el fin de poder visualizar el proceso del Storage
document.addEventListener("DOMContentLoaded", function () {
    const filas = 15;
    const columnas = 15;
    const mapa = Array.from({ length: filas }, () => Array(columnas).fill(null));
    const vias = Array.from({ length: filas }, () => Array(columnas).fill(0));
    const terreno = new Terreno(vias, mapa, []);
    const ciudad = new Ciudad(
        "Manizales",
        "pepito perez",
        1000,
        2000,
        10000,
        terreno,
        [],
        { dinero: 50000, agua: 0, electricidad: 0, alimento: 0, felicidad: 0 }
    );
    console.log(ciudad.nombre)
})