
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
const cargaBtn = document.getElementById("cargaBtn");
const fileInput = document.getElementById("fileInput");


/* =========================================
CLICK EN EL BOTÓN PRINCIPAL
Si todavía no hay archivo cargado, abre el
explorador de archivos del sistema operativo.
Si ya se cargó un JSON válido, navega a la ciudad.
========================================= */


cargaBtn.addEventListener("click", () => {

    if(cargaBtn.classList.contains("listo")){
        windows.location.href = "ciudad.html";
    } else {
        fileInput.click();
    }
})


/* =========================================
EVENTO AL SELECCIONAR UN ARCHIVO
Se ejecuta cuando el usuario elige un archivo
en el explorador. Lee el contenido, lo valida
como JSON y, si es correcto, inicia el revelado.
========================================= */
fileInput.addEventListener("change", (e) => {

    const archivo = e.target.files[0];
    if (!archivo) return; /* el usuario cerró el explorador sin elegir nada */

    const reader = new FileReader();

    reader.onload = (evento) => {
        try {
            /* Intenta parsear el texto como JSON para comprobar que es válido */
            JSON.parse(evento.target.result);

            document.body.classList.remove("gris");

            /* Cambia el texto del botón a "Ver ciudad" y marca como listo */
            cargaBtn.textContent = "Ver ciudad";
            cargaBtn.classList.add("listo");

        } catch {
            /* El archivo no tiene formato JSON válido */
            alert("El archivo no es un JSON válido. Por favor intenta de nuevo.");
            fileInput.value = ""; /* limpia el input para permitir otro intento */
        }
    };

    reader.readAsText(archivo); /* lee el archivo como texto plano */

});


