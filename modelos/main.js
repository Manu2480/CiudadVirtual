//SIMULACIÓN POR CONSOLA

// Importaciones al inicio para evitar referencias antes de definir variables
// "require" es la manera de importar módulos en Node.js. 
// prompt-sync devuelve una función que solicita texto al usuario; se llama
// inmediatamente con "()" para obtener la función `prompt`.
const prompt = require("prompt-sync")();
// El resto son clases que exportamos desde otros archivos. Están
// asignadas a constantes para poder usarlas más abajo.
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

//CREAMOS EL OBJETO CIUDAD
// dimensiones del terreno. en este ejemplo usamos 4x4.
const filas = 5;
const columnas = 4;
// Aquí creamos dos matrices bidimensionales (arrays de arrays). Array.from
// recibe un objeto con "length" y una función que devuelve el valor de
// cada elemento; usamos una función flecha "() => ..." para crear la fila.
// El operador .fill(null) inicializa cada celda con null.
const vias = Array.from({ length: filas }, () => Array(columnas).fill(0));

// creamos el terreno sin necesidad de matriz "mapa"; la información de
// qué hay en cada celda se obtiene a partir de la lista de edificios.
const terreno = new Terreno(vias, []);
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

console.log("=======================================================");
console.log(`Ciudad creada: ${ciudad.nombre}`);
console.log(`Presupuesto inicial: $${ciudad.estadoRecursos.dinero}`);
console.log("=======================================================\n");

// ===================== MOSTRAR ESTADO DE LA CIUDAD =====================
function mostrarEstadoCiudad() {
  console.log("\n==================== ESTADO DE LA CIUDAD =====================");
  console.log("Manizales\n");
  
  console.log("RECURSOS:");
  console.log(`  Dinero:       $${ciudad.estadoRecursos.dinero}`);
  console.log(`  Agua:         ${ciudad.estadoRecursos.agua}`);
  console.log(`  Electricidad: ${ciudad.estadoRecursos.electricidad}`);
  console.log(`  Alimento:     ${ciudad.estadoRecursos.alimento}`);
  console.log(`  Felicidad:    ${ciudad.estadoRecursos.felicidad.toFixed(2)}`);
  
  console.log("\nPOBLACION:");
  console.log(`  Total ciudadanos: ${ciudad.ciudadanos.length}`);
  if (ciudad.ciudadanos.length > 0) {
    const sinVivienda = ciudad.ciudadanos.filter(c => !c.vivienda).length;
    const sinEmpleo = ciudad.ciudadanos.filter(c => !c.empleo).length;
    console.log(`  Sin vivienda: ${sinVivienda}`);
    console.log(`  Sin empleo: ${sinEmpleo}`);
    ciudad.ciudadanos.forEach(c => {
      console.log(`    - ${c.id}: felicidad=${c.felicidad}, vivienda=${c.vivienda}, empleo=${c.empleo}`);
    });
  }
  
  console.log("\nINFRAESTRUCTURA:");
  if (ciudad.terreno.edificios.length > 0) {
    ciudad.terreno.edificios.forEach(e => {
      // Mostrar primero fila y luego columna para seguir la convención nueva
      const fil = e.ubicacion.fila;
      const col = e.ubicacion.columna;
      console.log(`  - ${e.id} en (${fil},${col}): ${e.ciudadanos.length}/${e.capacidad} ocupados`);
    });
  } else {
    console.log("  Sin edificios");
  }
  
  console.log("");
}

// ===================== MOSTRAR MAPA =====================
function mostrarMapa() {
  console.log("\n==================== MAPA DE TERRENO ====================");
  // recorremos todas las celdas y preguntamos al terreno qué hay allí
  for (let f = 0; f < filas; f++) {
    let line = "";
    for (let c = 0; c < columnas; c++) {
      const cell = ciudad.terreno.ubicacionInfraestructura(f, c);
      if (cell) {
        line += `${cell.id}`.padEnd(12);
      } else {
        line += " . ".padEnd(12);
      }
    }
    console.log(line);
  }
}

