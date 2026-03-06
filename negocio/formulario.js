addEventListener("DOMContentLoaded",function(){

    //===========================================================================
    //SECCIÓN QUE VA A PERMITIR DESPLAZARSE ENTRE VARIAS SECCIONES DEL FORMULARIO
    //===========================================================================

    const pasos = document.querySelectorAll(".paso");
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
    window.siguiente = siguiente;
    window.anterior = anterior;

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
    const selectDepartamento = document.getElementById("departamento");
    const api = new ApiColombia();
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

});
