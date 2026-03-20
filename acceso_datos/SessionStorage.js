/* ================================================
SessionStorage.JS
Objeto usado para la carga de ciudades desde un
archivo txt.

Clave usada: "txt"
Estructura almacenada: JSON con lista de edificios reconstruida
a partir de un txt 

Estructura de cada entrada:
{
  "edificios": "Nueva Ciudad",
}

Uso:
  RankingStorage.guardar(rankingArray);  // guarda el array completo
  const datos = RankingStorage.cargar(); // recupera (array o [])
  RankingStorage.agregarEntrada(entrada); // agrega una entrada y ordena
  RankingStorage.limpiar();              // elimina todo el ranking
  RankingStorage.obtenerTop(n);          // obtiene Top N ciudades
  RankingStorage.obtenerPosicion(nombreCiudad); // obtiene posición de una ciudad
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