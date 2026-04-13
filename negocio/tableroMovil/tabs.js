/* ================================================
TABS MÓVIL
Navegación inferior por tabs.

Responsabilidad:
  - Registrar clicks en los botones .tab
  - Abrir y cerrar paneles deslizables sobre el mapa
  - Mantener el estado de tab/panel activo
  - Coordinar el modo del tablero según la tab activa:
      · Tab Mapa      → modo normal, joystick visible
      · Tab Construir → modo construccion, sin panel (el
                        catálogo se abre al tocar una celda)
      · Otras tabs    → modo normal, panel deslizable

Dependencias: tablero.js (Tablero.activarModo, Tablero.cancelarModo)
================================================ */

function _abrirPanel(panel) {
    if (!panel) return;
    panel.classList.add("abierto");
}

function _cerrarPanel(panel) {
    if (!panel) return;
    panel.classList.remove("abierto");
}

function inicializar() {
    const tabs = document.getElementById("tabs-movil");
    if (!tabs) return;

    let panelActivo = null;
    let tabActivo   = null;

    const botones = Array.from(tabs.querySelectorAll(".tab"));

    botones.forEach(btn => {
        btn.type = "button";
        btn.addEventListener("click", () => {
            const idPanel = btn.dataset.panel;

            /* ── Tab CONSTRUIR ── */
            if (idPanel === "menu-construccion") {
                const catalogoAbierto = document.getElementById("menu-construccion")
                    ?.classList.contains("abierto");
                const yaEnConstruir = tabActivo === btn;

                if (catalogoAbierto) {
                    window.MenuConstruccion?.cerrarCatalogo();
                    return;
                }

                if (yaEnConstruir) {
                    window.Notificaciones?.mostrar(
                        "Ya estás en modo construcción. Toca una celda para construir.",
                        "aviso"
                    );
                    return;
                }

                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.PanelNoticias?.ocultarCarrusel();
                window.RutaMovil?.limpiarTodo();
                window.Tablero?.activarModo("construccion");
                return;
            }

            /* ── Tab MAPA ── */
            if (idPanel === "area-mapa") {
                if (tabActivo === btn) {
                    window.Notificaciones?.mostrar(
                        "Ya estás en el mapa. Usa el joystick para desplazarte.",
                        "aviso"
                    );
                    return;
                }

                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.PanelNoticias?.ocultarCarrusel();
                window.RutaMovil?.limpiarTodo();
                window.Tablero?.cancelarModo();
                return;
            }

            /* ── Tab NOTICIAS ── */
            if (idPanel === "noticias") {
                if (tabActivo === btn) {
                    btn.classList.remove("tab--activo");
                    tabActivo = null;
                    window.PanelNoticias?.ocultarCarrusel();
                    return;
                }
                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.Tablero?.cancelarModo();
                window.PanelNoticias?.mostrarCarrusel();
                return;
            }

            /* ── Tab RUTA ── */
            if (idPanel === "ruta") {
                const yaActivo = window.RutaMovil?.estaActivo();

                if (yaActivo) {
                    /* Reiniciar: limpia todo y vuelve a activar */
                    window.RutaMovil?.limpiarTodo();
                    window.RutaMovil?.activar();
                    botones.forEach(t => t.classList.remove("tab--activo"));
                    btn.classList.add("tab--activo");
                    tabActivo = btn;
                    return;
                }

                /* Primera activación */
                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.PanelNoticias?.ocultarCarrusel();
                window.RutaMovil?.activar();
                return;
            }

            /* ── Tab RECURSOS ── */
            if (idPanel === "panel-recursos") {
                if (tabActivo === btn) {
                    btn.classList.remove("tab--activo");
                    tabActivo = null;
                    window.PanelRecursos?.cerrarPanel();
                    return;
                }
                botones.forEach(t => t.classList.remove("tab--activo"));
                btn.classList.add("tab--activo");
                tabActivo = btn;
                _cerrarPanel(panelActivo);
                panelActivo = null;
                window.PanelNoticias?.ocultarCarrusel();
                window.Tablero?.cancelarModo();
                window.PanelRecursos?.abrirPanelRecursos();
                return;
            }

            /* ── Resto de tabs ── */
            if (tabActivo === btn) {
                btn.classList.remove("tab--activo");
                _cerrarPanel(panelActivo);
                panelActivo = null;
                tabActivo   = null;
                return;
            }

            botones.forEach(t => t.classList.remove("tab--activo"));
            btn.classList.add("tab--activo");
            tabActivo = btn;

            const panel = document.getElementById(idPanel);
            if (!panel) {
                console.warn("TabsMovil: no se encontró panel", idPanel);
                return;
            }

            _cerrarPanel(panelActivo);
            panelActivo = panel;
            _abrirPanel(panel);
            window.PanelNoticias.ocultarCarrusel();
            window.Tablero?.cancelarModo();
        });
    });
}

/* Abre el catálogo de edificios sobre el mapa.
   Llamado desde mapa.js cuando el usuario toca una celda
   vacía en modo construccion y aún no hay edificio seleccionado. */
function abrirCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;
    _abrirPanel(menu);
}

/* Cierra el catálogo. Llamado desde menuConstruccion.js
   tras seleccionar un edificio. */
function cerrarCatalogo() {
    const menu = document.getElementById("menu-construccion");
    if (!menu) return;
    _cerrarPanel(menu);
}


/* ================================================
EXPOSICIÓN GLOBAL
================================================ */
window.TabsMovil = { inicializar, abrirCatalogo, cerrarCatalogo };