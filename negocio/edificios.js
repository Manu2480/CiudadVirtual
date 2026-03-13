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

    /* ── Residencial ─────────────────────────── */
    {
        id:          "casa",
        nombre:      "Casa",
        categoria:   "residencial",
        imagen:      "../../media/edificios/casa.png",
        descripcion: "Hogar para familias. Aumenta la población y la felicidad.",
        costo:       500,
        poblacion:   4,
        felicidad:   2,
        energia:     -1,
    },
    {
        id:          "apartamento",
        nombre:      "Apartamento",
        categoria:   "residencial",
        imagen:      "../../media/edificios/departamentos.png",
        descripcion: "Edificio multifamiliar. Alta densidad de población.",
        costo:       1500,
        poblacion:   20,
        felicidad:   1,
        energia:     -4,
    },

    /* ── Comercial ───────────────────────────── */
    {
        id:          "tienda",
        nombre:      "Tienda",
        categoria:   "comercial",
        imagen:      "../../media/edificios/tienda.png",
        descripcion: "Genera ingresos y aumenta la felicidad del vecindario.",
        costo:       800,
        poblacion:   0,
        felicidad:   3,
        energia:     -2,
    },
    {
        id:          "centro-comercial",
        nombre:      "Centro comercial",
        categoria:   "comercial",
        imagen:      "../../media/edificios/centro-comercial.png",
        descripcion: "Gran centro comercial que genera muchos ingresos.",
        costo:       6500,
        poblacion:   0,
        felicidad:   5,
        energia:     -20,
    },

    /* ── Industrial ──────────────────────────── */
    {
        id:          "fabrica",
        nombre:      "Fábrica",
        categoria:   "industrial",
        imagen:      "../../media/edificios/fabrica.png",
        descripcion: "Produce bienes pero reduce la felicidad por contaminación.",
        costo:       2000,
        poblacion:   0,
        felicidad:   -5,
        energia:     -15,
    },
    {
        id:          "granja",
        nombre:      "Granja",
        categoria:   "industrial",
        imagen:      "../../media/edificios/granja.png",
        descripcion: "Provee alimento para la ciudad y genera recursos.",
        costo:       2500,
        poblacion:   0,
        felicidad:   2,
        energia:     -10,
    },

    /* ── Servicios ───────────────────────────── */
    {
        id:          "hospital",
        nombre:      "Hospital",
        categoria:   "servicios",
        imagen:      "../../media/edificios/hospital.png",
        descripcion: "Mejora la salud y la felicidad de la población.",
        costo:       4000,
        poblacion:   0,
        felicidad:   10,
        energia:     -12,
    },
    {
        id:          "bombero",
        nombre:      "Estación de bomberos",
        categoria:   "servicios",
        imagen:      "../../media/edificios/bombero.png",
        descripcion: "Reduce desastres y aumenta la seguridad del barrio.",
        costo:       3200,
        poblacion:   0,
        felicidad:   8,
        energia:     -10,
    },
    {
        id:          "policia",
        nombre:      "Estación de policía",
        categoria:   "servicios",
        imagen:      "../../media/edificios/policia.png",
        descripcion: "Mantiene el orden y mejora la felicidad ciudadana.",
        costo:       3200,
        poblacion:   0,
        felicidad:   7,
        energia:     -10,
    },
    {
        id:          "parque",
        nombre:      "Parque",
        categoria:   "servicios",
        imagen:      "../../media/edificios/parque.png",
        descripcion: "Espacio verde que mejora mucho la felicidad del área.",
        costo:       600,
        poblacion:   0,
        felicidad:   12,
        energia:     0,
    },

    /* ── Infraestructura ─────────────────────── */
    {
        id:          "planta-electrica",
        nombre:      "Planta eléctrica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/electrica.png",
        descripcion: "Genera energía para toda la ciudad.",
        costo:       5000,
        poblacion:   0,
        felicidad:   -3,
        energia:     50,
    },
    {
        id:          "planta-hidraulica",
        nombre:      "Planta hidráulica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/agua.png",
        descripcion: "Provee agua para la ciudad y mejora el suministro.",
        costo:       4500,
        poblacion:   0,
        felicidad:   -2,
        energia:     30,
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