const Terreno = require('./modelos/Terreno');
const Ciudad = require('./modelos/Ciudad');
const Casa = require('./modelos/Casa');

const filas = 2, columnas = 2;
const mapa = Array.from({ length: filas }, () => Array(columnas).fill(null));
const vias = Array.from({ length: filas }, () => Array(columnas).fill(0));
const terreno = new Terreno(vias,mapa,[]);
const casa = new Casa('c1',{fila:0,columna:0});
terreno.edificios.push(casa);

const ciudad = new Ciudad('prueba','alcalde',0,0,1000,terreno,[],{dinero:1000,agua:0,electricidad:0,alimento:0,felicidad:0});
ciudad.crearCiudadano(-1,-1,-1);
console.log('antes del turno', ciudad.estadoRecursos);
ciudad.ejecutarTurno();
console.log('despues del turno', ciudad.estadoRecursos);
