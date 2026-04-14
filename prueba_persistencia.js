// Prueba guardado y cargado de datos JSON

// Simulamos localStorage para el ambiente de Node.js
const fakeLocalStorage = {};
global.localStorage = {
    setItem: (key, value) => {
        fakeLocalStorage[key] = value;
    },
    getItem: (key) => {
        return fakeLocalStorage[key] || null;
    },
    removeItem: (key) => {
        delete fakeLocalStorage[key];
    }
};

// Cargar todos los modelos en orden de dependencia usando require con fs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Función para ejecutar archivo en contexto global
function cargarModelo(rutaArchivo) {
    const codigo = fs.readFileSync(rutaArchivo, 'utf8');
    vm.runInThisContext(codigo);
}

// Cargar modelos base primero
cargarModelo('./modelos/Edificio.js');
cargarModelo('./modelos/Via.js');
cargarModelo('./modelos/Ciudadano.js');

// Cargar modelos derivados de Edificio
cargarModelo('./modelos/EdificioResidencial.js');
cargarModelo('./modelos/EdificioComercial.js');
cargarModelo('./modelos/EdificioIndustrial.js');
cargarModelo('./modelos/EdificioServicio.js');
cargarModelo('./modelos/PlantaUtilidad.js');

// Cargar edificios específicos
cargarModelo('./modelos/Apartamento.js');
cargarModelo('./modelos/Casa.js');
cargarModelo('./modelos/CentroComercial.js');
cargarModelo('./modelos/EstacionBombero.js');
cargarModelo('./modelos/EstacionPolicia.js');
cargarModelo('./modelos/Fabrica.js');
cargarModelo('./modelos/Granja.js');
cargarModelo('./modelos/Hospital.js');
cargarModelo('./modelos/Tienda.js');
cargarModelo('./modelos/Parque.js');
cargarModelo('./modelos/PlantaElectrica.js');
cargarModelo('./modelos/PlantaHidraulica.js');

// Cargar modelos principales
cargarModelo('./modelos/Terreno.js');
cargarModelo('./modelos/Ciudad.js');

// Cargar acceso a datos y negocio
cargarModelo('./acceso_datos/CiudadStorage.js');
cargarModelo('./negocio/ControladorStorage.js');


// Función auxiliar para comparar objetos
function compararObjetos(obj1, obj2, path = '') {
    const diferencias = [];
    
    // Obtener todas las propiedades
    const props = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    props.forEach(prop => {
        const fullPath = path ? `${path}.${prop}` : prop;
        const val1 = obj1?.[prop];
        const val2 = obj2?.[prop];
        
        // Ignorar propiedades de métodos y funciones
        if (typeof val1 === 'function' || typeof val2 === 'function') {
            return;
        }
        
        // Si son objetos, comparar recursivamente (pero no Arrays de ciudadanos)
        if (val1 && typeof val1 === 'object' && val2 && typeof val2 === 'object' && 
            !Array.isArray(val1) && !Array.isArray(val2) && 
            prop !== 'ciudadanos' && prop !== 'terreno') {
            diferencias.push(...compararObjetos(val1, val2, fullPath));
        }
        // Si son arrays, comparar longitud y algunos elementos
        else if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val1.length !== val2.length) {
                diferencias.push(`❌ ${fullPath}: longitud diferente (${val1.length} vs ${val2.length})`);
            }
        }
        // Valores primitivos
        else if (val1 !== val2) {
            diferencias.push(`[X] ${fullPath}: ${val1} vs ${val2}`);
        }
    });
    
    return diferencias;
}

const vias = [
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0]
];

const edificios = [
    new Casa({ fila: 0, columna: 0 }),
    new Apartamento({ fila: 0, columna: 2 }),
    new Fabrica({ fila: 2, columna: 0 }),
    new Hospital({ fila: 2, columna: 2 }),
    new Granja({ fila: 1, columna: 1 }),
    new Tienda({ fila: 1, columna: 3 }),
    new Parque({ fila: 3, columna: 0 }),
    new CentroComercial({ fila: 3, columna: 2 }),
];

const estadoRecursos = {
    dinero: 50000,
    agua: 1000,
    electricidad: 500,
    alimento: 300,
    felicidad: 75
};

// Crear ciudadanos
const ciudadanos = [
    new Ciudadano('ciudadano1', 50, true, true, { agua: -10, electricidad: -5, alimento: -20 }),
    new Ciudadano('ciudadano2', 60, true, false, { agua: -8, electricidad: -4, alimento: -15 }),
    new Ciudadano('ciudadano3', 45, false, true, { agua: -5, electricidad: -3, alimento: -10 }),
];

// Asignar ciudadanos a edificios
edificios[0].ciudadanos = [ciudadanos[0]];
edificios[1].ciudadanos = [ciudadanos[1], ciudadanos[2]];

