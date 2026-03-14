/* ================================================
EDIFICIOS.JS
Catálogo de edificios disponibles para construir.
Compartido por todas las vistas.

Cada edificio tiene:
  id          - Identificador único (string)
  nombre      - Nombre visible en la UI
  categoria   - Para agrupar en el menú de construcción
  imagen      - Ruta al sprite/imagen del edificio
  descripcion - Texto descriptivo para el modal
  costo       - Precio en dinero para construir
  poblacion   - Habitantes que aporta (puede ser 0)
  felicidad   - Puntos de felicidad (+/-)
  energia     - Consumo/producción de energía (+/-)

Las vistas leen este catálogo para poblar el menú de
construcción (tabs en móvil, sidebar en tablet/desktop).
================================================ */


/* ================================================
CATÁLOGO COMPLETO
================================================ */
const _catalogo = [

    
    /* ── Carretera ─────────────────────────── */
    {
        id:          "via",
        nombre:      "via",
        categoria:   "padimentaria",
        imagen:      "../../media/edificios/via.png",
        descripcion: "Sendero necesario para conectar edificios. No aporta recursos pero es esencial para el desarrollo urbano.",
        costo:       100,
    },

    /* ── Residencial ─────────────────────────── */
    {
        id:          "casa",
        nombre:      "Casa",
        categoria:   "residencial",
        imagen:      "../../media/edificios/casa.png",
        descripcion: "Hogar para familias. Aumenta la población y la felicidad.",
        costo:       1000,
        capacidad:   4,
        electricidad: -3,
        agua: -3,
    },
    {
        id:          "apartamento",
        nombre:      "Apartamento",
        categoria:   "residencial",
        imagen:      "../../media/edificios/departamentos.png",
        descripcion: "Edificio multifamiliar. Alta densidad de población.",
        costo:       3000,
        capacidad:   12,
        electricidad:  -15,
        agua: -10,
    },

    /* ── Comercial ───────────────────────────── */
    {
        id:          "tienda",
        nombre:      "Tienda",
        categoria:   "comercial",
        imagen:      "../../media/edificios/tienda.png",
        descripcion: "Genera ingresos y aumenta la felicidad del vecindario.",
        costo:       2000,
        empleos:   6,
        dinero:   500,
        electricidad:  -8,
    },
    {
        id:          "centro-comercial",
        nombre:      "Centro comercial",
        categoria:   "comercial",
        imagen:      "../../media/edificios/centro-comercial.png",
        descripcion: "Gran centro comercial que genera muchos ingresos.",
        costo:       8000,
        empleos:   20,
        dinero:   2000,
        electricidad:  -25,
    },

    /* ── Industrial ──────────────────────────── */
    {
        id:          "fabrica",
        nombre:      "Fábrica",
        categoria:   "industrial",
        imagen:      "../../media/edificios/fabrica.png",
        descripcion: "Produce bienes pero reduce la felicidad por contaminación.",
        costo:       5000,
        empleos:   15,
        dinero:   800,
        electricidad:  -20,
        agua: -15,
    },
    {
        id:          "granja",
        nombre:      "Granja",
        categoria:   "industrial",
        imagen:      "../../media/edificios/granja.png",
        descripcion: "Provee alimento para la ciudad y genera recursos.",
        costo:       3000,
        empleos:   8,
        alimento:   50,
        agua:        -10,
    },

    /* ── Servicios ───────────────────────────── */
    {
        id:          "hospital",
        nombre:      "Hospital",
        categoria:   "servicios",
        imagen:      "../../media/edificios/hospital.png",
        descripcion: "Mejora la salud y la felicidad de la población.",
        costo:       6000,
        felicidad:   10,
        electricidad:     -20,
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

    /* ── Infraestructura ─────────────────────── */
    {
        id:          "planta-electrica",
        nombre:      "Planta eléctrica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/electrica.png",
        descripcion: "Genera energía para toda la ciudad.",
        costo:       10000,
        electricidad:  200,
    },
    {
        id:          "planta-hidraulica",
        nombre:      "Planta hidráulica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/agua.png",
        descripcion: "Provee agua para la ciudad y mejora el suministro.",
        costo:       8000,
        electricidad:   -20,
        agua: 150,
    },
];


/* ================================================
FUNCIONES DE ACCESO AL CATÁLOGO
================================================ */

/**
 * Devuelve el edificio con el id indicado, o null si no existe.
 * @param {string} id
 * @returns {object|null}
 */
function obtener(id) {
    return _catalogo.find(e => e.id === id) || null;
}

/**
 * Devuelve todos los edificios de una categoría.
 * @param {string} categoria
 * @returns {object[]}
 */
function porCategoria(categoria) {
    return _catalogo.filter(e => e.categoria === categoria);
}

/**
 * Devuelve todas las categorías disponibles (sin duplicados).
 * @returns {string[]}
 */
function categorias() {
    return [...new Set(_catalogo.map(e => e.categoria))];
}

/**
 * Devuelve el catálogo completo.
 * @returns {object[]}
 */
function todos() {
    return _catalogo;
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Edificios = {
    obtener,
    porCategoria,
    categorias,
    todos,
};