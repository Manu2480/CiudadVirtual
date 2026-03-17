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
    const ciudad = window.Tablero?.Estado?.ciudad;
    if (!ciudad?.latitud || !ciudad?.longitud) {
        setTimeout(inicializar, 300);
        return;
    }
    _consultarClima(ciudad);
    /* Actualiza cada 30 minutos */
    setInterval(() => _consultarClima(ciudad), 30 * 60 * 1000);
}

function _consultarClima(ciudad) {
    const api = new ApiClima();
    api.getDatosClima(ciudad.longitud, ciudad.latitud)
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

    chip.title   = `${datos.condicion} · Toca para más info`;
    chip.style.cursor = "pointer";
    chip.innerHTML = `
        <i class="fi ${_iconoClima(datos.condicion)} clima-compacto__icono"></i>
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
        overlay.style.cssText = `
            position:fixed; inset:0;
            background:rgba(0,0,0,0.45);
            z-index:1299; display:none;
        `;
        overlay.addEventListener("click", _cerrarModalClima);
        document.body.appendChild(overlay);
    }

    /* Panel */
    let panel = document.getElementById("clima-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "clima-panel";
        panel.style.cssText = `
            position:fixed; top:50%; left:50%;
            transform:translate(-50%,-50%);
            width:85vw; max-width:340px;
            background:#fff; border-radius:16px;
            box-shadow:0 8px 32px rgba(0,0,0,0.25);
            z-index:1300; padding:24px;
            display:none; flex-direction:column; gap:12px;
        `;
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
            <i class="fi ${_iconoClima(d.condicion)}" style="font-size:36px;color:var(--color-primario)"></i>
            <div>
                <div style="font-size:32px;font-weight:700;color:var(--color-texto);">
                    ${Math.round(d.temperatura)}°C
                </div>
                <div style="font-size:13px;color:var(--color-texto-s);text-transform:capitalize;">
                    ${d.condicion}
                </div>
            </div>
        </div>
        <hr style="border:none;border-top:1px solid var(--color-borde);">
        <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;font-size:14px;">
                <i class="fi fi-br-raindrops" style="color:var(--color-primario);width:20px;text-align:center;"></i>
                <span style="flex:1;color:var(--color-texto-s);">Humedad</span>
                <strong>${d.humedad}%</strong>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:14px;">
                <i class="fi fi-br-wind" style="color:var(--color-primario);width:20px;text-align:center;"></i>
                <span style="flex:1;color:var(--color-texto-s);">Viento</span>
                <strong>${Math.round((d.viento?.velocidad || 0) * 3.6)} km/h</strong>
            </div>
            ${d.viento?.rafaga ? `
            <div style="display:flex;align-items:center;gap:10px;font-size:14px;">
                <i class="fi fi-br-thunderstorm" style="color:var(--color-primario);width:20px;text-align:center;"></i>
                <span style="flex:1;color:var(--color-texto-s);">Ráfagas</span>
                <strong>${Math.round(d.viento.rafaga * 3.6)} km/h</strong>
            </div>` : ""}
        </div>
        <button onclick="document.getElementById('clima-overlay').style.display='none';document.getElementById('clima-panel').style.display='none';"
            style="margin-top:8px;padding:10px;background:var(--color-primario);color:#fff;
                   border:none;border-radius:8px;font-weight:600;cursor:pointer;">
            Cerrar
        </button>
    `;

    overlay.style.display = "block";
    panel.style.display   = "flex";
}

function _cerrarModalClima() {
    document.getElementById("clima-overlay").style.display = "none";
    document.getElementById("clima-panel").style.display   = "none";
}

function _iconoClima(condicion = "") {
    const c = condicion.toLowerCase();
    if (c.includes("lluvia") || c.includes("llovizna")) return "fi-br-raindrops";
    if (c.includes("tormenta"))                          return "fi-br-thunderstorm";
    if (c.includes("nieve"))                             return "fi-br-snowflake";
    if (c.includes("niebla") || c.includes("neblina"))  return "fi-br-cloud-fog";
    if (c.includes("nube") || c.includes("nublado"))    return "fi-br-clouds";
    if (c.includes("parcialmente"))                      return "fi-br-cloud-sun";
    return "fi-br-sun";
}

window.ClimaMovil = { inicializar };