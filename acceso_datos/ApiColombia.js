class ApiColombia{
    constructor(url = "https://api-colombia.com/api/v1/"){
        this.url = url
    }

    getJsonDepartamentos(){
        return fetch(this.url + "Department", { //La solicitud se debe mandar a /Department
            method: "GET",
        }).then(function (res) {
            if (!res.ok){
                throw new Error(`Error HTTP: ${res.status}`) //Esto de acá nos permitirá ver cuál fue el problema que nos lanzó la solicitud
            }
            return res.json(); //Devolverá el JSON con todos los departamentos
        });
    }

    getJsonCiudades(idDepartamento){
        return fetch(this.url + "Department/" + idDepartamento + "/cities", {//Consulta las ciudades del departamento seleccionado
            method: "GET",
        }).then(function (res){
            if(!res.ok){
                throw new Error(`Error HTTP: ${res.status}`)
            }
            return res.json();
        });
    }

    getJsonCiudad(idCiudad){
        return fetch(this.url + "City/" + idCiudad, {
            method: "GET"
        }).then(function(res){
            if(!res.ok){
                throw new Error(`Error HTTP: ${res.status}`)
            }
            return res.json();
        })
    }
}