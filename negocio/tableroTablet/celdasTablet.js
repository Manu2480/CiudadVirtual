/* ================================================
AJUSTE DE CELDA PARA TABLET
Calcula el tamaño de celda para que el grid quepa
exactamente en el ancho del área del mapa sin scroll horizontal.
Solo se llama cuando data-vista="tablet".
================================================ */
function _ajustarCeldaParaTablet(columnas) {
    /* Ancho disponible del área del mapa (ya tiene su 70% del layout aplicado) */
    const anchoArea = _areaEl.getBoundingClientRect().width || _areaEl.offsetWidth;

    if (anchoArea <= 0) {
        /* El área aún no tiene dimensiones (p.ej. aún no pintó el layout).
           Reintenta en el siguiente frame. */
        requestAnimationFrame(() => _ajustarCeldaParaTablet(columnas));
        return;
    }

    /* Tamaño de celda = ancho disponible dividido entre el número de columnas.
       Se acota entre 20px (mínimo legible) y 48px (tamaño base de desktop). */
    const tamano = Math.min(48, Math.max(44, Math.floor(anchoArea / columnas)));
    document.documentElement.style.setProperty("--tamano-celda", `${tamano}px`);

    /* Guarda el número de columnas para recalcular si cambia la orientación */
    _mapaState.columnasTablet = columnas;
}

/*===============================================
FUNCION MOSTRAR LISTA PARA CONSTRUCCIÓN EN TABLET
=================================================
*/
    /*        id:          "via",
        nombre:      "Vía",
        categoria:   "pavimentaria",
        imagen:      "../../media/edificios/via.png",
        descripcion: "Sendero necesario para conectar edificios.",
        costo:       100, */

/* ================================================
RECALCULAR TAMAÑO DE CELDA EN TABLET AL ROTAR/REDIMENSIONAR
En tablet la orientación puede cambiar (HU-023), lo que modifica
el ancho disponible del área del mapa y requiere recalcular la celda.
================================================ */
window.addEventListener("resize", () => {
    const vista = document.documentElement.getAttribute("data-vista");
    if (vista === "tablet" && _mapaState.columnasTablet) {
        _ajustarCeldaParaTablet(_mapaState.columnasTablet);
    }
});