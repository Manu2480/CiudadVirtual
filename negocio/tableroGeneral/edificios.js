/* edificios.js
Catálogo de edificios disponibles para construir.
Compartido por todas las vistas.

Los datos numéricos (costo, capacidad, recursos) se leen directamente
de cada clase modelo mediante su propiedad estática `catalogoInfo`,
evitando duplicación y garantizando una única fuente de verdad.
*/

let _catalogo = [

    /* Pavimentaria */
    {
        id:          "via",
        nombre:      "Vía",
        categoria:   "pavimentaria",
        imagen:      "../../media/edificios/via.png",
        descripcion: "Sendero necesario para conectar edificios.",
        clase: Via,
        ...Via.catalogoInfo,
    },

    /* Residencial */
    {
        id:          "casa",
        nombre:      "Casa",
        categoria:   "residencial",
        imagen:      "../../media/edificios/casa.png",
        descripcion: "Hogar para familias. Aumenta la población.",
        clase: Casa,
        ...Casa.catalogoInfo,
    },
    {
        id:          "apartamento",
        nombre:      "Apartamento",
        categoria:   "residencial",
        imagen:      "../../media/edificios/departamentos.png",
        descripcion: "Edificio multifamiliar. Alta densidad de población.",
        clase: Apartamento,
        ...Apartamento.catalogoInfo,
    },

    /* Comercial */
    {
        id:          "tienda",
        nombre:      "Tienda",
        categoria:   "comercial",
        imagen:      "../../media/edificios/tienda.png",
        descripcion: "Genera ingresos.",
        clase: Tienda,
        ...Tienda.catalogoInfo,
    },
    {
        id:          "centro-comercial",
        nombre:      "Centro comercial",
        categoria:   "comercial",
        imagen:      "../../media/edificios/centro-comercial.png",
        descripcion: "Gran centro comercial que genera muchos ingresos.",
        clase: CentroComercial,
        ...CentroComercial.catalogoInfo,
    },

    /* Industrial */
    {
        id:          "fabrica",
        nombre:      "Fábrica",
        categoria:   "industrial",
        imagen:      "../../media/edificios/fabrica.png",
        descripcion: "Produce bienes.",
        clase: Fabrica,
        ...Fabrica.catalogoInfo,
    },
    {
        id:          "granja",
        nombre:      "Granja",
        categoria:   "industrial",
        imagen:      "../../media/edificios/granja.png",
        descripcion: "Provee alimento para la ciudad.",
        clase: Granja,
        ...Granja.catalogoInfo,
    },

    /* Servicios */
    {
        id:          "hospital",
        nombre:      "Hospital",
        categoria:   "servicios",
        imagen:      "../../media/edificios/hospital.png",
        descripcion: "Mejora la salud y la felicidad de la población.",
        clase: Hospital,
        ...Hospital.catalogoInfo,
    },
    {
        id:          "bombero",
        nombre:      "Estación de bomberos",
        categoria:   "servicios",
        imagen:      "../../media/edificios/bombero.png",
        descripcion: "Reduce desastres y aumenta la seguridad del barrio.",
        clase: EstacionBombero,
        ...EstacionBombero.catalogoInfo,
    },
    {
        id:          "policia",
        nombre:      "Estación de policía",
        categoria:   "servicios",
        imagen:      "../../media/edificios/policia.png",
        descripcion: "Mantiene el orden y mejora la felicidad ciudadana.",
        clase: EstacionPolicia,
        ...EstacionPolicia.catalogoInfo,
    },
    {
        id:          "parque",
        nombre:      "Parque",
        categoria:   "servicios",
        imagen:      "../../media/edificios/parque.png",
        descripcion: "Espacio verde que mejora la felicidad del área.",
        clase: Parque,
        ...Parque.catalogoInfo,
    },

    /* Infraestructura */
    {
        id:          "planta-electrica",
        nombre:      "Planta eléctrica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/electrica.png",
        descripcion: "Genera energía para toda la ciudad.",
        clase: PlantaElectrica,
        ...PlantaElectrica.catalogoInfo,
    },
    {
        id:          "planta-hidraulica",
        nombre:      "Planta hidráulica",
        categoria:   "infraestructura",
        imagen:      "../../media/edificios/agua.png",
        descripcion: "Provee agua para la ciudad.",
        clase: PlantaHidraulica,
        ...PlantaHidraulica.catalogoInfo,
    },
];

_catalogo = _catalogo.map(e => ({
    ...e,
    mantenimiento: Math.round(e.costo * 0.01),
}));

function obtener(id)             { return _catalogo.find(e => e.id === id) || null; }
function porCategoria(categoria) { return _catalogo.filter(e => e.categoria === categoria); }
function categorias()            { return [...new Set(_catalogo.map(e => e.categoria))]; }
function todos()                 { return _catalogo; }

function tooltip(edificioOId) {
    const edificio = typeof edificioOId === "string"
        ? obtener(edificioOId)
        : edificioOId;

    if (!edificio) return "";

    const lineas = [
        `${edificio.nombre}`,
        `Categoria: ${edificio.categoria}`,
        `Costo: $${(edificio.costo || 0).toLocaleString()}`,
        `Mantenimiento: $${Math.round((edificio.costo || 0) * 0.01).toLocaleString()}/turno`,
    ];

    if (edificio.descripcion)  lineas.push(edificio.descripcion);
    if (edificio.clase.catalogoInfo.capacidad?.residencial) {
        lineas.push(`Capacidad: +${edificio.clase.catalogoInfo.capacidad.residencial} habitantes`);
    }
    if (edificio.clase.catalogoInfo.capacidad?.laboral)      lineas.push(`Empleos: +${edificio.clase.catalogoInfo.capacidad.laboral}`);
    if (edificio.dinero)       lineas.push(`Dinero por turno: +$${edificio.dinero.toLocaleString()}`);
    if (edificio.electricidad) {
        lineas.push(`Electricidad: ${edificio.electricidad > 0 ? "+" : ""}${edificio.electricidad}`);
    }
    if (edificio.agua)         lineas.push(`Agua: ${edificio.agua > 0 ? "+" : ""}${edificio.agua}`);
    if (edificio.alimento)     lineas.push(`Alimento por turno: +${edificio.alimento}`);
    if (edificio.felicidad)    lineas.push(`Felicidad: +${edificio.felicidad}`);

    return lineas.join("\n");
}

function modificarRecursoEdificio(id,recurso,valor){
    const edificio = _catalogo.find(e => e.id == id);
    if (!edificio || !edificio.clase) {
    console.warn("Edificio no encontrado:", id);
    return;
    }
    if (edificio.id == id){
        edificio.clase.catalogoInfo[recurso] = valor;
        edificio[recurso] = valor; 
    }
}

window.Edificios = { obtener, porCategoria, categorias, todos, tooltip, modificarRecursoEdificio };