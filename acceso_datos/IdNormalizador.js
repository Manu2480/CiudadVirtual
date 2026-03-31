/* ================================================
ID NORMALIZADOR
Centraliza la lógica de traducción de IDs de instancia
a IDs de catálogo.

Problema resuelto:
- mapa.js, tablero.js, ruta.js tenían la normalización duplicada
- Ahora hay un único punto de verificación y mantenimiento

Uso:
    const idCatalogo = IdNormalizador.normalizar("casa3");
    // Retorna "casa"

    const esValido = IdNormalizador.esIdValido("casa");
    // Retorna true
================================================ */

const IdNormalizador = (() => {
    /* Mapeo centralizado de prefijos a IDs de catálogo */
    const MAPEO_PREFIJOS = {
        "via":             "via",
        "casa":            "casa",
        "apartamento":     "apartamento",
        "tienda":          "tienda",
        "centrocomercial": "centro-comercial",
        "fabrica":         "fabrica",
        "granja":          "granja",
        "hospital":        "hospital",
        "bombero":         "bombero",
        "policia":         "policia",
        "parque":          "parque",
        "luz":             "planta-electrica",
        "agua":            "planta-hidraulica",
    };

    /**
     * Normaliza un ID de instancia (ej: "casa3") a su ID de catálogo (ej: "casa")
     * @param {string} id - ID de instancia o catálogo
     * @returns {string} - ID de catálogo normalizado
     */
    function normalizar(id) {
        if (!id) return "edificio";

        /* Si ya es un ID válido de catálogo, retornarlo directamente */
        if (Object.values(MAPEO_PREFIJOS).includes(id)) {
            return id;
        }

        /* Extraer prefijo (quitar números al final) */
        const prefijo = (id || "").toLowerCase().replace(/\d+$/, "");

        return MAPEO_PREFIJOS[prefijo] || id;
    }

    /**
     * Verifica si un ID es un ID de catálogo válido
     * @param {string} id - ID a verificar
     * @returns {boolean} - true si es un ID válido del catálogo
     */
    function esIdValido(id) {
        if (!id) return false;
        return Object.values(MAPEO_PREFIJOS).includes(id);
    }

    /**
     * Retorna todos los IDs de catálogo disponibles
     * @returns {string[]} - Array de IDs de catálogo
     */
    function obtenerTodosLosIds() {
        return Object.values(MAPEO_PREFIJOS);
    }

    /**
     * Retorna el mapeo completo (para debugging o extensión)
     * @returns {object} - Objeto con el mapeo de prefijos
     */
    function obtenerMapeo() {
        return { ...MAPEO_PREFIJOS };
    }

    return {
        normalizar,
        esIdValido,
        obtenerTodosLosIds,
        obtenerMapeo,
    };
})();

/* Hacer disponible globalmente si es necesario */
if (typeof window !== "undefined") {
    window.IdNormalizador = IdNormalizador;
}