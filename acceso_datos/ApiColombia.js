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


    async getDepartamentos(){ //Como vamos a usar un método que va a devolver una promesa, para poder usarlo correctamente se usa async
        let listaDepartamentos = [];
        const departamentos = await this.getJsonDepartamentos(); //await permite trabajar sobre el json que el método devuelve, así se trabaja sobre el json y no sobre la promesa
        departamentos.forEach(departamento => { //Como el JSON devuelve mucha información, es mejor filtrarla y dejar simplemente el nombre y el id, que usaremos para obtener luego las ciudades
            listaDepartamentos.push({"nombre" : departamento.name,
                "id" : departamento.id
            })
        });
        return listaDepartamentos;

    }

    async getCiudadesDepartamento(idDepartamento){
        let listaCiudades = [];
        const ciudades = await this.getJsonCiudades(idDepartamento);
        ciudades.forEach(ciudad => {
            listaCiudades.push({"nombre" : ciudad.name,
                "id" : ciudad.id
            })
        });
        return listaCiudades;

    }
}