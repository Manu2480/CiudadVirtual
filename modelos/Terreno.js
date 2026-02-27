class Terreno{
    constructor(vias,mapa,edificios){
        this.vias = vias;
        this.mapa = mapa;
        this.edificios = edificios
    }

    tieneAdyacente(columna,fila){//El metodo determina si esa celda tiene una vía en una celda adyacente
        return (this.vias[columna-1]?.[fila] == 1 || this.vias[columna+1]?.[fila] == 1 || this.vias[columna]?.[fila-1] == 1 || this.vias[columna]?.[fila+1] == 1);
    } //?. protege el acceso, es decir, si esa fila/columna no existe, no lanza error

    crearInfraestructura(columna,fila,edificio){
        if (!this.mapa[columna][fila]){ //Si no hay una construccion en esa parte del mapa, la crea
            if (edificio instanceof Via){
                this.vias[columna][fila] = 1; //Si es via, se hace la modificiacion en la matriz de vias para usar el route finder
            }
            this.mapa[columna][fila] = edificio; //En la posicion de la matriz mapa se ubica el nuevo edificio
            this.edificios.push(edificio); //Se agrega el edificio a la lista de edificios para la administracion de recursos
            }
    }

    eliminarInfraestructura(columna,fila){
        let edificio = this.mapa[columna][fila];//seleccionamos la referencia del edificio
        if (edificio){ //si el edificio existe
            if (edificio instanceof Via){
                this.vias[columna][fila] = 0; //se remueve la via de la matriz de vias
            }
            else if (edificio instanceof EdificioResidencial){
                edificio.ciudadanos.forEach(ciudadano => ciudadano.setVivienda(false));//Le decimos a los ciudadanos que quedan sin hogar
            }
            else if (edificio instanceof EdificioComercial){
                edificio.ciudadanos.forEach(ciudadano => ciudadano.setEmpleo(false)); //Le decimos a los ciudadanos que quedan desempleados
            }
            this.edificios = this.edificios.filter(construcciones => construcciones !== edificio); //la eliminamos de la lista de edificios creando una nueva lista con los edificios que no sean el seleccionado
            this.mapa[columna][fila] = null; //la eliminamos del mapa cuando ya no necesitemos al edificio
        }
    }

    capacidadTotalEmpleos(){
        let contador = 0;
        this.edificios.forEach(edificio => {
            if (edificio instanceof EdificioComercial){ //Valida que el edificio contenga empleados para agregar su capacidad al contador
                contador += edificio.capacidadEmpleos;
            }
        });
        return contador;
    }

    capacidadTotalViviendas(){
        let contador = 0;
        this.edificios.forEach(edificio => {
            if (edificio instanceof EdificioResidencial){//Valida que el edificio contenga inquilinos para agregar al contador su capacidad
                contador += edificio.capacidadViviendas;
            }
        });
        return contador;
    }

    //METODOS PARA VALIDAR SI HAY VIVIENDAS Y EMPLEOS PARA CREAR CIUDADANOS
    empleosDisponibles() {
        let contador = 0; //numero de empleos disponibles
        let edificiosConDisponibilidad = [];//edificios donde hay empleos disponibles

        this.edificios.forEach(edificio => {//recorro la lista de edificios
            if (edificio instanceof EdificioResidencial || edificio instanceof EdificioIndustrial) {//valido que sean de tipo comercial o industrial

                const disponibles = edificio.capacidadViviendas - edificio.ciudadanos.length;//calculo la disponibilidad de empleo restandole a la capacidad el numero de ciudadanos que ya estan en el array de eseedificio

                if (disponibles > 0) { //si hay empleos disponibles, las sumo al contador total de viviendas disponibles y agrego el edificio a la lista de edificios con disponibilidad para crear ciudadanos
                    contador += disponibles;
                    edificiosConDisponibilidad.push(edificio);
                }
            }
        });

        //retorno un objeto con la cantidad total de viviendas disponibles y la lista de edificios con disponibilidad para crear ciudadanos porque en js no existen las tuplas simples
        return {
            totalDisponibles: contador,
            edificios: edificiosConDisponibilidad
        };
    }

    viviendasDisponibles() {
        let contador = 0; //numero de viviendas disponibles
        let edificiosConDisponibilidad = [];//edificios donde hay viviendas disponibles

        this.edificios.forEach(edificio => {//recorro la lista de edificios
            if (edificio instanceof EdificioResidencial) {//valido que sean de tipo residencial

                const disponibles = edificio.capacidadViviendas - edificio.ciudadanos.length;//conto la cantidad de viviendas disponibles restando la capacidad total de viviendas del edificio con la cantidad de ciudadanos que ya viven en ese edificio

                if (disponibles > 0) { //si hay viviendas disponibles, las sumo al contador total de viviendas disponibles y agrego el edificio a la lista de edificios con disponibilidad para crear ciudadanos
                    contador += disponibles;
                    edificiosConDisponibilidad.push(edificio);
                }
            }
        });

        //retorno un objeto con la cantidad total de viviendas disponibles y la lista de edificios con disponibilidad para crear ciudadanos porque en js no existen las tuplas simples
        return {
            totalDisponibles: contador,
            edificios: edificiosConDisponibilidad
        };
    }

    //METODOS PARA CALCULAR LA FELICIDAD TOTAL POR LAS NFRAESTRUCTURAS 
    felicidadPorInfraestructura() {

        let felicidadTotal = 0;
        for (const edificio of this.edificios) {
            // ?. evita error si recursosEdificio es undefined || 0 hace que si no existe "felicidad", sume 0
            felicidadTotal += edificio.recursosEdificio?.felicidad || 0;
        }
        return felicidadTotal;
    }

    setMapa(mapa){
        this.mapa = mapa;
    }
    
    getMapa(){
        return this.mapa;
    }

    setVias(vias){
        this.vias = vias;
    }

    getVias(){
        return this.vias;
    }

    setEdificios(edificios){
        this.edificios = edificios;
    }

    getEdificios(){
        return this.edificios;
    }
    
}

//exportamos la clase para poder usarla en main.js
module.exports = Terreno;