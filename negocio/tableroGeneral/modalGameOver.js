/* ================================================
MODALGAMEOVER.JS
Modal de Game Over con estilo de periódico.

Responsabilidades:
  - Detectar qué recursos quedaron negativos
  - Generar titulares y crónicas específicas por recurso
  - Mostrar fecha/hora del colapso y turno
  - Mostrar ranking con la ciudad actual resaltada
  - Botones para volver al menú o nueva partida

Dependencias: Modal.js, Tablero.js, Ranking.js, Puntuacion.js
================================================ */

const ModalGameOver = (() => {

    /* =========================
       FRASES POR RECURSO NEGATIVO
    ========================= */
    const CRISIS = {
        agua: {
            kicker: "Sequía · Crisis hídrica",
            titular: "¡La ciudad perece de sed entre tuberías vacías!",
            cronica: (ciudad, alcalde) =>
                `Tras semanas de negligencia hídrica bajo la administración de <em>${alcalde}</em>,
                los pozos de <strong>${ciudad}</strong> se secaron por completo. Los ciudadanos,
                desesperados, salieron a las calles exigiendo agua potable. Las fuentes públicas
                fueron las últimas en apagarse, sellando el destino de la ciudad.`,
            cita: { texto: "«El agua no se mendiga, se gestiona. Y aquí no se gestionó nada.»", autor: "Dra. Marlene Fuentes, hidróloga" },
        },
        dinero: {
            kicker: "Economía · Bancarrota municipal",
            titular: "¡Quiebra total! Las arcas vacías hunden la ciudad",
            cronica: (ciudad, alcalde) =>
                `Las finanzas de <strong>${ciudad}</strong> colapsaron bajo el peso de deudas
                impagables acumuladas durante la gestión del alcalde <em>${alcalde}</em>. Los
                acreedores tomaron los edificios públicos, los empleados dejaron de percibir
                salarios y la infraestructura quedó abandonada sin presupuesto para mantenerla.`,
            cita: { texto: "«Gasté más de lo que tenía. Así de simple y así de catastrófico.»", autor: "Fuente anónima, ex-tesorero municipal" },
        },
        electricidad: {
            kicker: "Servicios · Apagón total",
            titular: "¡Oscuridad permanente! La red eléctrica colapsa sin retorno",
            cronica: (ciudad, alcalde) =>
                `Un apagón total e irreversible sumió a <strong>${ciudad}</strong> en la
                oscuridad. La red eléctrica, sobrecargada y sin mantenimiento durante la
                administración de <em>${alcalde}</em>, cedió de forma definitiva. Sin energía,
                hospitales, comercios y hogares quedaron paralizados en minutos.`,
            cita: { texto: "«Sin luz no hay ciudad. Solo hay ruinas con buenas intenciones.»", autor: "Ing. Camilo Ríos, ex-director de energía" },
        },
        alimento: {
            kicker: "Hambruna · Escasez crítica",
            titular: "¡Hambruna generalizada! Los graneros de la ciudad, vacíos",
            cronica: (ciudad, alcalde) =>
                `Los mercados de <strong>${ciudad}</strong> amanecieron vacíos por primera vez
                en su historia. La fallida política agrícola del alcalde <em>${alcalde}</em>
                dejó sin reservas a toda la población. Las filas para recibir raciones de
                emergencia se extendieron por kilómetros, sin que hubiera nada que repartir.`,
            cita: { texto: "«Sembramos promesas y cosechamos hambre.»", autor: "Colectivo de campesinos, comunicado oficial" },
        },
        felicidad: {
            kicker: "Social · Colapso del orden público",
            titular: "¡Revolución ciudadana! El pueblo depone al alcalde",
            cronica: (ciudad, alcalde) =>
                `La paciencia de los habitantes de <strong>${ciudad}</strong> llegó a su límite.
                Meses de promesas incumplidas por parte del alcalde <em>${alcalde}</em>
                desembocaron en protestas masivas que tomaron el palacio municipal. El orden
                social se desintegró y la ciudad quedó sin gobierno legítimo.`,
            cita: { texto: "«Un pueblo infeliz no obedece. Un pueblo infeliz actúa.»", autor: "Lema de las marchas ciudadanas" },
        },
    };

    /* Titular combinado cuando son varios recursos */
    const TITULARES_COMBO = [
        "¡Colapso total! Dinero, agua y fe se agotan al mismo tiempo",
        "¡La tormenta perfecta! Múltiples crisis hunden la ciudad sin remedio",
        "¡Caos generalizado! La ciudad cae bajo el peso de sus propias fallas",
        "¡Derrumbe histórico! Todo falló a la vez en una noche fatal",
    ];

    /* Icono fi por recurso — mismo set que recursos.js */
    const ICONOS = {
        agua:         "fi fi-br-raindrops",
        dinero:       "fi fi-br-coins",
        electricidad: "fi fi-br-bolt",
        alimento:     "fi fi-br-wheat",
        felicidad:    "fi fi-br-smile-beam",
    };

    const ETIQUETAS = {
        agua: "Agua", dinero: "Dinero",
        electricidad: "Electricidad", alimento: "Alimento", felicidad: "Felicidad",
    };

    /* =========================
       HELPERS
    ========================= */
    function _ciudad() {
        return Tablero?.Estado?.ciudad;
    }

    function _formatearFecha() {
        const now  = new Date();
        const dias  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
        const meses = ["enero","febrero","marzo","abril","mayo","junio","julio",
                       "agosto","septiembre","octubre","noviembre","diciembre"];
        const dia  = dias[now.getDay()];
        const num  = now.getDate();
        const mes  = meses[now.getMonth()];
        const anio = now.getFullYear();
        const hh   = String(now.getHours()).padStart(2, "0");
        const mm   = String(now.getMinutes()).padStart(2, "0");
        return {
            larga: `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${num} de ${mes} de ${anio}`,
            hora:  `${hh}:${mm}`,
        };
    }

    function _recursosNegativos() {
        const recursos = _ciudad()?.estadoRecursos || {};
        return Object.entries(recursos)
            .filter(([, v]) => v < 0)
            .map(([k]) => k);
    }

    /* Usa Ranking.obtener() que ya gestiona RankingStorage internamente */
    function _getRanking() {
        try {
            return (typeof Ranking !== "undefined") ? Ranking.obtener() : [];
        } catch { return []; }
    }

    /* =========================
       GENERADORES DE SECCIONES
    ========================= */

    function _genMasthead(fecha, turno) {
        return `
            <div class="go-topbar">
                <span>${fecha.larga}</span>
                <span>Turno ${turno} · ${fecha.hora} · Edición especial</span>
            </div>
            <div class="go-masthead">
                <div class="go-title">El Informante</div>
                <div class="go-subtitle">El periódico local · La voz del pueblo</div>
                <div class="go-edition-bar">
                    <span>Precio: La verdad</span>
                    <span>— ◆ —</span>
                    <span>Número de quiebra</span>
                </div>
            </div>
        `;
    }

    function _genCronica(recursosNeg, ciudad, alcalde) {
        const recursos = _ciudad()?.estadoRecursos || {};

        let kicker, titular, cronica, cita;

        if (recursosNeg.length === 1) {
            const c = CRISIS[recursosNeg[0]] || CRISIS.dinero;
            kicker  = c.kicker;
            titular = c.titular;
            cronica = c.cronica(ciudad, alcalde);
            cita    = c.cita;
        } else {
            kicker  = "Crisis total · Game Over";
            titular = TITULARES_COMBO[Math.min(recursosNeg.length - 2, TITULARES_COMBO.length - 1)];
            cronica = recursosNeg
                .filter(r => CRISIS[r])
                .map(r => CRISIS[r].cronica(ciudad, alcalde))
                .join(" ");
            cita = CRISIS[recursosNeg[0]]?.cita
                || { texto: "«La ciudad no se cae sola. Se cae a pedazos, turno a turno.»", autor: "Anónimo" };
        }

        const pillsHtml = recursosNeg.map(r => {
            const val     = Math.round(recursos[r] ?? 0);
            const icono   = ICONOS[r]    || "fi fi-br-info";
            const etiqueta = ETIQUETAS[r] || r;
            const fmt = r === "dinero" ? `$${val.toLocaleString()}` : `${val.toLocaleString()}`;
            return `
                <span class="go-resource-pill">
                    <i class="${icono}"></i> ${etiqueta}: ${fmt}
                </span>`;
        }).join("");

        return `
            <div class="go-col-left">
                <div class="go-kicker">${kicker}</div>
                <div class="go-headline">${titular}</div>
                <div class="go-resources">${pillsHtml}</div>
                <p class="go-body-text go-dropcap">${cronica}</p>
                <div class="go-divider">— ◆ —</div>
                <div class="go-quote">
                    ${cita.texto}
                    <br><em class="go-quote-autor">— ${cita.autor}</em>
                </div>
            </div>
        `;
    }

    function _genDatos(ciudad, alcalde, puntuacion, turno) {
        const c          = _ciudad();
        const poblacion  = c?.ciudadanos?.length ?? 0;
        const felicidad  = Math.round(c?.estadoRecursos?.felicidad ?? 0);
        const sinVivienda = c?.ciudadanos?.filter(x => !x.vivienda).length ?? 0;
        const sinEmpleo   = c?.ciudadanos?.filter(x => !x.empleo).length ?? 0;

        return `
            <div class="go-col-right">
                <div class="go-kicker">Economía · Balance final</div>
                <div class="go-headline go-headline--sm">Los números no mienten: balance del desastre</div>
                <p class="go-body-text">
                    Tras analizar el estado final de <strong>${ciudad}</strong>, los datos
                    revelan el alcance del desastre acumulado bajo la gestión de <em>${alcalde}</em>.
                </p>
                <ul class="go-stat-list">
                    <li>
                        <span class="go-stat-label">
                            <i class="fi fi-br-users"></i> Población
                        </span>
                        <span class="go-stat-val">${poblacion.toLocaleString()} hab.</span>
                    </li>
                    <li>
                        <span class="go-stat-label">
                            <i class="fi fi-br-smile-beam"></i> Felicidad final
                        </span>
                        <span class="go-stat-val">${felicidad} pts.</span>
                    </li>
                    <li>
                        <span class="go-stat-label">
                            <i class="fi fi-br-home"></i> Sin vivienda
                        </span>
                        <span class="go-stat-val">${sinVivienda.toLocaleString()}</span>
                    </li>
                    <li>
                        <span class="go-stat-label">
                            <i class="fi fi-br-briefcase"></i> Sin empleo
                        </span>
                        <span class="go-stat-val">${sinEmpleo.toLocaleString()}</span>
                    </li>
                </ul>
                <div class="go-score-box">
                    <div class="go-score-label">
                        <i class="fi fi-br-chart-histogram"></i> Puntuación final
                    </div>
                    <div class="go-score-val">${puntuacion.toLocaleString()}</div>
                    <div class="go-score-turno">al cierre del turno ${turno}</div>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------
       _genRanking
       Identifica la ciudad actual comparando cityName normalizado.
       Si hay varias entradas del mismo nombre toma la de mayor
       puntuación (la más reciente suele quedar así por el sort).
    ------------------------------------------------------- */
    function _genRanking(ciudadActual) {
        const ranking       = _getRanking();
        const nombreActual  = (ciudadActual?.nombre  || "").trim().toLowerCase();
        const alcaldeActual = (ciudadActual?.alcalde || "").trim().toLowerCase();

        if (!ranking.length) {
            return `
                <div class="go-ranking-section">
                    <div class="go-ranking-title">
                        <i class="fi fi-br-trophy"></i> Ranking de Ciudades
                    </div>
                    <p class="go-ranking-vacio">Aún no hay ciudades en el ranking.</p>
                </div>`;
        }

        const TOP  = 8;
        const top  = ranking.slice(0, TOP);

        /* Comparar por nombre Y alcalde, ambos normalizados.
           Si no hay match con alcalde, intentar solo por nombre (partidas
           donde el alcalde pudo haberse guardado con distinto formato). */
        const _esActual = e => {
            const n = (e.cityName || "").trim().toLowerCase();
            const a = (e.mayor    || "").trim().toLowerCase();
            return n === nombreActual && a === alcaldeActual;
        };

        const _esActualSoloNombre = e =>
            (e.cityName || "").trim().toLowerCase() === nombreActual;

        const estaEnTop = top.some(_esActual) || top.some(_esActualSoloNombre);
        let posicionFuera = -1;
        if (!estaEnTop) {
            let idx = ranking.findIndex(_esActual);
            if (idx === -1) idx = ranking.findIndex(_esActualSoloNombre);
            posicionFuera = idx >= 0 ? idx + 1 : -1;
        }

        const medalIcon = pos =>
            pos === 1 ? `<i class="fi fi-br-trophy go-medal go-medal--oro"></i>`
          : pos === 2 ? `<i class="fi fi-br-trophy go-medal go-medal--plata"></i>`
          : pos === 3 ? `<i class="fi fi-br-trophy go-medal go-medal--bronce"></i>`
          : `<span class="go-pos-num">#${pos}</span>`;

        const filasHtml = top.map((e, i) => {
            const pos      = i + 1;
            const esActual = _esActual(e) || _esActualSoloNombre(e);
            return `
                <tr ${esActual ? 'class="go-current-city"' : ""}>
                    <td>${medalIcon(pos)}</td>
                    <td>${esActual ? '<i class="fi fi-br-star"></i> ' : ""}${e.cityName}</td>
                    <td>${e.mayor || "—"}</td>
                    <td class="go-td-right go-td-bold">${e.score.toLocaleString()}</td>
                    <td class="go-td-right">${e.turns}</td>
                </tr>`;
        }).join("");

        /* posicionFuera > 0 (findIndex devuelve -1 si no encontró → -1+1=0, no mostramos) */
        const fueraPie = posicionFuera > 0 ? `
            <div class="go-ciudad-fuera">
                <i class="fi fi-br-info"></i>
                Tu ciudad: <strong>#${posicionFuera}</strong> — ${ciudadActual.nombre}
                (${ranking[posicionFuera - 1]?.score?.toLocaleString() ?? "—"} pts.)
            </div>` : "";

        return `
            <div class="go-ranking-section">
                <div class="go-ranking-title">
                    <i class="fi fi-br-trophy"></i> Ranking de Ciudades
                </div>
                <table class="go-ranking-table">
                    <thead>
                        <tr>
                            <th class="go-th-pos">Pos.</th>
                            <th>Ciudad</th>
                            <th>Alcalde</th>
                            <th class="go-td-right">Puntaje</th>
                            <th class="go-td-right">Turnos</th>
                        </tr>
                    </thead>
                    <tbody>${filasHtml}</tbody>
                </table>
                ${fueraPie}
            </div>
        `;
    }

    function _genFooter() {
        return `
            <div class="go-footer">
                <button class="go-btn" id="go-btn-menu">
                    <i class="fi fi-br-arrow-left"></i> Menú principal
                </button>
                <span class="go-footer-firma">— El Informante —</span>
                <button class="go-btn go-btn--primary" id="go-btn-nueva">
                    Nueva partida <i class="fi fi-br-arrow-right"></i>
                </button>
            </div>
        `;
    }

    /* =========================
       HTML COMPLETO
    ========================= */
    function _generarHTML(recursosNeg, ciudad, alcalde, puntuacion, turno) {
        const fecha = _formatearFecha();
        return `
            <div class="go-paper">
                ${_genMasthead(fecha, turno)}
                <div class="go-body">
                    <div class="go-cols">
                        ${_genCronica(recursosNeg, ciudad, alcalde)}
                        ${_genDatos(ciudad, alcalde, puntuacion, turno)}
                    </div>
                </div>
                ${_genRanking(_ciudad())}
                ${_genFooter()}
            </div>
        `;
    }

    /* =========================
       PÚBLICO: mostrar
    ========================= */
    function mostrar() {
        const c          = _ciudad();
        const ciudad     = c?.nombre    || "Ciudad";
        const alcalde    = c?.alcalde   || "el alcalde";
        const turno      = Tablero?.Estado?.turno || 0;
        const resultado  = Puntuacion.calcular(c);
        const puntuacion = resultado?.total ?? 0;
        const recursosNeg = _recursosNegativos();

        if (!recursosNeg.length) {
            console.warn("modalGameOver.js: mostrar() llamado sin recursos negativos.");
        }

        const html = _generarHTML(recursosNeg, ciudad, alcalde, puntuacion, turno);
        Modal.abrir(html);

        /* Bloquear cierre con Escape y click FUERA del paper — es pantalla final.
           Usamos capture:true solo para Escape. Para clicks comprobamos que el
           target sea el overlay mismo (fondo), no un elemento hijo (botones, etc.) */
        const overlay   = document.getElementById("modal-overlay");
        const contenido = document.getElementById("modal-contenido");

        if (overlay) {
            /* Bloquear click en el fondo (fuera del modal-contenido) */
            overlay.addEventListener("click", e => {
                if (!contenido || !contenido.contains(e.target)) {
                    e.stopImmediatePropagation();
                }
            }, true);

            /* Bloquear Escape */
            document.addEventListener("keydown", e => {
                if (e.key === "Escape") e.stopImmediatePropagation();
            }, true);

            /* Ocultar botón X del modal si existe */
            if (overlay) overlay.classList.add("modal-sin-cerrar");
        }

        /* Botones de navegación — rutas relativas al HTML en presentacion/vistas/ */
        document.getElementById("go-btn-menu")?.addEventListener("click", () => {
            window.location.href = "index.html";
        });

        document.getElementById("go-btn-nueva")?.addEventListener("click", () => {
            try { ControladorStorage.limpiarPartida?.(); } catch {}
            window.location.href = "formulario.html";
        });
    }

    return { mostrar };

})();

window.ModalGameOver = ModalGameOver;