// ===================== CONSTRUIR INFRAESTRUCTURA =====================
function construirInfraestructura() {
  console.log("\n==================== CONSTRUIR INFRAESTRUCTURA ====================");
  
  console.log("\nTipo de infraestructura:");
  console.log("1. Vía               (Costo: 500)");
  console.log("2. Planta Eléctrica  (Costo: 3000)");
  console.log("3. Planta Hidráulica (Costo: 3000)");
  console.log("4. Casa              (Costo: 1000)");
  console.log("5. Apartamento       (Costo: 1500)");
  console.log("6. Tienda            (Costo: 2000)");
  console.log("7. Centro Comercial  (Costo: 4000)");
  console.log("8. Estación Bomberos (Costo: 2500)");
  console.log("9. Estación Policía  (Costo: 2500)");
  console.log("10. Hospital         (Costo: 5000)");
  console.log("11. Parque           (Costo: 1500)");
  console.log("12. Fábrica          (Costo: 5000)");
  console.log("13. Granja           (Costo: 2000)");
  console.log("0. Cancelar");

  const tipo = prompt("Seleccione tipo: ");
  if (tipo === "0") {
    console.log("Construcción cancelada.");
    return;
  }

  // pedimos primero la fila y luego la columna, siguiendo la nueva convención
  const fila = parseInt(prompt("Ingrese fila (0-3): "), 10);
  const columna = parseInt(prompt("Ingrese columna (0-3): "), 10);

  if (fila < 0 || fila >= filas || columna < 0 || columna >= columnas) {
    console.log("[ERROR] Posicion fuera del mapa");
    return;
  }

  let edificio;
  switch (tipo) {
    case "1":
      edificio = new Via({ fila, columna });
      break;
    case "2":
      edificio = new PlantaElectrica({ fila, columna });
      break;
    case "3":
      edificio = new PlantaHidraulica({ fila, columna });
      break;
    case "4":
      edificio = new Casa({ fila, columna });
      break;
    case "5":
      edificio = new Apartamento({ fila, columna });
      break;
    case "6":
      edificio = new Tienda({ fila, columna });
      break;
    case "7":
      edificio = new CentroComercial({ fila, columna });
      break;
    case "8":
      edificio = new EstacionBombero({ fila, columna });
      break;
    case "9":
      edificio = new EstacionPolicia({ fila, columna });
      break;
    case "10":
      edificio = new Hospital({ fila, columna });
      break;
    case "11":
      edificio = new Parque({ fila, columna });
      break;
    case "12":
      edificio = new Fabrica({ fila, columna });
      break;
    case "13":
      edificio = new Granja({ fila, columna });
      break;
    default:
      console.log("[ERROR] Tipo invalido");
      return;
  }

  // Intentar crear la infraestructura
  // parámetros ahora son (fila, columna, edificio)
  const resultado = ciudad.terreno.crearInfraestructura(fila, columna, edificio);
  
  if (resultado.exito) {
    // Descontar el costo del dinero
    ciudad.modificarRecurso("dinero", -resultado.costo);
    console.log(`[OK] ${resultado.mensaje}`);
    console.log(`[OK] Dinero deducido: $${resultado.costo}`);
    console.log(`[OK] Dinero disponible: $${ciudad.estadoRecursos.dinero}`);
  } else {
    console.log(`[ERROR] ${resultado.mensaje}`);
  }
}

// ===================== DEMOLER INFRAESTRUCTURA =====================
function demolerInfraestructura() {
  console.log("\n==================== DEMOLER INFRAESTRUCTURA ====================");

  // solicitamos fila primero, luego columna
  const fila = parseInt(prompt("Ingrese fila a demoler (0-3): "), 10);
  const columna = parseInt(prompt("Ingrese columna a demoler (0-3): "), 10);

  if (columna < 0 || columna >= columnas || fila < 0 || fila >= filas) {
    console.log("[ERROR] Posicion fuera del mapa");
    return;
  }

  // cambiar orden de argumentos a (fila, columna)
  const resultado = ciudad.terreno.eliminarInfraestructura(fila, columna);
  
  if (resultado.exito) {
    // Sumar reembolso al dinero
    ciudad.modificarRecurso("dinero", resultado.reembolso);
    console.log(`[OK] ${resultado.mensaje}`);
    console.log(`[OK] Dinero reembolsado: $${resultado.reembolso}`);
    console.log(`[OK] Dinero disponible: $${ciudad.estadoRecursos.dinero}`);
  } else {
    console.log(`[ERROR] ${resultado.mensaje}`);
  }
}

