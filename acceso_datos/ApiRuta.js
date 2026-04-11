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
        .then(res => {
            return res.json().then(data => {
                if (!res.ok) {
                    const error = new Error(data?.error || `Error HTTP: ${res.status}`);
                    error.responseData = data;
                    throw error;
                }
                return data;
            });
        });
    }

    return {
        calcularRuta
    };

})();