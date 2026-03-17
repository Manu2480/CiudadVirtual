/* ================================================
PUNTUACION.JS
Cálculo y desglose de la puntuación de la ciudad.

Responsabilidades:
  - Calcular score según la fórmula definida
  - Calcular bonificaciones y penalizaciones
  - Exponer obtenerDesglose() para el modal de stats
  - Guardar la puntuación en cada turno

Dependencias: tablero.js (Tablero.Estado.ciudad)
================================================ */

function calcular(ciudad) {
    if (!ciudad) return 0;

    const r          = ciudad.estadoRecursos;
    const ciudadanos = ciudad.ciudadanos || [];
    const edificios  = ciudad.terreno?.edificios || [];

    const poblacion    = ciudadanos.length;
    const felicidad    = r.felicidad    ?? 0;
    const dinero       = r.dinero       ?? 0;
    const electricidad = r.electricidad ?? 0;
    const agua         = r.agua         ?? 0;

    /* Las vías no cuentan como edificios en la puntuación */
    const numEdificios = edificios.filter(e =>
        !String(e.id || "").toLowerCase().startsWith("via")
    ).length;

    /* ── Puntos base ── */
    const ptsPoblacion    = poblacion * 10;
    const ptsFelicidad    = felicidad * 5;
    const ptsDinero       = dinero / 100;
    const ptsEdificios    = numEdificios * 50;
    const ptsElectricidad = electricidad * 2;
    const ptsAgua         = agua * 2;

    /* ── Bonificaciones ── */
    const desempleados   = ciudadanos.filter(c => !c.empleo).length;
    const todosEmpleados = poblacion > 0 && desempleados === 0;

    const bonTodosEmpleados  = todosEmpleados       ? 500  : 0;
    const bonFelicidadAlta   = felicidad > 80        ? 300  : 0;
    const bonRecursosPositivos = (dinero >= 0 && electricidad >= 0 && agua >= 0) ? 200 : 0;
    const bonGranCiudad      = poblacion > 1000      ? 1000 : 0;

    const totalBonos = bonTodosEmpleados + bonFelicidadAlta + bonRecursosPositivos + bonGranCiudad;

    /* ── Penalizaciones ── */
    const penDineroNeg       = dinero        < 0 ? -500 : 0;
    const penElectricidadNeg = electricidad  < 0 ? -300 : 0;
    const penAguaNeg         = agua          < 0 ? -300 : 0;
    const penFelicidadBaja   = felicidad     < 40 ? -400 : 0;
    const penDesempleados    = desempleados * -10;

    const totalPenas = penDineroNeg + penElectricidadNeg + penAguaNeg + penFelicidadBaja + penDesempleados;

    /* ── Total ── */
    const base  = ptsPoblacion + ptsFelicidad + ptsDinero + ptsEdificios + ptsElectricidad + ptsAgua;
    const total = Math.round(base + totalBonos + totalPenas);

    return {
        total,
        desglose: {
            ptsPoblacion:    Math.round(ptsPoblacion),
            ptsFelicidad:    Math.round(ptsFelicidad),
            ptsDinero:       Math.round(ptsDinero),
            ptsEdificios:    Math.round(ptsEdificios),
            ptsElectricidad: Math.round(ptsElectricidad),
            ptsAgua:         Math.round(ptsAgua),
        },
        bonificaciones: {
            todosEmpleados:   bonTodosEmpleados,
            felicidadAlta:    bonFelicidadAlta,
            recursosPositivos:bonRecursosPositivos,
            granCiudad:       bonGranCiudad,
            total:            totalBonos,
        },
        penalizaciones: {
            dineroNeg:        penDineroNeg,
            electricidadNeg:  penElectricidadNeg,
            aguaNeg:          penAguaNeg,
            felicidadBaja:    penFelicidadBaja,
            desempleados:     penDesempleados,
            total:            totalPenas,
        },
        meta: { poblacion, felicidad, dinero, electricidad, agua, numEdificios, desempleados },
    };
}

/* Guarda la puntuación del turno en localStorage */
function guardarEnRanking(ciudad, score) {
    if (!ciudad) return;
    try {
        const ranking = JSON.parse(localStorage.getItem("ranking") || "[]");
        ranking.push({
            ciudad:    ciudad.nombre,
            alcalde:   ciudad.alcalde,
            score,
            fecha:     new Date().toISOString(),
        });
        /* Mantiene solo los últimos 50 registros */
        if (ranking.length > 50) ranking.splice(0, ranking.length - 50);
        localStorage.setItem("ranking", JSON.stringify(ranking));
    } catch (e) {
        console.warn("puntuacion.js: error al guardar ranking", e);
    }
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.Puntuacion = { calcular, guardarEnRanking };