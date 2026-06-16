// --- CONFIGURACIÓN DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO INTERNO ---
let usuarioLogeado = null;

// --- CONTROLADOR DE CLICS: LOGEARSE ---
document.getElementById('btn-ingresar-login').addEventListener('click', async () => {
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    if (!emailStr || !passwordStr) {
        alert("Por favor, ingresa tu correo y contraseña de prueba.");
        return;
    }

    try {
        // Consulta asíncrona directa sin burbujeo de formulario
        const { data: ciudadanos, error } = await supabase
            .from('perfiles_ciudadanos')
            .select('*')
            .eq('email', emailStr)
            .eq('contrasena_plana', passwordStr);

        if (error) {
            alert("Error en conexión: " + error.message);
            return;
        }

        if (ciudadanos && ciudadanos.length > 0) {
            usuarioLogeado = ciudadanos[0];

            // Inyectar datos de la fila de Supabase en la UI
            document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
            document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;

            // Cambiar de vistas ocultando los bloques principales
            document.getElementById('screen-login').style.display = "none";
            document.getElementById('app-main-layout').style.display = "flex";

            // Levantar la sub-vista por defecto
            activarSubVista('emergencias');
        } else {
            alert("Credenciales inválidas. Comprueba tus datos de prueba.");
        }
    } catch (err) {
        alert("Error crítico del sistema: " + err.message);
    }
});

// --- CONTROLADOR DE CLICS: EMISIÓN DEL S.O.S ---
document.getElementById('btn-panico-sos').addEventListener('click', async () => {
    if (!usuarioLogeado) return;

    const latConcepcion = -36.82900000;
    const lonConcepcion = -73.03980000;
    const correlativoFolio = "SOS-" + Math.floor(100 + Math.random() * 900);

    try {
        const { error } = await supabase
            .from('incidentes_cenco')
            .insert([{
                id: correlativoFolio,
                usuario_id: usuarioLogeado.id,
                nombre_usuario_anonimo: usuarioLogeado.nombre_completo,
                tipo_incidente: "Botón SOS",
                categoria_tag: "SOS",
                ubicacion_texto: "Sector Central, Concepción",
                latitud: latConcepcion,
                longitud: lonConcepcion,
                detalles_reporte: "Activación Crítica de auxilio desde dispositivo móvil.",
                estado_procedimiento: "CRÍTICO"
            }]);

        if (error) {
            alert("No se pudo emitir la señal: " + error.message);
        } else {
            alert(`🚨 S.O.S ENVIADO\nFolio: ${correlativoFolio}\n\nCarabineros recibió tu ubicación en Concepción.`);
        }
    } catch (err) {
        alert("Error de red: " + err.message);
    }
});

// --- CONTROLADOR DE CLICS: SISTEMA DE PESTAÑAS (TAB BAR) ---
function activarSubVista(viewName) {
    // Esconder todas las sub-vistas
    document.getElementById('view-emergencias').style.display = "none";
    document.getElementById('view-videollamada').style.display = "none";
    document.getElementById('view-perfil').style.display = "none";

    // Quitar iluminación activa a los botones del TabBar
    document.getElementById('tab-emergencias').classList.remove('active');
    document.getElementById('tab-videollamada').classList.remove('active');
    document.getElementById('tab-perfil').classList.remove('active');

    // Encender solo el seleccionado
    if (viewName === 'emergencias') {
        document.getElementById('view-emergencias').style.display = "block";
        document.getElementById('tab-emergencias').classList.add('active');
    } else if (viewName === 'videollamada') {
        document.getElementById('view-videollamada').style.display = "block";
        document.getElementById('tab-videollamada').classList.add('active');
    } else if (viewName === 'perfil') {
        document.getElementById('view-perfil').style.display = "block";
        document.getElementById('tab-perfil').classList.add('active');
    }
}

// Asignar los eventos de las pestañas directamente
document.getElementById('tab-emergencias').addEventListener('click', () => activarSubVista('emergencias'));
document.getElementById('tab-videollamada').addEventListener('click', () => activarSubVista('videollamada'));
document.getElementById('tab-perfil').addEventListener('click', () => activarSubVista('perfil'));

// --- CONTROLADOR DE CLICS: CERRAR SESIÓN ---
document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    usuarioLogeado = null;
    document.getElementById('app-email').value = "";
    document.getElementById('app-pass').value = "";
    
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
});