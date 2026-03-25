addEventListener("DOMContentLoaded",function(){
    //VARIABLES:
    const api = new ApiColombia();
    const coordenadas = new ApiCoordenadas();
    const pasos = document.querySelectorAll(".paso");
    const selectDepartamento = document.getElementById("departamento");
    let selectCiudad = document.getElementById("ciudad");
    let genero = document.querySelector('input[name="genero"]:checked');
    let nombreAlcalde = document.getElementById("nombreAlcalde");
    let nombreCiudadACrear = document.getElementById("nombreCiudad");
    let anchura = document.getElementById("longitudMapa");
    let altura = document.getElementById("alturaMapa");
    let nombreDepartamento;
    let nombreCiudad;
    let longitud;
    let latitud;
    const dineroInicial = 50000;
    window.siguiente = siguiente;
    window.anterior = anterior;
    window.crearCiudad = crearCiudad;


    //===========================================================================
    //SECCIÓN QUE VA A PERMITIR DESPLAZARSE ENTRE VARIAS SECCIONES DEL FORMULARIO
    //===========================================================================

    //Esto busca todos los elementos que contengan en su clase la palabra paso

    let pasoActual = 0;

    function mostrarPaso(indice){
        //para saber que sección que se va a mostrar, la clase de esa div es "paso activo"
        pasos.forEach(paso =>
            paso.classList.remove("activo")
        );//Cuando se pasa la página, se quita ese "activo" para activar otra

        pasos[indice].classList.add("activo");
        //Se le agrega el activo a la siguiente/anterior
    }
    function siguiente(){
        if(pasoActual < pasos.length - 1){
            //Se pasa a la página siguiente siempre y cuando no se exceda el número de pasos
            pasoActual++;
            mostrarPaso(pasoActual);
        }
    }
    function anterior(){

        if(pasoActual > 0){
            //Se pasa a la página anterior siempre y cuando haya páginas anteriores
            pasoActual--;
            mostrarPaso(pasoActual);
        }
    }

    //===========================================
    //SECCIÓN DE SELECCIÓN DE SELECCIÓN DE GÉNERO
    //===========================================

    const radios = document.querySelectorAll('input[name="genero"]');
    let generoActual = 0;

    function mostrarGenero(i){
        radios[i].checked = true;
    }

    document.getElementById("siguienteGenero").addEventListener("click", () => {

        generoActual++;

        if(generoActual >= radios.length){
            generoActual = 0;
        }

        mostrarGenero(generoActual);

    });

    document.getElementById("anteriorGenero").addEventListener("click", () => {

        generoActual--;

        if(generoActual < 0){
            generoActual = radios.length - 1;
        }

        mostrarGenero(generoActual);

    });
    //=============================================
    //SECCIÓN DE SELECCIÓN DE DEPARTAMENTO Y CIUDAD
    //=============================================
    cargarDepartamentos();
    function cargarDepartamentos(){

        api.getDepartamentos()
            .then(departamentos => {

                // opción inicial
                selectDepartamento.innerHTML =
                    '<option value="">Seleccione...</option>';

                departamentos.forEach(dep => {

                    const opcion =
                        document.createElement("option");

                    opcion.value = dep.id;
                    opcion.textContent = dep.nombre;

                    selectDepartamento.appendChild(opcion);
                });

            })
            .catch(error =>
                console.error(error)
            );
    }
    //Se activa el evento cuando el usuario selecciona una ciudad
    selectDepartamento.addEventListener("change", function() {
            // Aquí puedes obtener el valor seleccionado
            let idDepartamento = this.value; // o selectDepartamento.value
            if(idDepartamento) {
                cargarCiudades(idDepartamento);
                nombreDepartamento = this.options[this.selectedIndex].text;
                longitud = null;
                latitud = null; //Hago esto para que si el usuario no selecciona una ciudad con el nuevo departamento, no manden la solicitud con una ciudad en un departamento equivocado
            } else {
                // Si no se selecciona nada, puedes vaciar el select de ciudades
                document.getElementById("ciudad").innerHTML = '<option value="" disabled selected hidden>Seleccione...</option>';;
            }
    });
    function cargarCiudades(departamentoId) {
        api.getCiudadesDepartamento(departamentoId)
            .then(ciudades => {
                // opción inicial
                selectCiudad.innerHTML = '<option value="">Seleccione...</option>';

                ciudades.forEach(ciudad => {
                    const opcion = document.createElement("option");
                    opcion.value = ciudad.nombre;
                    opcion.textContent = ciudad.nombre;
                    selectCiudad.appendChild(opcion);
                });

            })
            .catch(error => console.error(error));
    }
    selectCiudad.addEventListener("change",function(){//Este evento se activa cuando el usuario cambia de opción
        nombreCiudad = this.value;
        if (nombreCiudad){
            coordenadas.obtenerCoordenadas(nombreCiudad,nombreDepartamento).then(diccionarioCoordenadas => {
                longitud = diccionarioCoordenadas.longitud;
                latitud = diccionarioCoordenadas.latitud;
                console.log("Coordenadas obtenidas:", longitud, latitud);
            })
            .catch(error => {
                console.error("Error obteniendo coordenadas:", error);
                longitud = null;
                latitud = null;
            });
        }
        else{
            latitud = null;
            longitud = null;
        }

    })
    function cargarViasEdificios(filas,columnas){
        /*Carga las vías y los edificios en el mapa inicial*/
        let edificios = []; //Array donde van los edificios
        let vias = Array.from(//Llena el array de vias con 0
            { length: filas }, 
            () => Array(columnas).fill(0)
        );
        let dineroGastado = 0; //Va a contar los gastos
        let invalidos = false; //Flag de edificios invalidos
        let costoExcedido = false //Flag de dinero inicial excedido
        infraestructura = (SessionStorage.cargar()).edificios;//Carga el json del session storage

        if (infraestructura){
            //primer recorrido: construcción vías
            infraestructura.forEach(edificio =>{
                //primera validación: que quepa el edificio en el mapa
               if (edificio.fila <= filas-1 && edificio.columna <= columnas-1){
                    //segunda validación: que sea una vía
                    if (edificio.id == "via"){
                        //tercera validación: que se pueda comprar
                        if (dineroGastado<dineroInicial-edificio.def.costo){
                            //se marca la vía en la matriz de vias, se suma el costo de construcción, y se mete al array de edificios
                            vias[edificio.fila][edificio.columna] = 1;
                            dineroGastado += edificio.def.costo;
                            edificios.push(Edificaciones._crearInstancia(edificio.id, edificio.fila, edificio.columna, edificio.def));
                        }
                        else{
                            costoExcedido = true;
                        }

                    }
                }
               else{
                    invalidos = true;
               }
            });

            //segundo recorrido: construcción de otros edificios
            infraestructura.forEach(edificio =>{
                //primera validación: que quepa en el mapa
               if (edificio.fila <= filas-1 && edificio.columna <= columnas-1){
                    //segunda validación: que no sea via
                    if (!(edificio.id == "via")){
                        //tercera validación: que no exceda el presupuesto inicial
                        if (dineroGastado<=dineroInicial-edificio.def.costo){
                            //cuarta validación: que tenga via adyacente
                            if(vias[edificio.fila]?.[edificio.columna-1] == 1 ||
                            vias[edificio.fila]?.[edificio.columna+1] == 1 ||
                            vias[edificio.fila-1]?.[edificio.columna] == 1 ||
                            vias[edificio.fila+1]?.[edificio.columna] == 1){
                                //se guarda el costo, se agrega al array de edificios
                                dineroGastado += edificio.def.costo;
                                edificios.push(Edificaciones._crearInstancia(edificio.id, edificio.fila, edificio.columna, edificio.def));
                            }
                            else{
                                invalidos = true;
                            }
                        }
                        else{
                            costoExcedido = true;
                        }
                    } 
                }
               else{
                    invalidos = true;
               }
            });
        }
        if (invalidos){
            alert("Algunos edificios no fueron construidos porque no estaban adyacentes a una vía, o porque no cabían dentro de las dimensiones de mapa seleccionadas")
        }
        if (costoExcedido){
            alert("Algunos edificios no fueron construidos porque se excedió el presupuesto inicial de $50.000")
        }
        //se retorna la matriz de vias, la de edificios, y los gastos
        return {
            vias: vias,
            edificios: edificios,
            gastos: dineroGastado
        }
    }

    function crearCiudad(){
        let crear = true;
        let anchoNum = Number(anchura.value);
        let altoNum = Number(altura.value);
        if (!genero.value){//Validaciones
            crear = false;
            alert("Primero dinos si eres un rey o una reina");
        }
        if (!nombreAlcalde.value){
            crear = false;
            alert("Primero escribe tu nombre");
        }
        if (!nombreCiudadACrear.value){
            crear = false;
            alert("Primero escribe el nombre de la ciudad que vas a fundar")
        }
        if (!anchura.value){
            crear = false;
            alert("Primero selecciona la longitud del mapa");
        }
        if (!altura.value){
            crear = false;
            alert("Primero selecciona la altura del mapa");
        }
        if (!nombreDepartamento){
            crear = false;
            alert("Primero selecciona el nombre del departamento colombiano cuya ciudad tiene un clima similar a tu nueva ciudad");
        }
        if (!nombreCiudad){
            crear = false;
            alert("Primero selecciona el nombre de la ciudad colombiana cuyo clima  es similar a tu nueva ciudad");
        }
        if(anchoNum > 30 || anchoNum < 15 || altoNum > 30 || altoNum < 15 || !Number.isInteger(altoNum) || !Number.isInteger(anchoNum)){
            crear = false;
            alert("Las dimensiones de la ciudad deben ser enteros entre 15 y 30");
        }
        if (nombreCiudad && (!longitud || !latitud)){
            crear = false;
            alert("No se pudo obtener las coordenadas de la ciudad colombiana seleccionada. Por favor inténtalo de nuevo más tarde o cambia la ciudad")
        }
        if (crear) {
            const generoValor = document.querySelector('input[name="genero"]:checked').value;
            viasEdificios = cargarViasEdificios(anchoNum,altoNum)
            const estadoInicial = {
                dinero:       dineroInicial - viasEdificios.gastos,
                agua:         0,
                electricidad: 0,
                alimento:     0,
                felicidad:    0,
            };
            const ciudad = new Ciudad(
                nombreCiudadACrear.value,
                nombreAlcalde.value,
                latitud,
                longitud,
                30000,
                new Terreno(viasEdificios.vias, viasEdificios.edificios),
                [],
                estadoInicial,
                []
            );
            ciudad.genero = generoValor;

            CiudadStorage.guardar(ciudad);
            window.location.href = "tablero.html";
        }
    }

    function actualizarPlaceholder() {
    if (window.innerWidth <= 768) {
        nombreAlcalde.placeholder = "Nombre alcalde/sa";
        nombreCiudadACrear.placeholder = "Nombre ciudad";
    } else {
        nombreAlcalde.placeholder = "Ingresa el nombre del gobernante de la ciudad";
        nombreCiudadACrear.placeholder = "Ingresa el nombre tu futura ciudad";
    }
}
actualizarPlaceholder();
window.addEventListener("resize", actualizarPlaceholder);
});
