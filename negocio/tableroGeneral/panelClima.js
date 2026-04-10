/*
PANEL CLIMA
Visualización del widget del clima.
*/
function cargarClima(widgets, ciudad) {
    ClimaService.obtenerClimaCiudad(ciudad)
        .then(clima => {
            console.log("Entrando a renderizar chip");
            const vistaActual = document.documentElement.getAttribute("data-vista");

            if (vistaActual != "movil"){
                widgets.forEach(widget => {
                    widget.innerHTML = htmlClima(clima);
                });

            }
            if (vistaActual == "movil"){
                _renderizarChip(clima);
            }
        })
        .catch(err => {
            widgets.forEach(widget => {
                const id = getId();
                console.warn(`${id} no disponible`, err);
                widget.innerHTML = `
                    <div class="modulo-header">
                        <h2 class="panel__titulo">Clima</h2>
                    </div>
                    <p>No disponible</p>
                `;
            });
        });
}

function htmlClima(clima){
    return(
            `
            <div class="modulo-header">
                <h2 class="panel__titulo">Clima</h2>
            </div>
            <div class="clima-contenido">
                <div class="clima-icono">
                    <i class="fi ${ClimaService.iconoCondicion(clima.condicion)}"></i>
                </div>
                <div class="clima-temperatura">${Math.round(clima.temperatura)}°C</div>
                <div class="clima-descripcion">${clima.condicion}</div>
                <div class="clima-humedad">
                    Humedad: ${clima.humedad}%
                </div>
                <div class="clima-viento">
                    <div class="clima_div"><i class="fi fi-br-wind"></i> Viento</div>
                    <div class="clima_div"><i>Velocidad:</i> ${clima.viento.velocidad} m/s</div>
                    <div class="clima_div"><i>Dirección:</i> ${clima.viento.grados}°</div>
                    <div class="clima_div"><i>Ráfaga:</i> ${clima.viento.rafaga} m/s</div>
                </div>
            </div>
        `);

}


function inicializar() {
    vista = 
    ActualizacionesPeriodicas.esperarConReintentos({
        condicion: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            const widgets = getWidgets();
            return Boolean(widgets && ciudad?.latitud && ciudad?.longitud);
        },
        alCumplir: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            const widgets = getWidgets();
            if (!widgets || !ciudad) return;

            ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
                id: getId(),
                accion: () => cargarClima(widgets, ciudad),
                intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_CLIMA,
                ejecutarAhora: true,
            });
        },
        maxIntentos: 10,
        delayMs: ActualizacionesPeriodicas.INTERVALOS_MS.REINTENTO_CORTO,
    });
}

function getWidgets(){
    const vistaActual = document.documentElement.getAttribute("data-vista");
    let widgets = [];
    if (vistaActual == "desktop"){
        widgets.push(document.getElementById("widget-clima"));
    }
    else if (vistaActual == "tablet"){
        let panelClimaVertical = document.getElementById("clima-tablet-vertical"); 
        let panelClimaHorizontal = document.getElementById("clima-tablet-horizontal");
        widgets.push(panelClimaVertical);
        widgets.push(panelClimaHorizontal);
    }
    else if (vistaActual == "movil"){
        widgets.push(document.querySelector(".clima-compacto")); //Se manda el botón del chip para pasar la validación
    }
    return widgets;
}

function getId(){
    const vistaActual = document.documentElement.getAttribute("data-vista");
    if (vistaActual == "desktop"){
        return("clima:desktop");
    }
    else if (vistaActual == "tablet"){
        return("clima:tablet");
    }
    else if (vistaActual == "movil"){
        return("clima:movil")

    }
}

function _renderizarChip(clima) {
    console.log("Renderizando chip");
    console.log("btnRec:", document.getElementById("btn-recursos-movil"));
    console.log("encabezado:", document.querySelector(".encabezado"));
    /* Reutiliza chip si ya existe */
    let chip = document.querySelector(".clima-compacto");
    if (!chip) {
        chip = document.createElement("span");
        chip.className = "clima-compacto";
        const btnRec = document.getElementById("btn-recursos-movil");
        if (btnRec) btnRec.before(chip);
        else document.querySelector(".encabezado")?.appendChild(chip);
    }

    chip.title = `${clima.condicion} · Toca para más info`;
    chip.innerHTML = `
        <i class="fi ${ClimaService.iconoCondicion(clima.condicion)} clima-compacto__icono"></i>
        <span>${Math.round(clima.temperatura)}°C</span>
    `;

    chip.onclick = () => {Modal.abrir(htmlClima(clima))};
}

window.panelClima = { inicializar };