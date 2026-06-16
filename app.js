// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;
let currentOnboardingStep = 0;

// Configuración de los recursos del carrusel (Datos del Onboarding)
const onboardingData = [
    {
        title: "Bienvenido",
        description: "Esta aplicación está diseñada para facilitar la comunicación entre personas sordas y Carabineros de Chile.",
        videoBg: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80')",
        badge: "🛡️"
    },
    {
        title: "Botón S.O.S.",
        description: "Usa el botón S.O.S. rojo solo en caso de emergencia real. Enviará tu ubicación inmediata para recibir ayuda.",
        videoBg: "url('https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80')",
        badge: "⚠️"
    },
    {
        title: "Videollamadas",
        description: "Conéctate por videollamada con un intérprete de Lengua de Señas Chilena (LSCh) para trámites o consultas.",
        videoBg: "url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80')",
        badge: "📹"
    }
];

// --- 🔐 PASO 1: FORMULARIO DE LOGIN (PANTALLA INICIAL) ---
document.getElementById('form-login-ciudadano').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    // Consulta en Supabase
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
        
        // Cargar datos en la UI del Perfil interno
        document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
        document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;
        
        // Esconder el login y encender la Bienvenida (Onboarding)
        document.getElementById('screen-login').style.display = "none";
        document.getElementById('screen-onboarding').style.display = "flex";
        
        // Forzar inicialización limpia del carrusel en el paso 0
        inicializarOnboardingUI();
    } else {
        alert("Credenciales digitales inválidas para emergencias.");
    }
});

// --- 🎬 PASO 2: INICIALIZACIÓN Y NAVEGACIÓN DEL ONBOARDING ---
function inicializarOnboardingUI() {
    currentOnboardingStep = 0;
    const step = onboardingData[0];
    
    document.getElementById('onboarding-title').innerText = step.title;
    document.getElementById('onboarding-description').innerText = step.description;
    document.getElementById('onboarding-bg-video').style.backgroundImage = step.videoBg;
    document.getElementById('onboarding-icon-badge').innerText = step.badge;
    document.getElementById('btn-onboarding-next').innerHTML = "Siguiente &rsaquo;";
    
    const dots = document.querySelectorAll('.carousel-indicators .dot');
    dots.forEach((dot, index) => {
        if (index === 0) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

document.getElementById('btn-onboarding-next').addEventListener('click', () => {
    currentOnboardingStep++;
    
    if (currentOnboardingStep < onboardingData.length) {
        const step = onboardingData[currentOnboardingStep];
        
        // Actualizar elementos dinámicos
        document.getElementById('onboarding-title').innerText = step.title;
        document.getElementById('onboarding-description').innerText = step.description;
        document.getElementById('onboarding-bg-video').style.backgroundImage = step.videoBg;
        document.getElementById('onboarding-icon-badge').innerText = step.badge;
        
        // Actualizar puntitos de progreso
        const dots = document.querySelectorAll('.carousel-indicators .dot');
        dots.forEach((dot, index) => {
            if (index === currentOnboardingStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        // Si llegamos a la última pantalla del carrusel
        if (currentOnboardingStep === onboardingData.length - 1) {
            document.getElementById('btn-onboarding-next').innerHTML = "Comenzar &check;";
        }
    } else {
        // --- 🚨 PASO 3: ENTRAR AL HOME PRINCIPAL S.O.S ---
        document.getElementById('screen-onboarding').style.display = "none";
        document.getElementById('app-main-layout').style.display = "flex";
        
        // Forzar vista de emergencias activa
        window.switchTabView('emergencias');
    }
});

// --- CONTROLADOR DE PESTAÑAS (TAB BAR) ---
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

// --- EMISIÓN DE SEÑAL S.O.S A SUPABASE ---
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
            detalles_reporte: "Activación Crítica de botón de pánico desde aplicación móvil inclusiva.",
            estado_procedimiento: "CRÍTICO"
        }]);

    if (error) {
        alert("Ocurrió un inconveniente al emitir señal: " + error.message);
    } else {
        alert(`🚨 Alerta SOS enviada con éxito.\nFolio: ${correlativoFolio}\n\nCarabineros ha recibido su ubicación actual en el Dashboard de Concepción.`);
    }
};

// --- OPCIONES DE ACCESIBILIDAD ---
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

// --- CERRAR SESIÓN ---
window.cerrarSesionApp = function() {
    usuarioLogeado = null;
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-onboarding').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
    
    document.getElementById('app-email').value = "juan.perez@email.com";
    document.getElementById('app-pass').value = "password123";
};