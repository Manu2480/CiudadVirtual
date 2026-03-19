/* ================================================
RANKINGSTORAGE.JS
Objeto utilitario para persistir y recuperar los datos
del ranking de ciudades en el localStorage del navegador.

Clave usada: "ranking"
Estructura almacenada: array JSON con las partidas
ordenadas por puntuación (descendente).

Estructura de cada entrada:
{
  "cityName": "Nueva Ciudad",
  "mayor": "Juan Pérez",
  "score": 15420,
  "population": 1250,
  "happiness": 78,
  "turns": 145,
  "date": "2025-01-27T10:30:00Z"
}

Uso:
  RankingStorage.guardar(rankingArray);  // guarda el array completo
  const datos = RankingStorage.cargar(); // recupera (array o [])
  RankingStorage.agregarEntrada(entrada); // agrega una entrada y ordena
  RankingStorage.limpiar();              // elimina todo el ranking
  RankingStorage.obtenerTop(n);          // obtiene Top N ciudades
  RankingStorage.obtenerPosicion(nombreCiudad); // obtiene posición de una ciudad
================================================ */

const RankingStorage = {

    /* Clave asociada al localStorage del navegador */
    clave: "ranking",

    /* Guarda el array completo del ranking en localStorage */
    guardar(ranking) {
        try {
            const validado = Array.isArray(ranking) ? ranking : [];
            localStorage.setItem(this.clave, JSON.stringify(validado));
            console.log("RankingStorage: ranking guardado exitosamente");
        } catch (e) {
            console.error("RankingStorage: error al guardar ranking", e);
        }
    },

    /* Recupera el ranking del localStorage. Devuelve array vacío si no hay datos. */
    cargar() {
        try {
            const datos = localStorage.getItem(this.clave);
            if (!datos) return [];
            const ranking = JSON.parse(datos);
            return Array.isArray(ranking) ? ranking : [];
        } catch (e) {
            console.error("RankingStorage: error al cargar ranking", e);
            return [];
        }
    },

    /* Agrega una nueva entrada al ranking y ordena por puntuación */
    agregarEntrada(entrada) {
        try {
            if (!entrada || typeof entrada !== "object") {
                console.error("RankingStorage: entrada inválida");
                return false;
            }

            /* Validar estructura mínima de la entrada */
            if (!entrada.cityName || entrada.score === undefined) {
                console.error("RankingStorage: entrada sin campos requeridos", entrada);
                return false;
            }

            const ranking = this.cargar();
            ranking.push(entrada);

            /* Ordenar por puntuación descendente */
            ranking.sort((a, b) => b.score - a.score);

            /* Mantener máximo 100 registros */
            if (ranking.length > 100) {
                ranking.splice(100);
            }

            this.guardar(ranking);
            console.log("RankingStorage: entrada agregada y ranking ordenado");
            return true;
        } catch (e) {
            console.error("RankingStorage: error al agregar entrada", e);
            return false;
        }
    },

    /* Elimina todo el ranking del localStorage */
    limpiar() {
        try {
            localStorage.removeItem(this.clave);
            console.log("RankingStorage: ranking limpiado");
        } catch (e) {
            console.error("RankingStorage: error al limpiar ranking", e);
        }
    },

    /* Obtiene las top N ciudades del ranking */
    obtenerTop(n = 10) {
        try {
            const ranking = this.cargar();
            return ranking.slice(0, n);
        } catch (e) {
            console.error("RankingStorage: error al obtener top", e);
            return [];
        }
    },

    /* Obtiene la posición (1-indexed) de una ciudad por nombre */
    obtenerPosicion(nombreCiudad) {
        try {
            const ranking = this.cargar();
            const indice = ranking.findIndex(entrada => entrada.cityName === nombreCiudad);
            return indice >= 0 ? indice + 1 : -1; /* Retorna -1 si no encuentra */
        } catch (e) {
            console.error("RankingStorage: error al obtener posición", e);
            return -1;
        }
    },

    /* Obtiene una entrada específica del ranking por nombre de ciudad */
    obtenerEntrada(nombreCiudad) {
        try {
            const ranking = this.cargar();
            return ranking.find(entrada => entrada.cityName === nombreCiudad) || null;
        } catch (e) {
            console.error("RankingStorage: error al obtener entrada", e);
            return null;
        }
    },

    /* Obtiene el total de ciudades en el ranking */
    obtenerTotalEntradas() {
        try {
            const ranking = this.cargar();
            return ranking.length;
        } catch (e) {
            console.error("RankingStorage: error al obtener total", e);
            return 0;
        }
    },

    /* Obtiene la puntuación máxima en el ranking */
    obtenerMaximaPuntuacion() {
        try {
            const ranking = this.cargar();
            if (ranking.length === 0) return 0;
            return ranking[0].score; /* primer elemento es el máximo (ordenado) */
        } catch (e) {
            console.error("RankingStorage: error al obtener máxima puntuación", e);
            return 0;
        }
    },

    /* Obtiene la puntuación mínima en el ranking */
    obtenerMinimaPuntuacion() {
        try {
            const ranking = this.cargar();
            if (ranking.length === 0) return 0;
            return ranking[ranking.length - 1].score; /* último elemento es el mínimo */
        } catch (e) {
            console.error("RankingStorage: error al obtener mínima puntuación", e);
            return 0;
        }
    },

    /* Filtra ranking por puntuación mínima */
    obtenerPorPuntuacionMinima(puntuacionMinima) {
        try {
            const ranking = this.cargar();
            return ranking.filter(entrada => entrada.score >= puntuacionMinima);
        } catch (e) {
            console.error("RankingStorage: error al filtrar por puntuación", e);
            return [];
        }
    },

    /* Exporta el ranking completo como JSON string */
    exportarJSON() {
        try {
            const ranking = this.cargar();
            return JSON.stringify(ranking, null, 2);
        } catch (e) {
            console.error("RankingStorage: error al exportar JSON", e);
            return "[]";
        }
    },

    /* Importa ranking desde JSON string */
    importarJSON(jsonString) {
        try {
            const ranking = JSON.parse(jsonString);
            if (!Array.isArray(ranking)) {
                console.error("RankingStorage: JSON no contiene un array");
                return false;
            }
            this.guardar(ranking);
            console.log("RankingStorage: ranking importado exitosamente");
            return true;
        } catch (e) {
            console.error("RankingStorage: error al importar JSON", e);
            return false;
        }
    },

    /* Actualiza la ciudad actual en progreso (sesión en vivo) */
    actualizarCiudadActual(ciudad, score, turnos) {
        try {
            if (!ciudad) return false;

            /* Calcular promedio de felicidad */
            const ciudadanos = ciudad.ciudadanos || [];
            const felicidadPromedio = ciudadanos.length > 0 
                ? Math.round(ciudadanos.reduce((sum, c) => sum + (c.felicidad ?? 0), 0) / ciudadanos.length)
                : 0;

            const entrada = {
                cityName:   ciudad.nombre,
                mayor:      ciudad.alcalde,
                score:      score,
                population: ciudadanos.length,
                happiness:  felicidadPromedio,
                turns:      turnos || 0,
                date:       new Date().toISOString(),
                estaEnProgreso: true, /* Bandera para indicar que está en progreso */
            };

            localStorage.setItem("ciudadActual", JSON.stringify(entrada));
            console.log("RankingStorage: ciudad actual actualizada en tiempo real");
            return true;
        } catch (e) {
            console.error("RankingStorage: error al actualizar ciudad actual", e);
            return false;
        }
    },

    /* Obtiene la ciudad actualmente en progreso */
    obtenerCiudadActual() {
        try {
            const datos = localStorage.getItem("ciudadActual");
            if (!datos) return null;
            return JSON.parse(datos);
        } catch (e) {
            console.error("RankingStorage: error al obtener ciudad actual", e);
            return null;
        }
    },

    /* Limpia la ciudad actual (cuando termina la partida) */
    limpiarCiudadActual() {
        try {
            localStorage.removeItem("ciudadActual");
            console.log("RankingStorage: ciudad actual limpiada");
        } catch (e) {
            console.error("RankingStorage: error al limpiar ciudad actual", e);
        }
    },

    /* Obtiene estadísticas agregadas del ranking completo */
    obtenerEstadisticas() {
        try {
            const ranking = this.cargar();
            const total = ranking.length;

            if (total === 0) {
                return {
                    total: 0,
                    maxPuntuacion: 0,
                    minPuntuacion: 0,
                    promedioPuntuacion: 0,
                    promedioPoblacion: 0,
                    promedioFelicidad: 0,
                    promedioTurnos: 0,
                };
            }

            const sumaPuntuacion = ranking.reduce((sum, e) => sum + (e.score || 0), 0);
            const sumaPoblacion = ranking.reduce((sum, e) => sum + (e.population || 0), 0);
            const sumaFelicidad = ranking.reduce((sum, e) => sum + (e.happiness || 0), 0);
            const sumaTurnos = ranking.reduce((sum, e) => sum + (e.turns || 0), 0);

            return {
                total,
                maxPuntuacion: ranking[0].score,
                minPuntuacion: ranking[total - 1].score,
                promedioPuntuacion: Math.round(sumaPuntuacion / total),
                promedioPoblacion: Math.round(sumaPoblacion / total),
                promedioFelicidad: Math.round(sumaFelicidad / total),
                promedioTurnos: Math.round(sumaTurnos / total),
            };
        } catch (e) {
            console.error("RankingStorage: error al obtener estadísticas", e);
            return null;
        }
    },
};
