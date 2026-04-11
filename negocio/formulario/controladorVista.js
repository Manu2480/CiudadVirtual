(function(){

document.addEventListener("DOMContentLoaded", function(){

    // ===== VARIABLES GLOBALES =====
    const pasos = document.querySelectorAll(".paso");
    const selectDepartamento = document.getElementById("departamento");
    const selectCiudad = document.getElementById("ciudad");

    window.nombreDepartamento = null;
    window.nombreCiudad = null;
    window.longitud = null;
    window.latitud = null;

    const nombreAlcalde = document.getElementById("nombreAlcalde");
    const nombreCiudadACrear = document.getElementById("nombreCiudad");

    // ===== NAVEGACIÓN =====
    let pasoActual = 0;

    function mostrarPaso(indice){
        pasos.forEach(p => p.classList.remove("activo"));
        pasos[indice].classList.add("activo");
    }

    window.siguiente = function(){
        if(pasoActual < pasos.length - 1){
            pasoActual++;
            mostrarPaso(pasoActual);
        }
    }

    window.anterior = function(){
        if(pasoActual > 0){
            pasoActual--;
            mostrarPaso(pasoActual);
        }
    }

    // ===== GÉNERO =====
    const radios = document.querySelectorAll('input[name="genero"]');
    let generoActual = 0;

    function mostrarGenero(i){
        radios[i].checked = true;
    }

    document.getElementById("siguienteGenero").addEventListener("click", () => {
        generoActual = (generoActual + 1) % radios.length;
        mostrarGenero(generoActual);
    });

    document.getElementById("anteriorGenero").addEventListener("click", () => {
        generoActual = (generoActual - 1 + radios.length) % radios.length;
        mostrarGenero(generoActual);
    });

    // ===== DEPARTAMENTOS =====
    function cargarDepartamentos(){
        ColombiaService.obtenerDepartamentos().then(deps => {

            selectDepartamento.innerHTML = '<option value="">Seleccione...</option>';

            deps.forEach(dep => {
                const op = document.createElement("option");
                op.value = dep.id;
                op.textContent = dep.nombre;
                selectDepartamento.appendChild(op);
            });

        });
    }

    function cargarCiudades(id){
        ColombiaService.obtenerCiudadesDepartamento(id).then(ciudades => {

            selectCiudad.innerHTML = '<option value="">Seleccione...</option>';

            ciudades.forEach(ciudad => {
                const op = document.createElement("option");
                op.value = ciudad.nombre;
                op.textContent = ciudad.nombre;
                selectCiudad.appendChild(op);
            });

        });
    }

    selectDepartamento.addEventListener("change", function(){

        if(this.value){
            cargarCiudades(this.value);
            window.nombreDepartamento = this.options[this.selectedIndex].text;
            window.latitud = null;
            window.longitud = null;
        }

    });

    selectCiudad.addEventListener("change", function(){

        window.nombreCiudad = this.value;

        if (window.nombreCiudad){
            CoordenadasService.obtenerCoordenadas(
                window.nombreCiudad,
                window.nombreDepartamento
            ).then(coord => {
                window.latitud = coord.latitud;
                window.longitud = coord.longitud;
            }).catch(() => {
                window.latitud = null;
                window.longitud = null;
            });
        }

    });

    // ===== PLACEHOLDER =====
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

    cargarDepartamentos();

});

})();