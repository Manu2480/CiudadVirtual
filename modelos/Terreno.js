class Terreno{
    // El constructor se ejecuta cuando creamos un nuevo Terreno.
    // Recibe dos argumentos: la matriz de vías y la lista de edificios.
    // ya no almacenamos una matriz "mapa" porque las ubicaciones se
    // deducen inspeccionando el arreglo de edificios, lo que facilita
    // la serialización a JSON. Además, todas las funciones usan ahora
    // la convención fila-primero para coordinar (fila, columna).
    constructor(vias, edificios){
        this.vias = vias;
        this.edificios = edificios;
    }

    tieneAdyacente(fila, columna){
        // optional chaining evita errores al acceder fuera de los límites.
        // Ahora el primer índice de la matriz de vías representa la fila.
        // Retorna true si en alguna de las cuatro celdas vecinas hay una vía.
        return (
            this.vias[fila]?.[columna-1] == 1 ||
            this.vias[fila]?.[columna+1] == 1 ||
            this.vias[fila-1]?.[columna] == 1 ||
            this.vias[fila+1]?.[columna] == 1
        );
    } //?. protege el acceso, es decir, si esa fila/columna no existe, no lanza error

    esViaCritica(fila, columna) {
        // Esta función recorre cada edificio para ver si la vía situada en
        // (fila,columna) es la única conexión que tiene.
        for (const edificio of this.edificios) {
            /* Las vías no necesitan vía adyacente para existir,
               solo los edificios no-vía deben evaluarse. */
            if (this.vias[edificio.ubicacion?.fila]?.[edificio.ubicacion?.columna] === 1) continue;

            const { fila: edFila, columna: edCol } = edificio.ubicacion;

            let viasAdyacentes = 0;
            let tieneEstaVia = false;

            const adyacentes = [
                { f: edFila, c: edCol - 1 },
                { f: edFila, c: edCol + 1 },
                { f: edFila - 1, c: edCol },
                { f: edFila + 1, c: edCol }
            ];

            for (const adj of adyacentes) {
                if (this.vias[adj.f]?.[adj.c] === 1) {
                    viasAdyacentes++;
                    if (adj.f === fila && adj.c === columna) {
                        tieneEstaVia = true;
                    }
                }
            }

            if (tieneEstaVia && viasAdyacentes === 1) {
                return true;
            }
        }

        return false;
    }

    crearInfraestructura(fila, columna, edificio){
        /*
        // Modo dual: acepta tanto instancias como objetos JSON planos
        // Si es un objeto plano (JSON), convertirlo a instancia usando fromData
        if (typeof edificio === 'object' && edificio !== null && !(edificio instanceof Via)) {
            // Verificar si no es una instancia de clases conocidas
            if (!edificio.constructor.name.includes('Edificio')) {
                // Es probablemente un objeto plano del JSON, detectar tipo y cargar
                const cargado = this.cargarEdificioDesdeJSON(edificio);
                if (cargado) edificio = cargado;
            }
        }
        */
        
        if (this.ubicacionInfraestructura(fila, columna)){
            console.log("Espacio no disponible");
            return { exito: false, costo: 0, mensaje: "Espacio ya ocupado", edificio: null };
        }
        
        if (edificio instanceof Via){
            this.vias[fila][columna] = 1; // marca la vía
            this.edificios.push(edificio); // guardamos la vía en la lista general
            console.log(`Vía creada en (${fila}, ${columna})`);
            return { exito: true, costo: edificio.costo, mensaje: `Vía construida`, edificio: edificio };
        } else {
            //validamos que no se cree un edificio si no tiene via adyacente
            if(this.tieneAdyacente(fila, columna)){
                this.edificios.push(edificio);
                console.log(`Edificio ${edificio.id} construido en (${fila}, ${columna}) - Costo: ${edificio.costo}`);
                return { exito: true, costo: edificio.costo, mensaje: `${edificio.id} construido correctamente`, edificio: edificio };
            } else {
                console.log("No hay via adyacente");
                return { exito: false, costo: 0, mensaje: "No hay vía adyacente para construir", edificio: null };
            }
        }
    }

    // Método que detecta el tipo de infraestructura por su id y carga usando fromData
    // Esto permite cargar edificios desde JSON automáticamente
    /*
    cargarEdificioDesdeJSON(obj) {
        const id = obj.id || '';
        const idLower = id.toLowerCase(); //toLowerCase() convierte todas las letras mayúsculas de una cadena de texto (string) a minúsculas

        // Detectar tipo por prefijo del id
        if (idLower.startsWith('via')) { // El método startsWith() verifica si una cadena de texto (string) comienza con los caracteres de otra cadena específica, devolviendo true (verdadero) si es así, o false (falso) en caso contrario
            return Via.fromData(obj);
        } else if (idLower.startsWith('casa')) {
            const Casa = require('./Casa');
            return Casa.fromData(obj);
        } else if (idLower.startsWith('apartamento')) {
            const Apartamento = require('./Apartamento');
            return Apartamento.fromData(obj);
        } else if (idLower.startsWith('tienda')) {
            const Tienda = require('./Tienda');
            return Tienda.fromData(obj);
        } else if (idLower.startsWith('centrocomercial')) {
            const CentroComercial = require('./CentroComercial');
            return CentroComercial.fromData(obj);
        } else if (idLower.startsWith('luz')) {
            const PlantaElectrica = require('./PlantaElectrica');
            return PlantaElectrica.fromData(obj);
        } else if (idLower.startsWith('agua')) {
            const PlantaHidraulica = require('./PlantaHidraulica');
            return PlantaHidraulica.fromData(obj);
        } else if (idLower.startsWith('bombero')) {
            const EstacionBombero = require('./EstacionBombero');
            return EstacionBombero.fromData(obj);
        } else if (idLower.startsWith('policia')) {
            const EstacionPolicia = require('./EstacionPolicia');
            return EstacionPolicia.fromData(obj);
        } else if (idLower.startsWith('hospital')) {
            const Hospital = require('./Hospital');
            return Hospital.fromData(obj);
        } else if (idLower.startsWith('parque')) {
            const Parque = require('./Parque');
            return Parque.fromData(obj);
        } else if (idLower.startsWith('fabrica')) {
            const Fabrica = require('./Fabrica');
            return Fabrica.fromData(obj);
        } else if (idLower.startsWith('granja')) {
            const Granja = require('./Granja');
            return Granja.fromData(obj);
        }

        return null; // Tipo desconocido
    }*/

    eliminarInfraestructura(fila, columna){
        let edificio = this.ubicacionInfraestructura(fila, columna);
        if (edificio){ //si el edificio existe
            let reembolso = this.reembolso(edificio);
            // si en la matriz hay via, entonces es una via
            if (this.vias[fila]?.[columna] === 1) {

                if (this.esViaCritica(fila, columna)) {
                    console.log("No se puede demoler esta via, es la unica conectada a uno o mas edificios.");
                    return { exito: false, reembolso: 0, mensaje: "Via critica: es la unica conectada a uno o mas edificios", edificio: null };
                }

                this.vias[fila][columna] = 0;
                console.log(`Via eliminada de (${fila}, ${columna}) - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioResidencial){
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.vivienda = false; //Actualizamos el estado de vivienda
                    console.log(`${ciudadano.id} perdio su vivienda`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioComercial){
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.empleo = false; //Actualizamos el estado de empleo
                    console.log(`${ciudadano.id} perdio su empleo`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else if (edificio instanceof EdificioIndustrial){
                edificio.ciudadanos.forEach(ciudadano => {
                    ciudadano.empleo = false; //Actualizamos el estado de empleo
                    console.log(`${ciudadano.id} perdio su empleo`);
                });
                edificio.ciudadanos = []; // Limpiar lista para que puedan ser reasignados
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            else {
                console.log(`${edificio.id} demolido - Reembolso: ${reembolso}`);
            }
            // eliminar de la lista general
            this.edificios = this.edificios.filter(construcciones => construcciones !== edificio);
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

    // métodos auxiliares añadidos para eliminar dependencias de `mapa`
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

    //METODOS PARA CALCULAR LA FELICIDAD TOTAL POR LAS INFRAESTRUCTURAS 
    felicidadPorInfraestructura() {

        let felicidadTotal = 0;
        // importamos las clases abstractas necesarias para instanceof
        /*
        const EdificioResidencial = require("./EdificioResidencial");
        const EdificioComercial = require("./EdificioComercial");
        const EdificioIndustrial = require("./EdificioIndustrial");
        */
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

    // ----------------------------
    // métodos nuevos solicitados por el usuario

    // devuelve el objeto (vía o edificio) que ocupa la casilla indicada
    // por (fila, columna), o null si está vacía. Se recorre la lista de
    // edificios, que ahora incluye las vías; de esta forma no necesitamos
    // la antigua matriz "mapa".
    ubicacionInfraestructura(fila, columna) {
        if (this.edificios.length !== 0) {
            for (const ed of this.edificios) {
                // Validamos que 'ed' y 'ed.ubicacion' existan antes de leer 'fila'
                if (ed && ed.ubicacion && ed.ubicacion.fila === fila && ed.ubicacion.columna === columna) {
                    return ed;
                }
            }
        }
        return null;
    }

    // calcula cuánto dinero devuelve demoler el objeto pasado.
    // actualmente todas las infraestructuras reembolsan el 50% de su costo
    reembolso(edificio) {
        return Math.round(edificio.costo * 0.5);
    }

    // antiguos setters/getters a continuación (sin cambios) 
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