(function(){

window.validarFormulario = function(){

    let crear = true;

    const genero = document.querySelector('input[name="genero"]:checked');
    const nombreAlcalde = document.getElementById("nombreAlcalde");
    const nombreCiudad = document.getElementById("nombreCiudad");
    const anchura = document.getElementById("longitudMapa");
    const altura = document.getElementById("alturaMapa");

    let anchoNum = Number(anchura.value);
    let altoNum = Number(altura.value);

    if (!genero){
        alert("Primero dinos si eres un rey o una reina");
        crear = false;
    }

    if (!nombreAlcalde.value){
        alert("Primero escribe tu nombre");
        crear = false;
    }

    if (!nombreCiudad.value){
        alert("Primero escribe el nombre de la ciudad");
        crear = false;
    }

    if (!anchura.value){
        alert("Selecciona la longitud del mapa");
        crear = false;
    }

    if (!altura.value){
        alert("Selecciona la altura del mapa");
        crear = false;
    }

    if (!window.nombreDepartamento){
        alert("Selecciona un departamento");
        crear = false;
    }

    if (!window.nombreCiudad){
        alert("Selecciona una ciudad");
        crear = false;
    }

    if(anchoNum > 30 || anchoNum < 15 || altoNum > 30 || altoNum < 15 ||
       !Number.isInteger(altoNum) || !Number.isInteger(anchoNum)){
        alert("Dimensiones inválidas");
        crear = false;
    }

    if (window.nombreCiudad && (!window.longitud || !window.latitud)){
        alert("No se pudieron obtener coordenadas");
        crear = false;
    }

    return crear;
}

})();