/* ================================================
CIUDADSTORAGE.JS
Objeto utilitario para persistir y recuperar los datos
de la ciudad en el localStorage del navegador.

Clave usada: "ciudad"
El valor almacenado es un JSON con la estructura
completa de la partida (grid, recursos, configuración).

Uso:
  CiudadStorage.guardar(objetoCiudad);  // guarda
  const datos = CiudadStorage.cargar(); // recupera (string JSON o null)
  CiudadStorage.limpiar();              // elimina la partida guardada
================================================ */

const CiudadStorage = {

    /* Clave asociada al localStorage del navegador */
    clave: "ciudad",

    /* Guarda el objeto de la ciudad serializado como JSON */
    guardar(lista) {
        localStorage.setItem(this.clave, JSON.stringify(lista));
    },

    /* Recupera el JSON guardado. Devuelve null si no hay datos. */
    cargar() {
        return localStorage.getItem(this.clave);
    },

    /* Elimina la partida guardada del localStorage */
    limpiar() {
        localStorage.removeItem(this.clave); /* fix: era "reemoveItem" y "this.key" */
    },
};