const Ciudad = require('./modelos/Ciudad');

const cjson = {
  nombre: 'Prueba',
  alcalde: 'A',
  latitud: 0,
  longitud: 0,
  tiempoTurno: 1000,
  estadoRecursos: { dinero: 1000, agua: 0, electricidad: 0, alimento: 0, felicidad: 0 },
  terreno: { vias: [] },
  ciudadanos: [
    { id: 'bad_id', felicidad: 10 },
    { id: 'ciudadano1', felicidad: 20 },
    { id: 'ciudadano1', felicidad: 30 },
    {},
    {}
  ]
};

const ciudad = Ciudad.fromData(cjson);
console.log('Ciudad ciudadanos:', ciudad.ciudadanos.map(c => c.id));
console.log('Ciudad.contador=', Ciudad.contador);
