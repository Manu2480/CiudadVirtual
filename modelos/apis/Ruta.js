class Ruta {
    constructor(ok = false, route = [], error = "", networkError = false) {
        this.ok = ok;
        this.route = route;
        this.error = error;
        this.networkError = networkError;
    }
}
