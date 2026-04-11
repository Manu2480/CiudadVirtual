class ApiCoordenadas{
    constructor(url){
        this.url = "https://nominatim.openstreetmap.org/search";
        
    }
    obtenerJsonCoordenadas(ciudad, departamento) {
        const lugar = `${ciudad}, ${departamento}, Colombia`;
        const urlCompleta = `${this.url}?q=${encodeURIComponent(lugar)}&format=json&limit=1`;
        return fetch(urlCompleta, {
                method: "GET",
            }).then(function (res) {
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                return res.json();
            });
    }
}