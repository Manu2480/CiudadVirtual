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