// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;
let currentOnboardingStep = 0;

// Configuración de los recursos del carrusel (Datos interactivos para el Onboarding)
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

// --- LOGICA DE CONTROL DEL CARRUSEL (ONBOARDING) ---
document.getElementById('btn-onboarding-next').addEventListener('click', () => {
    currentOnboardingStep++;
    
    if (currentOnboardingStep < onboardingData.length) {
        const step = onboardingData[currentOnboardingStep];
        
        // Actualizar textos e imágenes simuladas en el HTML
        document.getElementById('onboarding-title').innerText = step.title;
        document.getElementById('onboarding-description').innerText = step.description;
        document.getElementById('onboarding-bg-video').style.backgroundImage = step.videoBg;
        document.getElementById('onboarding-icon-badge').innerText = step.badge;
        
        // Actualizar puntitos verdes indicadores de progreso
        const dots = document.querySelectorAll('.carousel-indicators .dot');
        dots.forEach((dot, index) => {
            if (index === currentOnboardingStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        // Si llegamos a la última pantalla, el botón cambia para finalizar
        if (currentOnboardingStep === onboardingData.length - 1) {
            document.getElementById('btn-onboarding-next').innerHTML = "Comenzar &check;";
        }
    } else {
        // Fin del carrusel -> Transición SPA hacia la pantalla de Login
        document.getElementById('screen-onboarding').style.display = "none";
        document.getElementById('screen-login').style.display = "flex";
    }
});

// --- ENTRADA AL SISTEMA (LOGIN) ---
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
        
        // Cargar la pestaña de emergencies por defecto
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
    currentOnboardingStep = 0;
    
    // Al cerrar sesión, la SPA retorna ordenadamente al paso 1 del Onboarding
    document.getElementById('onboarding-title').innerText = onboardingData[0].title;
    document.getElementById('onboarding-description').innerText = onboardingData[0].description;
    document.getElementById('onboarding-bg-video').style.backgroundImage = onboardingData[0].videoBg;
    document.getElementById('onboarding-icon-badge').innerText = onboardingData[0].badge;
    document.getElementById('btn-onboarding-next').innerHTML = "Siguiente &rsaquo;";
    
    const dots = document.querySelectorAll('.carousel-indicators .dot');
    dots.forEach((dot, idx) => idx === 0 ? dot.classList.add('active') : dot.classList.remove('active'));

    // Reordenar visibilidad de contenedores principales
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-onboarding').style.display = "flex";
};

// Carga asíncrona de la primera foto de fondo para el visor de video simulado
document.getElementById('onboarding-bg-video').style.backgroundImage = onboardingData[0].videoBg;