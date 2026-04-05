const logo = document.getElementById("logo");
const botones = document.getElementById("botones");
const menu = document.getElementById("menu");

logo.addEventListener("click", () => {

    if(menu.classList.contains("activo")){

        menu.classList.remove("activo");
        botones.classList.remove("mostrar");

    }else{

        menu.classList.add("activo");

        setTimeout(()=>{
            botones.classList.add("mostrar");
        },200);

    }

});

/* Muestra el botón de reanudar solo si hay partida guardada */
const wrapperReanudar = document.getElementById("wrapper-reanudar");
if (wrapperReanudar && localStorage.getItem("ciudad")) {
    wrapperReanudar.classList.add("activo")
}