const Terreno = require('./modelos/Terreno');
const Ciudad = require('./modelos/Ciudad');
const Casa = require('./modelos/Casa');
const Via = require('./modelos/Via');

// configuramos un terreno pequeño para probar orientación
const filas = 2, columnas = 2;
const mapa = Array.from({ length: filas }, () => Array(columnas).fill(null));
const vias = Array.from({ length: filas }, () => Array(columnas).fill(0));
const terreno = new Terreno(vias, mapa, []);

// intento construir casa en (0,0) sin vía -> fallará
const casa = new Casa('c1',{fila:0,columna:0});
const r1 = terreno.crearInfraestructura(0,0,casa);
console.log('resultado casa1', r1);
console.log('mapa tras intento:', terreno.mapa);

// construyo vía en (0,1) y reintento
terreno.crearInfraestructura(0,1,new Via({fila:0,columna:1}));
const r2 = terreno.crearInfraestructura(0,0,casa);
console.log('resultado casa2', r2);
console.log('mapa final:', terreno.mapa);

// ahora creo ciudad y corro un turno como antes
const ciudad = new Ciudad('prueba','alcalde',0,0,1000,terreno,[],{dinero:1000,agua:0,electricidad:0,alimento:0,felicidad:0});
ciudad.crearCiudadano(-1,-1,-1);
console.log('antes del turno', ciudad.estadoRecursos);
ciudad.ejecutarTurno();
console.log('despues del turno', ciudad.estadoRecursos);
