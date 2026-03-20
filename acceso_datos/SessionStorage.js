/* ================================================
SessionStorage.JS
Objeto usado para la carga de ciudades desde un
archivo txt.

Clave usada: "txt"
Estructura almacenada: JSON con lista de edificios reconstruida
a partir de un txt 

Utiliza el session storage, que se limpia cada vez que se cierra la página.

Uso:
  SessionStorage.subirEdificios(edificios);  // guarda el array de edificios
  SessionStorage.cargar() //retorna el json cargado en el session storage
  
================================================ */
const SessionStorage = {
    claveEdificios: "edificiosTxt", //clave del json con los edificios

    subirEdificios(edificios){
        sessionStorage.setItem(this.claveEdificios, JSON.stringify(edificios)); //sube los edificios al sessionStorage
    },

    cargar(){
        const datos = sessionStorage.getItem(this.claveEdificios); //carga los edificios del sessionStorage
        const edificios =  datos ? JSON.parse(datos) : []; //paso los datos a un diccionario
        sessionStorage.removeItem(this.claveEdificios); //limpio el sessionStorage para que solo se acceda a los elementos una vez
        return {
            edificios: edificios,
        }; //Retorno diccionario por temas de escalabilidad
    }

 
}