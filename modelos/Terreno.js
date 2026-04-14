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
        
        if (this.ubicacionInfraestructura(fila, columna)){
            return { exito: false, costo: 0, mensaje: "Espacio ya ocupado", edificio: null };
        }
        
        if (edificio instanceof Via){
            this.vias[fila][columna] = 1; // marca la vía
            this.edificios.push(edificio); // guardamos la vía en la lista general
            return { exito: true, costo: edificio.costo, mensaje: `Vía construida`, edificio: edificio };
        } else {
            //validamos que no se cree un edificio si no tiene via adyacente
            if(this.tieneAdyacente(fila, columna)){
                this.edificios.push(edificio);
                return { exito: true, costo: edificio.costo, mensaje: `${edificio.id} construido correctamente`, edificio: edificio };
            } else {
                return { exito: false, costo: 0, mensaje: "No hay vía adyacente para construir", edificio: null };
            }
        }
    }


    eliminarInfraestructura(fila, columna){
        let edificio = this.ubicacionInfraestructura(fila, columna);
        if (edificio){ //si el edificio existe
            let reembolso = this.reembolso(edificio);
            // si en la matriz hay via, entonces es una via
            if (this.vias[fila]?.[columna] === 1) {

                if (this.esViaCritica(fila, columna)) {
                    return { exito: false, reembolso: 0, mensaje: "Via critica: es la unica conectada a uno o mas edificios", edificio: null };
                }

                this.vias[fila][columna] = 0;
            }

            if (edificio.capacidad.getCapacidad("residente")){
                edificio.ciudadanos.forEach(o => {
                    if (o?.rol === "residente" && o?.ciudadano) {
                        o.ciudadano.vivienda = false;//Actualizamos el estado de vivienda
                    }
                });
            }

            if (edificio.capacidad.getCapacidad("empleado")){
                edificio.ciudadanos.forEach(o => {
                    if (o?.rol === "empleado" && o?.ciudadano) {
                        o.ciudadano.empleo = false;//Actualizamos el estado de empleo
                    }
                });
            }
            edificio.ciudadanos = [] //Se limpia el atributo
            // eliminar de la lista general
            this.edificios = this.edificios.filter(construcciones => construcciones !== edificio);
            return { exito: true, reembolso: reembolso, mensaje: `Infraestructura demolida - Reembolso: ${reembolso}`, edificio: edificio };
        } else {
            return { exito: false, reembolso: 0, mensaje: "No hay infraestructura que demoler", edificio: null };
        }
    }

    capacidadTotalEmpleos(){
        let contador = 0;
        this.edificios.forEach(edificio => {
            //Valida que el edificio contenga empleados para agregar su capacidad al contador
            contador += edificio.capacidad.getCapacidad("empleado");
        });
        return contador;
    }

    capacidadTotalViviendas(){
        let contador = 0;
        this.edificios.forEach(edificio => {
            //Valida que el edificio contenga inquilinos para agregar al contador su capacidad
                contador += edificio.capacidad.getCapacidad("residente");
        });
        return contador;
    }

    // métodos auxiliares añadidos para eliminar dependencias de `mapa`
    empleosDisponibles() {
        let contador = 0; //numero de empleos disponibles
        let edificiosConDisponibilidad = [];//edificios donde hay empleos disponibles

        this.edificios.forEach(edificio => {//recorro la lista de edificios
                const disponibles = edificio.capacidad.getDisponibles("empleado", edificio.ciudadanos);
                if (disponibles > 0) { //si hay empleos disponibles, las sumo al contador total y agrego el edificio a la lista
                    contador += disponibles;
                    edificiosConDisponibilidad.push(edificio);
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
            let disponibles = edificio.capacidad.getDisponibles("residente",edificio.ciudadanos);
            if (disponibles > 0) { //si hay viviendas disponibles, las sumo al contador total de viviendas disponibles y agrego el edificio a la lista de edificios con disponibilidad para crear ciudadanos
                contador += disponibles;
                edificiosConDisponibilidad.push(edificio);
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