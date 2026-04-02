(function(){

const dineroInicial = 50000;

function cargarViasEdificios(filas,columnas){
    
    let edificios = [];
    let vias = Array.from({ length: filas }, () => Array(columnas).fill(0));

    let dineroGastado = 0;
    let invalidos = false;
    let costoExcedido = false;

    let infraestructura = (SessionStorage.cargar()).edificios;

    if (infraestructura){

        infraestructura.forEach(edificio =>{

            if (edificio.fila <= filas-1 && edificio.columna <= columnas-1){

                if (edificio.id == "via"){

                    if (dineroGastado < dineroInicial-edificio.def.costo){

                        vias[edificio.fila][edificio.columna] = 1;
                        dineroGastado += edificio.def.costo;

                        edificios.push(
                            Edificaciones._crearInstancia(
                                edificio.id,
                                edificio.fila,
                                edificio.columna,
                                edificio.def
                            )
                        );

                    } else {
                        costoExcedido = true;
                    }
                }

            } else {
                invalidos = true;
            }

        });

        infraestructura.forEach(edificio =>{

            if (edificio.id !== "via"){

                if (dineroGastado <= dineroInicial-edificio.def.costo){

                    if(
                        vias[edificio.fila]?.[edificio.columna-1] == 1 ||
                        vias[edificio.fila]?.[edificio.columna+1] == 1 ||
                        vias[edificio.fila-1]?.[edificio.columna] == 1 ||
                        vias[edificio.fila+1]?.[edificio.columna] == 1
                    ){

                        dineroGastado += edificio.def.costo;

                        edificios.push(
                            Edificaciones._crearInstancia(
                                edificio.id,
                                edificio.fila,
                                edificio.columna,
                                edificio.def
                            )
                        );

                    } else {
                        invalidos = true;
                    }

                } else {
                    costoExcedido = true;
                }
            }

        });
    }

    if (invalidos){
        alert("Edificios inválidos o fuera del mapa");
    }

    if (costoExcedido){
        alert("Se excedió el presupuesto inicial");
    }

    return { vias, edificios, gastos: dineroGastado };
}

window.crearCiudad = function(){

    if (!window.validarFormulario()) return;

    const nombreAlcalde = document.getElementById("nombreAlcalde");
    const nombreCiudad = document.getElementById("nombreCiudad");
    const anchura = document.getElementById("longitudMapa");
    const altura = document.getElementById("alturaMapa");

    let ancho = Number(anchura.value);
    let alto = Number(altura.value);

    const genero = document.querySelector('input[name="genero"]:checked').value;

    const viasEdificios = cargarViasEdificios(ancho, alto);

    const estadoInicial = {
        dinero: dineroInicial - viasEdificios.gastos,
        agua: 0,
        electricidad: 0,
        alimento: 0,
        felicidad: 0
    };

    const ciudad = new Ciudad(
        nombreCiudad.value,
        nombreAlcalde.value,
        window.latitud,
        window.longitud,
        30000,
        new Terreno(viasEdificios.vias, viasEdificios.edificios),
        [],
        estadoInicial,
        [],
        null
    );

    ciudad.genero = genero;

    CiudadStorage.guardar(ciudad);
    window.location.href = "tablero.html";
};

})();