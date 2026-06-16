console.log("=== ARCHIVO APP.JS CARGADO EN EL NAVEGADOR ===");

// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

// Forzar la creación del cliente global
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;

// --- PROCESAR INICIO DE SESIÓN DIRECTO AL HOME ---
window.procesarLoginDirectoSOS = async function(e) {
    console.log("-> Evento onsubmit capturado exitosamente.");
    
    // 1. Bloqueo total de recarga nativa
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const emailInput = document.getElementById('app-email');
    const passInput = document.getElementById('app-pass');
    
    // Alerta de control 1
    alert("🔍 Alerta 1: El botón funciona. Capturando inputs...");

    if (!emailInput || !passInput) {
        alert("❌ ERROR CRÍTICO: Los IDs 'app-email' o 'app-pass' no existen en tu HTML.");
        return false;
    }

    const emailStr = emailInput.value.trim();
    const passwordStr = passInput.value.trim();

    // Alerta de control 2
    alert("📡 Alerta 2: Vamos a consultar a Supabase por: " + emailStr + " con la clave: " + passwordStr);

    try {
        const { data: ciudadanos, error } = await supabase
            .from('perfiles_ciudadanos')
            .select('*')
            .eq('email', emailStr)
            .eq('contrasena_plana', passwordStr);

        if (error) {
            alert("❌ Error devuelto por la base de datos: " + error.message);
            return false;
        }

        // Alerta de control 3
        alert("📥 Alerta 3: Supabase respondió. Cantidad de usuarios encontrados: " + (ciudadanos ? ciudadanos.length : 0));

        if (ciudadanos && ciudadanos.length > 0) {
            usuarioLogeado = ciudadanos[0];
            
            document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
            document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;
            
            // Cambio de pantallas SPA
            document.getElementById('screen-login').style.display = "none";
            document.getElementById('app-main-layout').style.display = "flex";
            
            window.switchTabView('emergencias');
            alert("🎉 ¡LOGEO EXITOSO! Bienvenido " + usuarioLogeado.nombre_completo);
        } else {
            alert("⚠️ Credenciales incorrectas. Supabase no encontró este correo y clave exactos.");
        }

    } catch (err) {
        alert("💥 Error de ejecución en el JS: " + err.message);
    }
    
    return false;
};

// --- CONTROLADOR DE PESTAÑAS (TAB BAR INFERIOR) ---
window.switchTabView = function(targetView) {
    const viewEmergencias = document.getElementById('view-emergencias');
    const viewVideollamada = document.getElementById('view-videollamada');
    const viewPerfil = document.getElementById('view-perfil');
    
    if(viewEmergencias) viewEmergencias.style.display = "none";
    if(viewVideollamada) viewVideollamada.style.display = "none";
    if(viewPerfil) viewPerfil.style.display = "none";
    
    document.getElementById('tab-emergencias').classList.remove('active');
    document.getElementById('tab-videollamada').classList.remove('active');
    document.getElementById('tab-perfil').classList.remove('active');

    if (targetView === 'emergencias' && viewEmergencias) {
        viewEmergencias.style.display = "block";
        document.getElementById('tab-emergencias').classList.add('active');
    } else if (targetView === 'videollamada' && viewVideollamada) {
        viewVideollamada.style.display = "block";
        document.getElementById('tab-videollamada').classList.add('active');
    } else if (targetView === 'perfil' && viewPerfil) {
        viewPerfil.style.display = "block";
        document.getElementById('tab-perfil').classList.add('active');
    }
};

// --- CERRAR SESIÓN ---
window.cerrarSesionApp = function() {
    usuarioLogeado = null;
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
};