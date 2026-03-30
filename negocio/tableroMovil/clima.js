/* ================================================
CLIMA MÓVIL
Widget compacto en el header + modal con detalle.

Responsabilidades:
  - Consultar ApiClima cada 30 minutos
  - Mostrar chip icono + temperatura en el header
  - Al tocar el chip, abrir modal con todos los datos

Dependencias: tablero.js, ApiClima.js
================================================ */

let _datosClima = null;

function inicializar() {
    ActualizacionesPeriodicas.esperarConReintentos({
        condicion: () => {
            const ciudad = window.Tablero?.Estado?.ciudad;
            return Boolean(ciudad?.latitud && ciudad?.longitud);
        },
        alCumplir: () => {
            ActualizacionesPeriodicas.iniciarTrabajoPeriodico({
                id: "clima:movil",
                accion: () => _consultarClima(window.Tablero?.Estado?.ciudad),
                intervaloMs: ActualizacionesPeriodicas.INTERVALOS_MS.INTERVALO_CLIMA,
                ejecutarAhora: true,
            });
        },
        delayMs: ActualizacionesPeriodicas.INTERVALOS_MS.REINTENTO_CORTO,
    });
}

function _consultarClima(ciudad) {
    ClimaService.obtenerClimaCiudad(ciudad)
        .then(datos => {
            _datosClima = datos;
            _renderizarChip(datos);
        })
        .catch(err => console.warn("ClimaMovil: no disponible.", err));
}

function _renderizarChip(datos) {
    /* Reutiliza chip si ya existe */
    let chip = document.querySelector(".clima-compacto");
    if (!chip) {
        chip = document.createElement("span");
        chip.className = "clima-compacto";
        const btnRec = document.getElementById("btn-recursos-movil");
        if (btnRec) btnRec.before(chip);
        else document.querySelector(".encabezado")?.appendChild(chip);
    }

    chip.title = `${datos.condicion} · Toca para más info`;
    chip.innerHTML = `
        <i class="fi ${ClimaService.iconoCondicion(datos.condicion)} clima-compacto__icono"></i>
        <span>${Math.round(datos.temperatura)}°C</span>
    `;

    chip.onclick = _mostrarModalClima;
}

function _mostrarModalClima() {
    if (!_datosClima) return;
    const d = _datosClima;

    /* Overlay */
    let overlay = document.getElementById("clima-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "clima-overlay";
        overlay.className = "clima-overlay";
        overlay.addEventListener("click", _cerrarModalClima);
        document.body.appendChild(overlay);
    }

    /* Panel */
    let panel = document.getElementById("clima-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "clima-panel";
        panel.className = "clima-panel";
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="clima-panel__encabezado">
            <i class="fi ${ClimaService.iconoCondicion(d.condicion)} clima-panel__icono-principal"></i>
            <div>
                <div class="clima-panel__temperatura">${Math.round(d.temperatura)}°C</div>
                <div class="clima-panel__condicion">${d.condicion}</div>
            </div>
        </div>
        <hr class="clima-panel__separador">
        <div class="clima-panel__detalle">
            <div class="clima-panel__fila">
                <i class="fi fi-br-raindrops clima-panel__icono-fila"></i>
                <span class="clima-panel__etiqueta">Humedad</span>
                <strong>${d.humedad}%</strong>
            </div>
            <div class="clima-panel__fila">
                <i class="fi fi-br-wind clima-panel__icono-fila"></i>
                <span class="clima-panel__etiqueta">Viento</span>
                <strong>${Math.round((d.viento?.velocidad || 0) * 3.6)} km/h</strong>
            </div>
            ${d.viento?.rafaga ? `
            <div class="clima-panel__fila">
                <i class="fi fi-br-thunderstorm clima-panel__icono-fila"></i>
                <span class="clima-panel__etiqueta">Ráfagas</span>
                <strong>${Math.round(d.viento.rafaga * 3.6)} km/h</strong>
            </div>` : ""}
        </div>
        <button class="clima-panel__btn-cerrar" id="clima-btn-cerrar">Cerrar</button>
    `;

    document.getElementById("clima-btn-cerrar")
        .addEventListener("click", _cerrarModalClima);

    overlay.classList.add("abierto");
    panel.classList.add("abierto");
}

function _cerrarModalClima() {
    document.getElementById("clima-overlay")?.classList.remove("abierto");
    document.getElementById("clima-panel")?.classList.remove("abierto");
}

window.ClimaMovil = { inicializar };