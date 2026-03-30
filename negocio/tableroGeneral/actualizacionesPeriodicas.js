(function() {
    const INTERVALOS_MS = Object.freeze({
        INTERVALO_NOTICIAS: 30 * 60 * 1000,
        REINTENTO_CORTO: 300,
        INTERVALO_CLIMA: 30 * 60 * 1000,
    });

    const _trabajos = {};

    function iniciarTrabajoPeriodico({ id, accion, intervaloMs, ejecutarAhora = true }) {
        if (!id || typeof accion !== "function" || !Number.isFinite(intervaloMs)) {
            return null;
        }

        if (_trabajos[id]) {
            return _trabajos[id];
        }

        if (ejecutarAhora) {
            accion();
        }

        const intervalo = setInterval(accion, intervaloMs);
        _trabajos[id] = intervalo;
        return intervalo;
    }

    function detenerTrabajoPeriodico(id) {
        if (!_trabajos[id]) {
            return;
        }
        clearInterval(_trabajos[id]);
        delete _trabajos[id];
    }

    function esperarConReintentos({
        condicion,
        alCumplir,
        maxIntentos = 20,
        delayMs = INTERVALOS_MS.REINTENTO_CORTO,
    }) {
        if (typeof condicion !== "function" || typeof alCumplir !== "function") {
            return;
        }

        let intentos = 0;

        function intentar() {
            if (condicion()) {
                alCumplir();
                return;
            }

            if (intentos >= maxIntentos) {
                return;
            }

            intentos += 1;
            setTimeout(intentar, delayMs);
        }

        intentar();
    }

    window.ActualizacionesPeriodicas = {
        INTERVALOS_MS,
        iniciarTrabajoPeriodico,
        detenerTrabajoPeriodico,
        esperarConReintentos,
    };
})();