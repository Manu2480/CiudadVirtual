
/* =========================================
CARGAR.JS
Maneja la interacción de la pantalla de carga:
  1. Abre el explorador de archivos al hacer click en el botón
  2. Lee y valida el archivo JSON seleccionado
  3. Anima la imagen de gris a color de abajo hacia arriba
  4. Cambia el botón a "Ver ciudad" y redirige al hacer click
========================================= */


/* =========================================
REFERENCIAS AL DOM
========================================= */
const cargaJSON = document.getElementById("cargaJSON");
const cargaTxt = document.getElementById("cargaTXT")
const jsonInput = document.getElementById("jsonInput");
const txtInput = document.getElementById("txtInput");
const btnIzquierda = document.getElementById("izquierda");
const btnDerecha = document.getElementById("derecha");
const botonesCarga = document.querySelectorAll(".cargaBtn");
let botonCargaActual = 0;

const clavesTxt = {
    g: "terreno",
    r: "via",
    R1: "casa",
    R2: "apartamento",
    C1: "tienda",
    C2: "centro-comercial",
    I1: "fabrica",
    I2: "granja",
    S1: "policia",
    S2: "bombero",
    S3: "hospital",
    U1: "planta-electrica",
    U2: "planta-hidraulica",
    P1: "parque"
}
/*NAVEGACIÓN ENTRE ESTILOS DE CARGA*/
btnIzquierda.addEventListener("click",() => cambiarBotonCarga(-1));
btnDerecha.addEventListener("click",() => cambiarBotonCarga(1))
function cambiarBotonCarga(cantidad){
    const cantidadNueva = botonCargaActual + cantidad;
    const posMaxima = botonesCarga.length -1;
    botonesCarga.forEach(boton => 
        boton.classList.remove("activo") //dejo de mostrar los botones
    );
    if (cantidadNueva >= 0 && cantidadNueva <= posMaxima){
        //si la cantidad nueva está dentro de los parámetros, se pone ese botón como activo
        botonesCarga[cantidadNueva].classList.add("activo");
        botonCargaActual = cantidadNueva;
    }
    else if (cantidadNueva < 0){
        //si la cantidad nueva es menor a 0, significa que se debe retornar a la posición máxima
        botonesCarga[posMaxima].classList.add("activo");
        botonCargaActual = posMaxima;
    }
    else{
        //si la posición nueva supera, entonces debe mostrarse la primera posición
        botonesCarga[0].classList.add("activo");
        botonCargaActual = 0;
    }

}

/* =========================================
CLICK EN EL BOTÓN PRINCIPAL
Si todavía no hay archivo cargado, abre el
explorador de archivos del sistema operativo.
Si ya se cargó un JSON válido, navega a la ciudad.
========================================= */


cargaJSON.addEventListener("click", () => {

    if(cargaJSON.classList.contains("listo")){
        window.location.href = "tablero.html";
    } else {
        jsonInput.click();
    }
})



/* =========================================
EVENTO AL SELECCIONAR UN ARCHIVO
Se ejecuta cuando el usuario elige un archivo
en el explorador. Lee el contenido, lo valida
como JSON y, si es correcto, inicia el revelado.
========================================= */
jsonInput.addEventListener("change", (e) => {

    const archivo = e.target.files[0];
    if (!archivo) return; /* el usuario cerró el explorador sin elegir nada */

    const reader = new FileReader();

    reader.onload = (evento) => {
        try {
            const jsonCrudo = JSON.parse(evento.target.result);
            const ciudadNormalizada = validarYNormalizarCiudad(jsonCrudo);

            /* Reemplaza la ciudad previa y deja listo el tablero para renderizar */
            CiudadStorage.guardar(ciudadNormalizada);

            document.body.classList.remove("gris");

            /* Cambia el texto del botón a "Ver ciudad" y marca como listo */
            cargaJSON.textContent = "Ver ciudad";
            cargaJSON.classList.add("listo");

            /* Renderiza la ciudad cargada en el tablero */
            window.location.href = "tablero.html";

        } catch (error) {
            const mensaje = error?.message || "El archivo no tiene la estructura de una ciudad válida.";
            alert(mensaje);
            jsonInput.value = ""; /* limpia el input para permitir otro intento */
        }
    };

    reader.readAsText(archivo); /* lee el archivo como texto plano */

});

