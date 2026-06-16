// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;

// --- PROCESAR INICIO DE SESIÓN DIRECTO AL HOME ---
window.procesarLoginDirectoSOS = async function(e) {
    // CORREGIDO: Forzamos la detención inmediata y el freno de burbujeo del click
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    if (!emailStr || !passwordStr) {
        alert("Por favor rellene los campos solicitados.");
        return false;
    }

    try {
        const { data: ciudadanos, error } = await supabase
            .from('perfiles_ciudadanos')
            .select('*')
            .eq('email', emailStr)
            .eq('contrasena_plana', passwordStr);

        if (error) {
            alert("Error devuelto por Supabase: " + error.message);
            return false;
        }

        if (ciudadanos && ciudadanos.length > 0) {
            usuarioLogeado = ciudadanos[0];
            
            // Inyectar datos reales del ciudadano en la vista de perfil
            document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
            document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;
            
            // SPA: Apagar Login, Encender la pantalla del S.O.S.
            document.getElementById('screen-login').style.display = "none";
            document.getElementById('app-main-layout').style.display = "flex";
            
            window.switchTabView('emergencias');
        } else {
            alert("No se encontró el usuario. Revisa el correo o la clave.");
        }

    } catch (err) {
        alert("Error crítico en la consulta: " + err.message);
    }
    
    return false;
};

// --- CONTROLADOR DE PESTAÑAS (TAB BAR INFERIOR) ---
window.switchTabView = function(targetView) {
    document.getElementById('view-emergencias').style.display = "none";
    document.getElementById('view-videollamada').style.display = "none";
    document.getElementById('view-perfil').style.display = "none";
    
    document.getElementById('tab-emergencias').classList.remove('active');
    document.getElementById('tab-videollamada').classList.remove('active');
    document.getElementById('tab-perfil').classList.remove('active');

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

// --- TRANSMITIR ALERTA AL DASHBOARD EN TIEMPO REAL ---
window.activarBotonPanicoSOS = async function() {
    if (!usuarioLogeado) return;

    const latConcepcion = -36.82900000; 
    const lonConcepcion = -73.03980000;
    const correlativoFolio = "SOS-" + Math.floor(100 + Math.random() * 900);

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
            detalles_reporte: "Activación Crítica de auxilio desde la aplicación móvil.",
            estado_procedimiento: "CRÍTICO"
        }]);

    if (error) {
        alert("Error de comunicación de auxilio: " + error.message);
    } else {
        alert(`🚨 S.O.S Enviado.\nFolio asignado: ${correlativoFolio}\n\nCarabineros ha recibido tu señal en el Dashboard.`);
    }
};

// --- CERRAR SESIÓN ---
window.cerrarSesionApp = function() {
    usuarioLogeado = null;
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
    
    // Limpiar inputs al salir
    document.getElementById('app-email').value = "";
    document.getElementById('app-pass').value = "";
};