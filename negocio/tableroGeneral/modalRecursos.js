/* ================================================
MODALRECURSOS.JS
Módulo para gestionar el modal de recursos.

Responsabilidades:
  - Mostrar recursos actuales
  - Permitir modificar recursos globales
  - Mostrar edificios
  - Permitir modificar recursos por edificio
  - Mostrar gráficas del historial

Dependencias: Modal.js, Tablero.js
================================================ */

const ModalRecursos = (() => {

    /* =========================
       CONFIG
    ========================= */
    const INDICADORES = [
        { clave: "dinero",       icono: "fi-br-coins",     label: "Dinero",       fmt: v => `$${Math.round(v).toLocaleString()}` },
        { clave: "agua",         icono: "fi-br-raindrops", label: "Agua",         fmt: v => `${Math.round(v)} L`  },
        { clave: "electricidad", icono: "fi-br-bolt",      label: "Electricidad", fmt: v => `${Math.round(v)} kW` },
        { clave: "alimento",     icono: "fi-br-wheat",     label: "Alimento",     fmt: v => `${Math.round(v)} kg` },
        { clave: "felicidad",    icono: "fi-br-smile-beam",label: "Felicidad",    fmt: v => `${Math.round(v)} Pts`    },
    ];

    /* =========================
       HELPERS
    ========================= */
    function _ciudad() {
        return Tablero?.Estado?.ciudad;
    }

    function _recursos() {
        return _ciudad()?.estadoRecursos || {};
    }

    function _historial() {
        return _ciudad()?.historicoRecursos || [];
    }

    function _edificios() {
        return Edificios.todos() || [];
    }
    /* =========================
       SECCIÓN: MODIFICAR RECURSOS
    ========================= */
    function _generarModificadoresGlobales() {
        const recursos = _recursos();

        return `
            <section>
                <h2>Modificar recursos actuales</h2>
                <div class="grid-recursos">
                    ${INDICADORES.map(r => `
                        <div class="recurso-modal">
                            <i class="fi ${r.icono}"></i>
                            <span>${r.label}</span>
                            <span>${r.fmt(recursos[r.clave] ?? 0)}</span>

                            <input type="number" 
                                data-clave="${r.clave}" 
                                placeholder="Nuevo valor">

                            <button class="btn-aceptar" 
                                    data-clave="${r.clave}">
                                Aceptar
                            </button>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    /* =========================
       SECCIÓN: EDIFICIOS
    ========================= */
    function _generarEdificios() {
        const edificios = _edificios();

        if (!edificios.length) {
            return `<p>No hay edificios.</p>`;
        }

        return `
            <section>
                <h2>Edificios</h2>
                <div class="grid-edificios">
                    ${edificios.map(e => `
                        <div class="tarjeta-edificio" data-id="${e.id}">
                            <img src="${e.imagen}" alt="${e.nombre}">
                            <span>${e.nombre}</span>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    /* =========================
       SECCIÓN: PANEL EDIFICIO
    ========================= */
    function _generarPanelEdificio() {
        return `
            <section>
                <h2>Modificar recursos por edificio</h2>
                <div id="panel-edificio-contenido">
                    <p>Selecciona un edificio</p>
                </div>
            </section>
        `;
    }

    /* =========================
       MODIFICADORES POR EDIFICIO
    ========================= */
    function _generarModificadoresEdificio(edificio) {
        return `
            <h3>${edificio.nombre}</h3>
            ${INDICADORES.map(r => {
                const valor = edificio[r.clave] ?? 0;

                return `
                    <div class="mod-edificio">
                        <span>${r.label}</span>
                        <span>${r.fmt(valor)}</span>
                        <input type="number" id="edit-${edificio.id}-${r.clave}" placeholder="Nuevo valor">
                        <button class="btn-aceptar" data-clave="${r.clave} data-id="${edificio.id}">Aceptar</button>
                    </div>
                `;
            }).join("")}
        `;
    }

    /* =========================
       SECCIÓN: GRÁFICAS
    ========================= */
    function _generarGraficas() {
        return `
            <section>
                <h2>Historial de recursos</h2>
                <div class="graficas">
                    ${INDICADORES.map(r => `
                        <canvas id="grafica-${r.clave}"></canvas>
                    `).join("")}
                </div>
            </section>
        `;
    }

    /* =========================
       HTML COMPLETO
    ========================= */
    function _generarHTML() {
        return `
            <div class="modal-recursos">
                ${_generarModificadoresGlobales()}
                ${_generarEdificios()}
                ${_generarPanelEdificio()}
                ${_generarGraficas()}
            </div>
        `;
    }

    /* =========================
       EVENTOS
    ========================= */
    function _activarEventos() {
    document.querySelectorAll(".tarjeta-edificio").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.id;
            const edificio = _edificios().find(e => e.id == id);

            const contenedor = document.getElementById("panel-edificio-contenido");
            contenedor.innerHTML = _generarModificadoresEdificio(edificio);
        });
    });

    const gridsRecursos = document.querySelectorAll(".grid-recursos");

    gridsRecursos.forEach(grid => {
        grid.addEventListener("click", (e) => {

            if (!e.target.classList.contains("btn-aceptar")) return;

            const clave = e.target.dataset.clave;

            const contenedor = e.target.closest(".recurso-modal");
            const input = contenedor.querySelector("input");

            const valor = Number(input.value);

            console.log("Recurso:", clave);
            console.log("Nuevo valor:", valor);

            const ciudad = _ciudad();
            if (ciudad) {
                ciudad.estadoRecursos[clave] = valor;
            }
            const spanValor = contenedor.querySelectorAll("span")[1];
            spanValor.textContent = INDICADORES.find(r => r.clave === clave).fmt(valor);

            input.value = "";
            CiudadStorage.guardar(ciudad);
        });
    });
}

    /* =========================
       GRÁFICAS
    ========================= */
    function _renderGraficas() {
        const historial = _historial();

        INDICADORES.forEach(r => {
            const canvas = document.getElementById(`grafica-${r.clave}`);
            if (!canvas) return;

            new Chart(canvas, {
                type: "line",
                data: {
                    labels: historial.map((_, i) => i + 1),
                    datasets: [{
                        label: r.label,
                        data: historial.map(h => h[r.clave])
                    }]
                }
            });
        });
    }

    /* =========================
       PÚBLICO
    ========================= */
    function mostrar() {
        const html = _generarHTML();
        Modal.abrir(html);

        _activarEventos();
        _renderGraficas();
    }

    return {
        mostrar
    };

})();

window.ModalRecursos = ModalRecursos;