const ApiRuta = (() => {
    const direccion = "http://127.0.0.1:5000/api/calculate-route"

    function calcularRuta({ mapa, inicio, fin }) {
        return fetch(direccion, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                map: mapa,
                start: inicio,
                end: fin
            })
        })
        .then(res => res.json().then(data => ({
            ok: res.ok,
            data
        })))
        .catch(err => {
            return {
                ok: false,
                networkError: true,
                error: err.message
            };
        });
    }

    return {
        calcularRuta
    };

})();