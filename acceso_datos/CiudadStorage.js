const CiudadStorage = {
    clave: "ciudad",

    guardar(lista) {
        localStorage.setItem(this.clave, JSON.stringify(lista));
    },

    cargar() {
        return localStorage.getItem(this.clave);
    },

    clear() {
        localStorage.reemoveItem(this.key);
    }
}