const terreno = new Terreno(vias, edificios);
const ciudad = new Ciudad(
    'Ciudad Virtual',
    'Juan Alcalde',
    4.7110,
    -74.0721,
    5000,
    terreno,
    ciudadanos,
    estadoRecursos
);
// Crear una copia profunda para no modificar la original
const ciudadAGuardar = JSON.parse(JSON.stringify(ciudad));
// Necesitamos reconstruir los edificios en la copia
ciudadAGuardar.terreno.edificios = ciudad.terreno.edificios.map(obj => {
    return {
        tipo: obj.constructor.name,
        edificio: JSON.parse(JSON.stringify(obj))
    };
});
CiudadStorage.guardar(ciudadAGuardar);

// PASO 3: Cargar la ciudad
const ciudadCargada = ControladorStorage.cargarCiudad();


// PASO 4: Validar datos

const validaciones = [];
let todoOk = true;

// Validar propiedades básicas de la ciudad
if (ciudadCargada.nombre === ciudad.nombre) {
    validaciones.push('[OK] Nombre de la ciudad coincide');
} else {
    validaciones.push(`[ERROR] Nombre diferente: "${ciudadCargada.nombre}" vs "${ciudad.nombre}"`);
    todoOk = false;
}

if (ciudadCargada.alcalde === ciudad.alcalde) {
    validaciones.push('[OK] Alcalde coincide');
} else {
    validaciones.push(`[ERROR] Alcalde diferente: "${ciudadCargada.alcalde}" vs "${ciudad.alcalde}"`);
    todoOk = false;
}

if (ciudadCargada.latitud === ciudad.latitud) {
    validaciones.push('[OK] Latitud coincide');
} else {
    validaciones.push(`[ERROR] Latitud diferente: ${ciudadCargada.latitud} vs ${ciudad.latitud}`);
    todoOk = false;
}

// Validar recursos
if (JSON.stringify(ciudadCargada.estadoRecursos) === JSON.stringify(ciudad.estadoRecursos)) {
    validaciones.push('[OK] Estado de recursos coincide');
} else {
    validaciones.push('[ERROR}] Estado de recursos diferente');
    todoOk = false;
}

// Validar vías
if (JSON.stringify(ciudadCargada.terreno.vias) === JSON.stringify(ciudad.terreno.vias)) {
    validaciones.push('[OK}] Vías coinciden');
} else {
    validaciones.push('[ERROR] Vías diferentes');
    todoOk = false;
}

// Validar número de ciudadanos
if (ciudadCargada.ciudadanos.length === ciudad.ciudadanos.length) {
    validaciones.push(`[OK}] Número de ciudadanos coincide (${ciudadCargada.ciudadanos.length})`);
} else {
    validaciones.push(`[ERROR] Número de ciudadanos diferente: ${ciudadCargada.ciudadanos.length} vs ${ciudad.ciudadanos.length}`);
    todoOk = false;
}

// Validar ciudadanos
ciudadCargada.ciudadanos.forEach((c, i) => {
    const cOriginal = ciudad.ciudadanos[i];
    if (c.id === cOriginal.id && 
        c.felicidad === cOriginal.felicidad &&
        c.vivienda === cOriginal.vivienda &&
        c.empleo === cOriginal.empleo) {
        validaciones.push(`[OK] Ciudadano ${c.id} cargado correctamente`);
    } else {
        validaciones.push(`[ERROR] Ciudadano ${c.id} con diferencias`);
        todoOk = false;
    }
});

// Validar número de edificios
if (ciudadCargada.terreno.edificios.length === ciudad.terreno.edificios.length) {
    validaciones.push(`[OK] Número de edificios coincide (${ciudadCargada.terreno.edificios.length})`);
} else {
    validaciones.push(`[ERROR] Número de edificios diferente: ${ciudadCargada.terreno.edificios.length} vs ${ciudad.terreno.edificios.length}`);
    todoOk = false;
}

// Validar tipos de edificios
const tiposOriginal = ciudad.terreno.edificios.map(e => e.constructor.name);
const tiposCargados = ciudadCargada.terreno.edificios.map(e => e.constructor.name);

tiposCargados.forEach((tipo, i) => {
    const tipoOrig = tiposOriginal[i];
    if (tipo === tipoOrig) {
        validaciones.push(`[OK] Edificio ${i+1}: ${tipo}`);
    } else {
        validaciones.push(`[ERROR] Edificio ${i+1}: tipo incorrecto - ${tipo} vs ${tipoOrig}`);
        todoOk = false;
    }
});

// Validar propiedades de edificios
ciudadCargada.terreno.edificios.forEach((e, i) => {
    const eOriginal = ciudad.terreno.edificios[i];
    if (e.id === eOriginal.id && 
        e.ubicacion.fila === eOriginal.ubicacion.fila &&
        e.ubicacion.columna === eOriginal.ubicacion.columna) {
        validaciones.push(`[OK] Edificio ${e.id}: ubicación y ID correctos`);
    } else {
        validaciones.push(`[ERROR] Edificio ${e.id}: datos incorrectos`);
        todoOk = false;
    }
});