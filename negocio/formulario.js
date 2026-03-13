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
    window.siguiente = siguiente;
    window.anterior = anterior;
    window.crearCiudad = crearCiudad;

    // Función para detectar overflow en inputs y activar animación
    function checkOverflow() {
        const inputs = document.querySelectorAll('.nombre');
        
        inputs.forEach(input => {
            if (input.scrollWidth > input.clientWidth){
                input.classList.add('overflowing');
            } else {
                input.classList.remove('overflowing');
            }
        }); //Si hay overflow le agrega nombre 'overflowing', si no, se lo quita
    }

    // Verificar overflow en eventos de input y cuando el usuario manipula / deja de manipular el input
    document.addEventListener('input', checkOverflow);
    document.addEventListener('focusin', checkOverflow);
    document.addEventListener('focusout', checkOverflow);
    

    // Verificar overflow inicial
    checkOverflow();

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
                nombreCiudad = null;
                longitud = null;
                latitud = null; //Hago esto para que si el usuario no selecciona una ciudad con el nuevo departamento, no manden la solicitud con una ciudad en un departamento equivocado
            } else {
                // Si no se selecciona nada, puedes vaciar el select de ciudades
                document.getElementById("ciudad").innerHTML = "";
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
        if (crear){
            console.log("Creando ciudad")
            //Comandito para crear la ciudad
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
