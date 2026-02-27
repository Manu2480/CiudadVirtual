
   
//SIMULACIÓN POR CONSOLA


//CREAMOS EL OBJETO CIUDAD ------------------------------
//IMPORTAMOS  
const Terreno = require("./Terreno");
const Ciudad = require("./Ciudad");
//Asi se hace un matriz en js y punto
const filas = 15;
const columnas = 15;
const mapa = Array.from({ length: filas }, () =>
    Array(columnas).fill(null)
);

const vias = Array.from({ length: filas }, () =>
    Array(columnas).fill(0)
);
//Creamos terreno y ciudad con ese terreno
const terreno = new Terreno(vias, mapa, []);
const ciudad = new Ciudad("Manizales", "pepito perez", 1000, 2000, 10000, terreno, [], { dinero: 50000, agua: 0, electricidad: 0, alimento: 0,felicidad: 0})
//mostramos en consola la ciudad entera
console.log(ciudad.nombre);
//ciudad.iniciarSimulacion();

/**
No se puede [0][0] Porque [0] es un array con un solo elemento, y [0][0] 
intenta acceder a la posición 0 de ese 0.
*/

//CREAMOS EL OBJETO Via ------------------------------
const Via = require("./Via");
const via = new Via({ fila: 0, columna: 1 }); //tambien podria ser (0,0)
console.log(via);
ciudad.terreno.crearInfraestructura(via.ubicacion.fila, via.ubicacion.columna, via);

//CREAMOS EL OBJETO PlantaElectrica ------------------------------
const PlantaElectrica = require("./PlantaElectrica");
const planta = new PlantaElectrica({ fila: 0, columna: 0 }); //tambien podria ser (0,0)
console.log(planta);
ciudad.terreno.crearInfraestructura(planta.ubicacion.fila, planta.ubicacion.columna, planta);
console.log("Nuevo edificio en el arreglo de edificios de terreno ----------------------------------------")
console.log(ciudad.terreno.edificios)

console.log("Ciudad completa ----------------------------------------")
console.log(ciudad)

//cIUDADANO
const Ciudadano = require("./Ciudadano");