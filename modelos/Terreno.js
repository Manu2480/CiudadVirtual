// los "require" traen módulos (archivos) de Node.js. Aquí
// cada constante apunta a la clase correspondiente que exporta ese
// archivo. Más adelante comprobamos el tipo de edificios usando
// "instanceof" (operador que verifica si un objeto es instancia de
// determinada clase).
const Via = require("./Via");
const EdificioComercial = require("./EdificioComercial");
const EdificioResidencial = require("./EdificioResidencial");
const EdificioIndustrial = require("./EdificioIndustrial");

class Terreno{
    // El constructor se ejecuta cuando creamos un nuevo Terreno.
    // Recibe tres argumentos: la matriz de vías, la matriz del mapa
    // y la lista de edificios. "this" se usa para asignar propiedades al
    // objeto que se está creando.
    constructor(vias,mapa,edificios){
        this.vias = vias;
        this.mapa = mapa;
        this.edificios = edificios
    }

    tieneAdyacente(columna,fila){
        // El operador "?." se llama optional chaining. Si el índice
        // anterior no existe (por ejemplo columna-1 < 0), la expresión
        // no lanza error sino que devuelve undefined. Esto evita que el
        // programa se rompa al consultar fuera de los límites.
        // La función retorna true si alguna celda adyacente contiene una vía (valor 1).
        return (this.vias[columna-1]?.[fila] == 1 || this.vias[columna+1]?.[fila] == 1 || this.vias[columna]?.[fila-1] == 1 || this.vias[columna]?.[fila+1] == 1);
    } //?. protege el acceso, es decir, si esa fila/columna no existe, no lanza error

    esViaCritica(columna, fila) {
        // Esta función recorre cada edificio para ver si la vía situada en
        // (columna,fila) es la única conexión que tiene.
        // "for...of" es una sintaxis ES6 para iterar directamente sobre
        // los elementos de un arreglo (this.edificios en este caso).
        for (const edificio of this.edificios) {
            const ubicacion = edificio.ubicacion;
            const edCol = ubicacion.columna;
            const edFila = ubicacion.fila;
            
            // variables que iremos actualizando durante el chequeo
            let viasAdyacentes = 0;
            let tieneEstaVia = false;
            
            // construimos un arreglo de objetos con las coordenadas
            // de los cuatro vecinos directos.
            const adyacentes = [
                { c: edCol - 1, f: edFila },
                { c: edCol + 1, f: edFila },
                { c: edCol, f: edFila - 1 },
                { c: edCol, f: edFila + 1 }
            ];
            
            // otro for...of para iterar esas cuatro posiciones
            for (const adj of adyacentes) {
                // de nuevo usamos optional chaining al leer this.vias, porque
                // el índice podría estar fuera del rango válido.
                if (this.vias[adj.c]?.[adj.f] === 1) {
                    viasAdyacentes++;
                    if (adj.c === columna && adj.f === fila) {
                        tieneEstaVia = true;
                    }
                }
            }
            
            // Una vez contadas, si la vía que estamos inspeccionando es
            // la única, devolvemos true y salimos inmediatamente.
            if (tieneEstaVia && viasAdyacentes === 1) {
                return true;
            }
        }
        
        // si ningún edificio depende exclusivamente de esa vía
        return false;
    }

    crearInfraestructura(columna,fila,edificio){
        if (!this.mapa[columna][fila]){ //Si no hay una construccion en esa parte del mapa, la crea
            // "instanceof" comprueba el tipo en tiempo de ejecución. aquí
            // distingue si la infraestructura es una vía o algún otro edificio.
            if (edificio instanceof Via){
                this.vias[columna][fila] = 1; // en la matriz de vías ponemos 1
                this.mapa[columna][fila] = edificio;
                console.log(`Vía creada en (${columna}, ${fila})`);
                // usamos template literal con paréntesis para mostrar coordenadas
                return { exito: true, costo: edificio.costo, mensaje: `Vía construida`, edificio: edificio };
            } else {
                //validamos que no se cree un edificio diferente a via su no tiene via adyacente
                if(this.tieneAdyacente(columna,fila)){
                    this.mapa[columna][fila] = edificio; //En la posicion de la matriz mapa se ubica el nuevo edificio
                    this.edificios.push(edificio); //Se agrega el edificio a la lista de edificios para la administracion de recursos
                    console.log(`Edificio ${edificio.id} construido en (${columna}, ${fila}) - Costo: ${edificio.costo}`);
                    return { exito: true, costo: edificio.costo, mensaje: `${edificio.id} construido correctamente`, edificio: edificio };
                } else {
                    console.log("No hay via adyacente");
                    return { exito: false, costo: 0, mensaje: "No hay vía adyacente para construir", edificio: null };
                }
            }
        } else {
            console.log("Espacio no disponible");
            return { exito: false, costo: 0, mensaje: "Espacio ya ocupado", edificio: null };
        }
    }

