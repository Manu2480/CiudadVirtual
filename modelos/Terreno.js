class Terreno{
    constructor(vias,mapa,edificios){
        this._vias = vias;
        this._mapa = mapa;
        this._edificios = edificios
    }

    tieneAdyacente(columna,fila){//El metodo determina si esa celda tiene una vía en una celda adyacente
        return (this._vias[columna-1]?.[fila] == 1 || this._vias[columna+1]?.[fila] == 1 || this._vias[columna]?.[fila-1] == 1 || this._vias[columna]?.[fila+1] == 1);
    } //?. protege el acceso, es decir, si esa fila/columna no existe, no lanza error

    crearInfraestructura(columna,fila,edificio){
        if (!this._mapa[columna][fila]){ //Si no hay una construccion en esa parte del mapa, la crea
            if (edificio instanceof Via){
                this._vias[columna][fila] = 1; //Si es via, se hace la modificiacion en la matriz de vias para usar el route finder
            }
            this._mapa[columna][fila] = edificio; //En la posicion de la matriz mapa se ubica el nuevo edificio
            this._edificios.push(edificio); //Se agrega el edificio a la lista de edificios para la administracion de recursos
            }
    }

    capacidadEmpleos(){
        let contador = 0;
        this._edificios.forEach(edificio => {
            if (edificio instanceof EdificioComercial){ //Valida que el edificio contenga empleados para agregar su capacidad al contador
                contador += edificio.capacidadEmpleos;
            }
        });
        return contador;
    }

    capacidadViviendas(){
        let contador = 0;
        this._edificios.forEach(edificio => {
            if (edificio instanceof EdificioResidencial){//Valida que el edificio contenga inquilinos para agregar al contador su capacidad
                contador += edificio.capacidadViviendas;
            }
        });
        return contador;
        }

    eliminarInfraestructura(columna,fila){
        let edificio = this._mapa[columna][fila];//seleccionamos la referencia del edificio
        if (edificio){ //si el edificio existe
            if (edificio instanceof Via){
                this._vias[columna][fila] = 0; //se remueve la via de la matriz de vias
            }
            else if (edificio instanceof EdificioResidencial){
                edificio.ciudadanos.forEach(ciudadano => ciudadano.setVivienda(false));//Le decimos a los ciudadanos que quedan sin hogar
            }
            else if (edificio instanceof EdificioComercial){
                edificio.ciudadanos.forEach(ciudadano => ciudadano.setEmpleo(false)); //Le decimos a los ciudadanos que quedan desempleados
            }
            this._edificios = this._edificios.filter(construcciones => construcciones !== edificio); //la eliminamos de la lista de edificios creando una nueva lista con los edificios que no sean el seleccionado
            this._mapa[columna][fila] = null; //la eliminamos del mapa cuando ya no necesitemos al edificio
        }
    }

    setMapa(mapa){
        this._mapa = mapa;
    }
    
    getMapa(){
        return this._mapa;
    }

    setVias(vias){
        this._vias = vias;
    }

    getVias(){
        return this._vias;
    }

    setEdificios(edificios){
        this._edificios = edificios;
    }

    getEdificios(){
        return this._edificios;
    }



    
    
}