function validarYNormalizarCiudad(data){
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("El archivo no contiene un objeto JSON de ciudad válido.");
    }

    const vias = data.terreno?.vias;
    if (!Array.isArray(vias) || vias.length === 0 || !Array.isArray(vias[0]) || vias[0].length === 0) {
        throw new Error("La ciudad debe incluir terreno.vias como una matriz válida.");
    }

    const filas = vias.length;
    const columnas = vias[0].length;
    const matrizValida = vias.every(
        (fila) => Array.isArray(fila)
            && fila.length === columnas
            && fila.every((celda) => Number.isInteger(celda) && (celda === 0 || celda === 1))
    );

    if (!matrizValida) {
        throw new Error("La matriz terreno.vias debe ser rectangular y contener solo 0 o 1.");
    }

    const edificios = data.terreno?.edificios;
    if (!Array.isArray(edificios)) {
        throw new Error("La ciudad debe incluir terreno.edificios como un arreglo.");
    }

    const edificiosValidos = edificios.every((edificio) => {
        const fila = edificio?.ubicacion?.fila;
        const columna = edificio?.ubicacion?.columna;
        return typeof edificio?.id === "string"
            && Number.isInteger(fila)
            && Number.isInteger(columna)
            && fila >= 0 && fila < filas
            && columna >= 0 && columna < columnas;
    });

    if (!edificiosValidos) {
        throw new Error("Cada edificio debe tener id y ubicacion.fila/columna dentro del mapa.");
    }

    const estadoRecursos = data.estadoRecursos || {};
    const recursosRequeridos = ["dinero", "agua", "electricidad", "alimento", "felicidad"];
    const recursosValidos = recursosRequeridos.every((clave) => typeof estadoRecursos[clave] === "number");

    if (!recursosValidos) {
        throw new Error("estadoRecursos debe incluir dinero, agua, electricidad, alimento y felicidad numéricos.");
    }

    return {
        ...data,
        nombre: typeof data.nombre === "string" && data.nombre.trim() ? data.nombre : "Mi Ciudad",
        alcalde: typeof data.alcalde === "string" && data.alcalde.trim() ? data.alcalde : "Alcalde",
        latitud: typeof data.latitud === "number" ? data.latitud : 0,
        longitud: typeof data.longitud === "number" ? data.longitud : 0,
        tiempoTurno: typeof data.tiempoTurno === "number" && data.tiempoTurno > 0 ? data.tiempoTurno : 30000,
        terreno: {
            vias,
            edificios,
        },
        ciudadanos: Array.isArray(data.ciudadanos) ? data.ciudadanos : [],
        estadoRecursos,
    };
}

cargaTxt.addEventListener("click",()=>{
    txtInput.click();
});
txtInput.addEventListener("change", (e) => { 
    /* */
    const archivo = e.target.files[0];
    if (!archivo){
        return;
    }
    const lector = new FileReader(); //El que leera el archivo
    lector.onload = function(event){
        const texto = event.target.result; //contenido del archivo
        let contadorColumna = 0;
        let contadorFila = 0;
        const edificios = []
        const filas = texto.trim().split("\n"); //separo las filas por saltos de linea
        filas.forEach(fila => {
            const columnas = fila.trim().split(" ") //separo las columans por espacios
            contadorColumna = 0; //reinicio el contador de la columna en cada fila
            columnas.forEach(columna => {
                if (!columna){
                    return;//si no existe la columna, se devuelve
                }
                const id = clavesTxt[columna]; //le saco el id según la convencion de arriba
                if (!id){
                    //Le reporta al usuario de convenciones inválidas
                    alert(`Símbolo inválido: ${columna} en fila ${contadorFila}, columna ${contadorColumna}`);
                }
                const diccionario = crearDiccionarioEdificio(id,contadorFila,contadorColumna)
                if (diccionario){
                    edificios.push(diccionario);
                }
                contadorColumna++;
            });
            contadorFila++
        });
        SessionStorage.subirEdificios(edificios)

    }
    lector.readAsText(archivo); //Este va a disparar la función definida
    //arriba cuando cargue el archivo
    window.location.href = "formulario.html" //redirige al usuario
});

function crearDiccionarioEdificio(id,fila,columna){
    if (id == "terreno"){
        return;
        //Si es terreno, no se guarda
    }
    const datos = Edificios.obtener(id);
    if(datos){
        return{
            id: datos.id,
            fila: fila,
            columna: columna,
            def: datos
        };
    }
}



