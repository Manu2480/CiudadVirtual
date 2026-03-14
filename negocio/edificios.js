/* edificios.js
Catálogo de edificios disponibles para construir.
Compartido por todas las vistas.

Atributos por edificio:
  id, nombre, categoria, imagen, descripcion, costo
  capacidad    → habitantes que puede albergar
  empleos      → puestos de trabajo que genera
  dinero       → ingresos por turno
  electricidad → consumo (-) o producción (+) de energía
  agua         → consumo (-) o producción (+) de agua
  alimento     → producción de alimento por turno
  felicidad    → impacto en la felicidad ciudadana
*/

const _catalogo = [

    /* Pavimentaria */
    {
        id:          "via",
        nombre:      "Vía",
        categoria:   "pavimentaria",
        imagen:      "../../media/edificios/via.png",
        descripcion: "Sendero necesario para conectar edificios.",
        costo:       100,
    },

    /* Residencial */
    {
        id:          "casa",
        nombre:      "Casa",
        categoria:   "residencial",
        imagen:      "../../media/edificios/casa.png",
        descripcion: "Hogar para familias. Aumenta la población.",
        costo:       1000,
        capacidad:   4,
        electricidad: -3,
        agua:        -3,
    },
    {
        id:          "apartamento",
        nombre:      "Apartamento",
        categoria:   "residencial",
        imagen:      "../../media/edificios/departamentos.png",
        descripcion: "Edificio multifamiliar. Alta densidad de población.",
        costo:       3000,
        capacidad:   12,
        electricidad: -15,
        agua:        -10,
    },

    /* Comercial */
    {
        id:          "tienda",
        nombre:      "Tienda",
        categoria:   "comercial",
        imagen:      "../../media/edificios/tienda.png",
        descripcion: "Genera ingresos y aumenta la felicidad del vecindario.",
        costo:       2000,
        empleos:     6,
        dinero:      500,
        electricidad: -8,
    },
    {
        id:          "centro-comercial",
        nombre:      "Centro comercial",
        categoria:   "comercial",
        imagen:      "../../media/edificios/centro-comercial.png",
        descripcion: "Gran centro comercial que genera muchos ingresos.",
        costo:       8000,
        empleos:     20,
        dinero:      2000,
        electricidad: -25,
    },

    /* Industrial */
    {
        id:          "fabrica",
        nombre:      "Fábrica",
        categoria:   "industrial",
        imagen:      "../../media/edificios/fabrica.png",
        descripcion: "Produce bienes pero reduce la felicidad por contaminación.",
        costo:       5000,
        empleos:     15,
        dinero:      800,
        electricidad: -20,
        agua:        -15,
    },
    {
        id:          "granja",
        nombre:      "Granja",
        categoria:   "industrial",
        imagen:      "../../media/edificios/granja.png",
        descripcion: "Provee alimento para la ciudad.",
        costo:       3000,
        empleos:     8,
        alimento:    50,
        agua:        -10,
    },

    /* Servicios */
    {
        id:          "hospital",
        nombre:      "Hospital",
        categoria:   "servicios",
        imagen:      "../../media/edificios/hospital.png",
        descripcion: "Mejora la salud y la felicidad de la población.",
        costo:       6000,
        felicidad:   10,
        electricidad: -20,
        agua:        -10,
    },
    {
        id:          "bombero",
        nombre:      "Estación de bomberos",
        categoria:   "servicios",
        imagen:      "../../media/edificios/bombero.png",
        descripcion: "Reduce desastres y aumenta la seguridad del barrio.",
        costo:       4000,
        felicidad:   10,
        electricidad: -15,
    },
    {
        id:          "policia",
        nombre:      "Estación de policía",
        categoria:   "servicios",
        imagen:      "../../media/edificios/policia.png",
        descripcion: "Mantiene el orden y mejora la felicidad ciudadana.",
        costo:       4000,
        felicidad:   10,
        electricidad: -15,
    },
    {
        id:          "parque",
        nombre:      "Parque",
        categoria:   "servicios",
        imagen:      "../../media/edificios/parque.png",
        descripcion: "Espacio verde que mejora la felicidad del área.",
        costo:       1500,
        felicidad:   5,
    },

    /* Infraestructura */
    {
        id:          "planta-electrica",
        nombre:      "Planta eléctrica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/electrica.png",
        descripcion: "Genera energía para toda la ciudad.",
        costo:       10000,
        electricidad: 200,
    },
    {
        id:          "planta-hidraulica",
        nombre:      "Planta hidráulica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/agua.png",
        descripcion: "Provee agua para la ciudad.",
        costo:       8000,
        electricidad: -20,
        agua:        150,
    },
];

function obtener(id)            { return _catalogo.find(e => e.id === id) || null; }
function porCategoria(categoria){ return _catalogo.filter(e => e.categoria === categoria); }
function categorias()           { return [...new Set(_catalogo.map(e => e.categoria))]; }
function todos()                { return _catalogo; }

window.Edificios = { obtener, porCategoria, categorias, todos };