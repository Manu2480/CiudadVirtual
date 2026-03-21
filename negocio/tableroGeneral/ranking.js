/* ================================================
RANKING.JS
Módulo para gestionar el ranking de ciudades.

Responsabilidades:
  - Cargar ranking desde LocalStorage
  - Mostrar ranking en modal con Top 10
  - Resaltar ciudad actual
  - Mostrar posición si no está en Top 10
  - Permitir reiniciar ranking
  - Permitir exportar ranking a JSON

Dependencias: Modal.js (abrir modal), Tablero.js (Estado.ciudad)
================================================ */

const Ranking = (() => {
    const TOP_N = 10;

    /* Obtiene el ranking usando RankingStorage */
    function obtener() {
        return RankingStorage.cargar();
    }

    /* Guarda el ranking usando RankingStorage */
    function guardar(ranking) {
        RankingStorage.guardar(ranking);
    }

    /* Genera HTML para una fila de ranking */
    function _generarFilaRanking(entrada, posicion, esActual = false) {
        const fechaFormato = new Date(entrada.date).toLocaleDateString("es-ES");
        const clasActual = esActual ? 'class="ranking__fila--actual"' : "";
        
        return `
            <tr ${clasActual}>
                <td class="ranking__posicion">#${posicion}</td>
                <td class="ranking__ciudad">${entrada.cityName}</td>
                <td class="ranking__alcalde">${entrada.mayor}</td>
                <td class="ranking__puntuacion">${entrada.score.toLocaleString()}</td>
                <td class="ranking__poblacion">${entrada.population}</td>
                <td class="ranking__felicidad">${entrada.happiness}%</td>
                <td class="ranking__turnos">${entrada.turns}</td>
                <td class="ranking__fecha">${fechaFormato}</td>
            </tr>
        `;
    }

    /* Genera HTML del modal de ranking */
    function _generarHTML() {
        const ranking = obtener();
        if (!ranking.length) {
            return `
                <div class="ranking-vacio">
                    <p>No hay ciudades en el ranking aún.</p>
                </div>
            `;
        }

        const ciudadActual = Tablero?.Estado?.ciudad;
        const nombreActual = ciudadActual?.nombre;

        /* Obtener Top 10 */
        const top10 = ranking.slice(0, TOP_N);

        /* Buscar posición de la ciudad actual */
        let posicionActual = -1;
        let indicePosicionActual = -1;
        ranking.forEach((entrada, idx) => {
            if (entrada.cityName === nombreActual) {
                posicionActual = idx + 1;
                indicePosicionActual = idx;
            }
        });

        /* Generar tabla con Top 10 */
        let html = `
            <div class="ranking-modal">
                <h2 class="ranking__titulo"><img src="../../media/recursos/trofeo.png" alt="Trofeo" class="ranking__icono"> Ranking de Ciudades <img src="../../media/recursos/trofeo.png" alt="Trofeo" class="ranking__icono"></h2>
                
                <div class="ranking-controles">
                    <button id="btn-exportar-ranking" class="btn btn--primario" title="Descargar ranking como JSON">
                        <i class="fi fi-br-download"></i> Exportar
                    </button>
                    <button id="btn-reiniciar-ranking" class="btn btn--secundario" title="Borrar todo el ranking">
                        <i class="fi fi-br-trash"></i> Reiniciar
                    </button>
                </div>

                <div class="ranking-tabla-contenedor">
                    <table class="ranking-tabla">
                        <thead>
                            <tr>
                                <th>Posición</th>
                                <th>Ciudad</th>
                                <th>Alcalde</th>
                                <th>Puntuación</th>
                                <th>Población</th>
                                <th>Felicidad</th>
                                <th>Turnos</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        /* Agregar filas del Top 10 */
        top10.forEach((entrada, idx) => {
            const esActual = entrada.cityName === nombreActual;
            html += _generarFilaRanking(entrada, idx + 1, esActual);
        });

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        /* Si la ciudad actual no está en el Top 10, mostrar su posición */
        if (posicionActual > TOP_N) {
            html += `
                <div class="ranking-ciudad-actual">
                    <p>Tu ciudad: <strong>#${posicionActual}</strong> - ${nombreActual} (${ranking[indicePosicionActual].score.toLocaleString()} pts.)</p>
                </div>
            `;
        }

        html += `
            </div>
        `;

        return html;
    }

    /* Muestra el ranking en un modal */
    function mostrar() {
        const html = _generarHTML();
        Modal.abrir(html);

        /* Agregar event listeners a los botones del ranking */
        document.getElementById("btn-exportar-ranking")?.addEventListener("click", exportarJSON);
        document.getElementById("btn-reiniciar-ranking")?.addEventListener("click", reiniciar);
    }

    /* Exporta el ranking a JSON */
    function exportarJSON() {
        const ranking = obtener();
        if (!ranking.length) {
            Notificaciones.mostrar("No hay datos para exportar.", "aviso");
            return;
        }

        try {
            const jsonString = RankingStorage.exportarJSON();
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ranking_${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            Notificaciones.mostrar("Ranking exportado correctamente.", "exito");
        } catch (e) {
            console.error("ranking.js: error al exportar", e);
            Notificaciones.mostrar("Error al exportar ranking.", "error");
        }
    }

    /* Reinicia el ranking con confirmación */
    function reiniciar() {
        if (!confirm("¿Estás seguro de que deseas reiniciar el ranking? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            RankingStorage.limpiar();
            Notificaciones.mostrar("Ranking reiniciado.", "exito");
            Modal.cerrar();
            setTimeout(() => mostrar(), 100); /* Volver a abrir después de cerrar */
        } catch (e) {
            console.error("ranking.js: error al reiniciar", e);
            Notificaciones.mostrar("Error al reiniciar ranking.", "error");
        }
    }

    /* Retornar interfaz pública */
    return {
        obtener,
        guardar,
        mostrar,
        exportarJSON,
        reiniciar,
    };
})();

window.Ranking = Ranking;
