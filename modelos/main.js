//SIMULACIÓN POR CONSOLA

// Importaciones al inicio para evitar referencias antes de definir variables
const prompt = require("prompt-sync")();
const Terreno = require("./Terreno");
const Ciudad = require("./Ciudad");
const Via = require("./Via");
const PlantaElectrica = require("./PlantaElectrica");
const PlantaHidraulica = require("./PlantaHidraulica");
const Casa = require("./Casa");
const Apartamento = require("./Apartamento");
const Tienda = require("./Tienda");
const CentroComercial = require("./CentroComercial");
const EstacionBombero = require("./EstacionBombero");
const EstacionPolicia = require("./EstacionPolicia");
const Hospital = require("./Hospital");
const Parque = require("./Parque");
const Fabrica = require("./Fabrica");
const Granja = require("./Granja");

//CREAMOS EL OBJETO CIUDAD ------------------------------
const filas = 4;
const columnas = 4;
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

console.log("Ciudad inicial:", ciudad.nombre);

// CREAMOS EL OBJETO VIA
function crearVia() {
  const fila = parseInt(prompt("Ingrese fila: "), 10);
  const columna = parseInt(prompt("Ingrese columna: "), 10);
  const via = new Via({ fila, columna });
  ciudad.terreno.crearInfraestructura(fila, columna, via);
  console.log("Vía creada:", via);
}

//MOSTRAMOS EK MENU DE EDIFICIOS
function crearEdificio() {
  console.log("Seleccione tipo de edificio:");
  console.log("1. Planta Electrica");
  console.log("2. Planta Hidraulica");
  console.log("3. Casa");
  console.log("4. Apartamento");
  console.log("5. Tienda");
  console.log("6. Centro Comercial");
  console.log("7. Estacion Bomberos");
  console.log("8. Estacion Policia");
  console.log("9. Hospital");
  console.log("10. Parque");
  console.log("11. Fabrica");
  console.log("12. Granja");
  console.log("0. Cancelar");

  const tipo = prompt("Opción: ");
  if (tipo === "0") return;

  const fila = parseInt(prompt("Ingrese fila: "), 10); //10 significa base decimal. convertimos el '5' a numero
  const columna = parseInt(prompt("Ingrese columna: "), 10);
  let edificio;

  switch (tipo) {
    case "1":
      edificio = new PlantaElectrica({ fila, columna });
      break;
    case "2":
      edificio = new PlantaHidraulica({ fila, columna });
      break;
    case "3":
      edificio = new Casa({ fila, columna });
      break;
    case "4":
      edificio = new Apartamento({ fila, columna });
      break;
    case "5":
      edificio = new Tienda({ fila, columna });
      break;
    case "6":
      edificio = new CentroComercial({ fila, columna });
      break;
    case "7":
      edificio = new EstacionBombero({ fila, columna });
      break;
    case "8":
      edificio = new EstacionPolicia({ fila, columna });
      break;
    case "9":
      edificio = new Hospital({ fila, columna });
      break;
    case "10":
      edificio = new Parque({ fila, columna });
      break;
    case "11":
      edificio = new Fabrica({ fila, columna });
      break;
    case "12":
      edificio = new Granja({ fila, columna });
      break;
    default:
      console.log("Tipo inválido");
      return;
  }

  ciudad.terreno.crearInfraestructura(fila, columna, edificio);
  console.log("Edificio creado:", edificio);
}

function mostrarCiudad() {
  ciudad.calcularFelicidadPromedio();
  console.log(ciudad.estadoRecursos)
  console.log(ciudad.ciudadanos);
  console.log(ciudad.terreno.edificios)
}

// Bucle principal del menú
function menu() {
  while (true) {
    console.log("\n*** Menú Ciudad Virtual ***");
    console.log("1. Crear vía");
    console.log("2. Crear edificio");
    console.log("3. Crear ciudadanos");
    console.log("4. Iniciar simulación automática");
    console.log("5. Pausar simulación");
    console.log("6. Mostrar ciudad completa");
    console.log("0. Salir");

    const opcion = prompt("Seleccione una opción: ");

    switch (opcion) {
      case "0":
        console.log("Saliendo...");
        return;
      case "1":
        crearVia();
        break;
      case "2":
        crearEdificio();
        break;
      case "3":
        let contador = 0;
        while (ciudad.aumentarPoblacion() && contador <= 3) {
            ciudad.crearCiudadano(-1, -1, -1); //ejemplo de consumo para cada ciudadano
            contador += 1; 
        };
        break;
      case "4":
        //iniciarSimulacion();
        break;
      case "5":
        //pausarSimulacion();
        break;
      case "6":
        mostrarCiudad();
        break;
      default:
        console.log("Opción inválida");
    }
  }
}

menu();