    eliminarInfraestructura(columna,fila){
        let edificio = this.mapa[columna][fila];//seleccionamos la referencia del edificio
        if (edificio){ //si el edificio existe
            let reembolso = 0;
            if (edificio instanceof Via){
                // Verificar si es una via critica
                if (this.esViaCritica(columna, fila)) {
                    console.log("No se puede demoler esta via, es la unica conectada a uno o mas edificios.");
                    return { exito: false, reembolso: 0, mensaje: "Via critica: es la unica conectada a uno o mas edificios", edificio: null };
                }
                reembolso = Math.round(edificio.costo * 0.5);
                this.vias[columna][fila] = 0; //se remueve la via de la matriz de vias
                console.log(`Via eliminada de (${columna}, ${fila}) - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioResidencial){
                reembolso = Math.round(edificio.costo * 0.5); // recuperamos 50%
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.vivienda = false; //Actualizamos el estado de vivienda
                    console.log(`${ciudadano.id} perdio su vivienda`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioComercial){
                reembolso = Math.round(edificio.costo * 0.5); // recuperamos 50%
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.empleo = false; //Actualizamos el estado de empleo
                    console.log(`${ciudadano.id} perdio su empleo`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioIndustrial){
                reembolso = Math.round(edificio.costo * 0.5); // recuperamos 50%
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.empleo = false; //Actualizamos el estado de empleo
                    console.log(`${ciudadano.id} perdio su empleo`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else {
                reembolso = Math.round(edificio.costo * 0.5); // recuperamos 50% para otros tipos
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            this.edificios = this.edificios.filter(construcciones => construcciones !== edificio); //la eliminamos de la lista de edificios creando una nueva lista con los edificios que no sean el seleccionado
            this.mapa[columna][fila] = null; //la eliminamos del mapa cuando ya no necesitemos al edificio
            return { exito: true, reembolso: reembolso, mensaje: `Infraestructura demolida - Reembolso: ${reembolso}`, edificio: edificio };
        } else {
            console.log("No hay construcción en esa posición");
            return { exito: false, reembolso: 0, mensaje: "No hay infraestructura que demoler", edificio: null };
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
            // ahora revisamos edificios comerciales o industriales, no residenciales
            if (edificio instanceof EdificioComercial || edificio instanceof EdificioIndustrial) {

                const disponibles = edificio.capacidad - edificio.ciudadanos.length;//calculo la disponibilidad de empleo restandole a la capacidad el numero de ciudadanos que ya estan en el array de ese edificio

                if (disponibles > 0) { //si hay empleos disponibles, las sumo al contador total y agrego el edificio a la lista
                    contador += disponibles;
                    edificiosConDisponibilidad.push(edificio);
                }
            }
        });

        //retorno un objeto con la cantidad total de empleos disponibles y la lista de edificios con disponibilidad
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
                let disponibles = edificio.capacidad - edificio.ciudadanos.length;//conto la cantidad de viviendas disponibles restando la capacidad total de viviendas del edificio con la cantidad de ciudadanos que ya viven en ese edificio
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
        // importamos las clases abstractas necesarias para instanceof
        const EdificioResidencial = require("./EdificioResidencial");
        const EdificioComercial = require("./EdificioComercial");
        const EdificioIndustrial = require("./EdificioIndustrial");

        for (const edificio of this.edificios) {
            // saltamos los tipos que aportan vivienda o empleo porque
            // su efecto se calcula en cada ciudadano
            if (
                edificio instanceof EdificioResidencial ||
                edificio instanceof EdificioComercial ||
                edificio instanceof EdificioIndustrial
            ) {
                continue;
            }
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