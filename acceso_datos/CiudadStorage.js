//Se crea un objeto de javascript con los métodos necesarios para  cargar y guardar los datos.
const CiudadStorage = {
    clave: "ciudad", //clave asociada al local storage del navegador

    //Método para guardar la ciudad en el local storage
    guardar(lista) {
        localStorage.setItem(this.clave, JSON.stringify(lista));
    },

    //Método para cargar los datos desde el local storage
    cargar() {
        return localStorage.getItem(this.clave);
    },

    clear() {
        localStorage.reemoveItem(this.key);
    }
}