// ===================== EJECUTAR TURNO =====================
function ejecutarTurno() {
  console.log("\n==================== EJECUTANDO TURNO ====================");
  
  // Ejecutar las mecánicas del turno
  ciudad.ejecutarTurno();
  
  // Mostrar estado final
  console.log("\nESTADO DESPUES DEL TURNO:");
  console.log(`  Poblacion: ${ciudad.ciudadanos.length}`);
  console.log(`  Dinero: $${ciudad.estadoRecursos.dinero}`);
  console.log(`  Agua: ${ciudad.estadoRecursos.agua}`);
  console.log(`  Electricidad: ${ciudad.estadoRecursos.electricidad}`);
  console.log(`  Alimento: ${ciudad.estadoRecursos.alimento}`);
  console.log(`  Felicidad promedio: ${ciudad.estadoRecursos.felicidad.toFixed(2)}`);
  
  // Verificar si hay game over
  const negativos = ciudad.recursosNegativos();
  if (negativos.length > 0) {
    console.log(`\n[ALERTA] Recursos negativos - ${negativos.join(", ")}`);
  }
}

// ===================== MENU PRINCIPAL =====================
function menu() {
  let enJuego = true;
  
  while (enJuego) {
    console.log("\n==================== CIUDAD VIRTUAL ====================");
    console.log("====================  MENU PRINCIPAL  ====================");
    console.log("1. Ver estado de la ciudad");
    console.log("2. Construir infraestructura");
    console.log("3. Demoler infraestructura");
    console.log("4. Ejecutar turno");
    console.log("5. Ver ciudadanos");
    console.log("6. Ver edificios");
    console.log("7. Consultar mapa");
    console.log("0. Salir del juego");

    const opcion = prompt("\nSeleccione una opción: ");

    switch (opcion) {
      case "0":
        console.log("\nGracias por jugar Ciudad Virtual. Hasta luego.");
        enJuego = false;
        break;
      case "1":
        mostrarEstadoCiudad();
        break;
      case "2":
        construirInfraestructura();
        break;
      case "3":
        demolerInfraestructura();
        break;
      case "4":
        ejecutarTurno();
        break;
      case "5":
        console.log("\n==================== CIUDADANOS ====================");
        if (ciudad.ciudadanos.length === 0) {
          console.log("No hay ciudadanos en la ciudad");
        } else {
          ciudad.ciudadanos.forEach(c => {
            console.log(`${c.id}:`);
            console.log(`  - Felicidad: ${c.felicidad}`);
            console.log(`  - Vivienda: ${c.vivienda ? "SI" : "NO"}`);
            console.log(`  - Empleo: ${c.empleo ? "SI" : "NO"}`);
            console.log(`  - Consumo: agua=${c.consumoCiudadano.agua}, electricidad=${c.consumoCiudadano.electricidad}, alimento=${c.consumoCiudadano.alimento}`);
          });
        }
        break;
      case "6":
        console.log("\n==================== EDIFICIOS ====================");
        if (ciudad.terreno.edificios.length === 0) {
          console.log("No hay edificios en la ciudad");
        } else {
          ciudad.terreno.edificios.forEach(e => {
            console.log(`${e.id}:`);
            console.log(`  - Costo: $${e.costo}`);
            console.log(`  - Capacidad: ${e.capacidad}`);
            console.log(`  - Ocupación: ${e.ciudadanos.length}/${e.capacidad}`);
            console.log(`  - Recursos: ${JSON.stringify(e.recursosEdificio)}`);
          });
        }
        break;
      case "7":
        mostrarMapa();
        break;
      default:
        console.log("[ERROR] Opcion invalida");
    }
  }
}

// Iniciar el juego
menu();