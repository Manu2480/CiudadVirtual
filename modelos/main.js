
   
//SIMULACIÓN POR CONSOLA

const Terreno = require("./Terreno");
const Ciudad = require("./Ciudad");
const PlantaElectrica = require("./PlantaElectrica")

const filas = 15;
const columnas = 15;

//Asi se hace un matriz en js y punto
const mapa = Array.from({ length: filas }, () =>
    Array(columnas).fill(null)
);

const vias = Array.from({ length: filas }, () =>
    Array(columnas).fill(0)
);

const terreno = new Terreno(vias, mapa, []);
const ciudad = new Ciudad("Manizales", "pepito perez", 1000, 2000, 10000, terreno, [], { dinero: 50000, agua: 0, electricidad: 0, alimento: 0,felicidad: 0})

console.log(ciudad);
//ciudad.iniciarSimulacion();

/**
No se puede [0][0] Porque [0] es un array con un solo elemento, y [0][0] 
intenta acceder a la posición 0 de ese 0.
*/
const edificioNuevo = new PlantaElectrica({ fila: 0, columna: 0 });
const edificioNuevo2 = new PlantaElectrica(1, 1);
console.log(edificioNuevo.id)
ciudad.terreno.crearInfraestructura(0,0,edificioNuevo);