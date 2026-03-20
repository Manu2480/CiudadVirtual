
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

/* =========================================
CLICK EN EL BOTÓN PRINCIPAL
Si todavía no hay archivo cargado, abre el
explorador de archivos del sistema operativo.
Si ya se cargó un JSON válido, navega a la ciudad.
========================================= */


cargaJSON.addEventListener("click", () => {

    if(cargaJSON.classList.contains("listo")){
        window.location.href = "ciudad.html";
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
            /* Intenta parsear el texto como JSON para comprobar que es válido */
            JSON.parse(evento.target.result);

            document.body.classList.remove("gris");

            /* Cambia el texto del botón a "Ver ciudad" y marca como listo */
            cargaJSON.textContent = "Ver ciudad";
            cargaJSON.classList.add("listo");

        } catch {
            /* El archivo no tiene formato JSON válido */
            alert("El archivo no es un JSON válido. Por favor intenta de nuevo.");
            fileInput.value = ""; /* limpia el input para permitir otro intento */
        }
    };

    reader.readAsText(archivo); /* lee el archivo como texto plano */

});
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
            const columnas = fila.trim().split(" ") //separo las columans por espacios,
            contadorColumna = 0; //reinicio el contador de la columna en cada fila
            columnas.forEach(columna => {
                if (!columna){
                    return;//si no existe la columna, se devuelve
                }
                const id = clavesTxt[columna]; //le saco el id según la convencion de arriba
                if (!id){
                    console.log(`Símbolo inválido: ${columna} en fila ${contadorFila}, columna ${contadorColumna}`);
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
    window.location.href = "formulario.html"
});

function crearDiccionarioEdificio(id,fila,columna){
    if (id == "terreno"){
        return;
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



