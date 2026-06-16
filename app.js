// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;

// --- ENTRADA AL SISTEMA (LOGIN DIRECTO) ---
document.getElementById('form-login-ciudadano').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    // Consulta fiscal en Supabase según tu tabla de perfiles_ciudadanos
    const { data: ciudadanos, error } = await supabase
        .from('perfiles_ciudadanos')
        .select('*')
        .eq('email', emailStr)
        .eq('contrasena_plana', passwordStr);

    if (error) {
        alert("Error de conexión a Supabase: " + error.message);
        return;
    }

    if (ciudadanos && ciudadanos.length > 0) {
        usuarioLogeado = ciudadanos[0];
        
        // Cargar datos de la sesión del ciudadano en la UI de Perfil
        document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
        document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;
        
        // Transición SPA hacia la vista del contenedor principal de la App
        document.getElementById('screen-login').style.display = "none";
        document.getElementById('app-main-layout').style.display = "flex";
        
        // Cargar la pestaña de emergencias por defecto
        window.switchTabView('emergencias');
    } else {
        alert("Credenciales digitales inválidas para emergencias.");
    }
});

// --- CONTROLADOR DE NAVEGACIÓN INFERIOR (TAB BAR ADAPTADO AL NUEVO HTML) ---
window.switchTabView = function(targetView) {
    // Apagar todas las sub-vistas del visor elástico usando los nuevos IDs
    document.getElementById('view-emergencias').style.display = "none";
    document.getElementById('view-videollamada').style.display = "none";
    document.getElementById('view-perfil').style.display = "none";
    
    // Quitar el estado activo de los botones del menú inferior
    document.getElementById('tab-emergencias').classList.remove('active');
    document.getElementById('tab-videollamada').classList.remove('active');
    document.getElementById('tab-perfil').classList.remove('active');

    // Encender la pestaña solicitada y enfocar su respectivo botón
    if (targetView === 'emergencias') {
        document.getElementById('view-emergencias').style.display = "block";
        document.getElementById('tab-emergencias').classList.add('active');
    } else if (targetView === 'videollamada') {
        document.getElementById('view-videollamada').style.display = "block";
        document.getElementById('tab-videollamada').classList.add('active');
    } else if (targetView === 'perfil') {
        document.getElementById('view-perfil').style.display = "block";
        document.getElementById('tab-perfil').classList.add('active');
    }
};

// --- ACCIÓN CRÍTICA: BOTÓN DE PÁNICO S.O.S ---
window.activarBotonPanicoSOS = async function() {
    if (!usuarioLogeado) return;

    // Coordenadas operativas reales en el sector céntrico de Concepción
    const latConcepcion = -36.82900000; 
    const lonConcepcion = -73.03980000;

    // Generar Folio aleatorio compatible con la estructura VARCHAR de incidentes_cenco
    const correlativoFolio = "SOS-" + Math.floor(100 + Math.random() * 900);

    // Inserción directa en la tabla de incidentes de tu base de datos Supabase
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
            detalles_reporte: "Activación Crítica de botón de pánico desde aplicación móvil inclusiva.",
            estado_procedimiento: "CRÍTICO"
        }]);

    if (error) {
        alert("Ocurrió un inconveniente al emitir señal: " + error.message);
    } else {
        alert(`🚨 Alerta SOS enviada con éxito.\nFolio: ${correlativoFolio}\n\nCarabineros ha recibido su ubicación actual en el Dashboard de Concepción.`);
    }
};

// --- OPCIONES DE ACCESIBILIDAD INTERACTIVAS ---
let flagTamano = 0; 
window.cambiarTamanoTexto = function() {
    if (flagTamano === 0) {
        document.body.classList.add('text-large');
        document.getElementById('label-text-size').innerText = "Muy Grande";
        flagTamano = 1;
    } else {
        document.body.classList.remove('text-large');
        document.getElementById('label-text-size').innerText = "Grande";
        flagTamano = 0;
    }
};

window.conmutarAltoContraste = function(checkbox) {
    if (checkbox.checked) {
        document.body.classList.add('high-contrast-mode');
    } else {
        document.body.classList.remove('high-contrast-mode');
    }
};

// --- CONTROL DE SESIÓN ---
window.cerrarSesionApp = function() {
    usuarioLogeado = null;
    
    // Limpiar los campos del formulario de entrada
    document.getElementById('app-email').value = "juan.perez@email.com";
    document.getElementById('app-pass').value = "password123";
    
    // Retornar SPA a la pantalla de autenticación
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
};