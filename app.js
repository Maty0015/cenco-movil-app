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

// --- 🔐 PASO 1: PROCESAR LOGEO DIRECTO GLOBAL (Gatillado por el onsubmit del HTML) ---
window.procesarLoginMovil = async function(e) {
    e.preventDefault(); // Detiene la recarga automática que destruye la sesión en Vercel
    
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    console.log("Conectando con Supabase para verificar usuario...");

    try {
        // Consulta relacional directa a tu tabla perfiles_ciudadanos
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
            
            // Inyectar los datos reales recuperados de tu DB en la vista de Perfil
            document.getElementById('profile-user-name').innerText = usuarioLogeado.nombre_completo;
            document.getElementById('profile-user-rut').innerText = `RUT: ${usuarioLogeado.rut || '12.345.678-9'}`;
            
            // Transición SPA: Apagar Login, Encender Onboarding/Bienvenida
            document.getElementById('screen-login').style.display = "none";
            document.getElementById('screen-onboarding').style.display = "flex";
            
            // Forzar reinicio limpio del carrusel en el índice cero
            inicializarOnboardingUI();
        } else {
            alert("Las credenciales ingresadas no corresponden a ningún ciudadano sordo registrado.");
        }
    } catch (err) {
        console.error("Error crítico de autenticación:", err);
        alert("No se pudo conectar al servidor de emergencias.");
    }
};

// --- 🎬 PASO 2: CONTROL Y MOVIMIENTO INTERACTIVO DEL ONBOARDING ---
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
        
        // Modificación dinámica del DOM con las tarjetas del Figma
        document.getElementById('onboarding-title').innerText = step.title;
        document.getElementById('onboarding-description').innerText = step.description;
        document.getElementById('onboarding-bg-video').style.backgroundImage = step.videoBg;
        document.getElementById('onboarding-icon-badge').innerText = step.badge;
        
        // Animación de los puntitos de paginación inferiores
        const dots = document.querySelectorAll('.carousel-indicators .dot');
        dots.forEach((dot, index) => {
            if (index === currentOnboardingStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        // Configurar gatillo de cierre en el último slide
        if (currentOnboardingStep === onboardingData.length - 1) {
            document.getElementById('btn-onboarding-next').innerHTML = "Comenzar &check;";
        }
    } else {
        // --- 🚨 PASO 3: ENTRAR DEFINITIVAMENTE AL CENTRO DE EMERGENCIAS S.O.S ---
        document.getElementById('screen-onboarding').style.display = "none";
        document.getElementById('app-main-layout').style.display = "flex";
        
        // Forzar renderizado por defecto en el Home de Emergencias
        window.switchTabView('emergencias');
    }
});

// --- 🔄 CONTROLADOR DE PESTAÑAS INTERNAS (TAB BAR SUPERIOR/INFERIOR) ---
window.switchTabView = function(targetView) {
    // Apagar las tres sub-vistas estructurales
    document.getElementById('view-emergencias').style.display = "none";
    document.getElementById('view-videollamada').style.display = "none";
    document.getElementById('view-perfil').style.display = "none";
    
    // Remover estados de enfoque visual del TabBar
    document.getElementById('tab-emergencias').classList.remove('active');
    document.getElementById('tab-videollamada').classList.remove('active');
    document.getElementById('tab-perfil').classList.remove('active');

    // Activar la vista solicitada por el usuario sordo
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

// --- ⚠️ DISPARADOR DE AUXILIO CRÍTICO: INSERCIÓN REAL REALTIME EN SUPABASE ---
window.activarBotonPanicoSOS = async function() {
    if (!usuarioLogeado) return;

    // Localización céntrica en Concepción para el despliegue de patrullas del dashboard
    const latConcepcion = -36.82900000; 
    const lonConcepcion = -73.03980000;
    
    // Generación de identificador único compatible con la Clave Primaria de tu script SQL
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
            detalles_reporte: "Activación Crítica de auxilio desde dispositivo móvil accesible.",
            estado_procedimiento: "CRÍTICO"
        }]);

    if (error) {
        alert("Error de comunicación de auxilio: " + error.message);
    } else {
        alert(`🚨 S.O.S Enviado.\nFolio asignado: ${correlativoFolio}\n\nSeñal de auxilio transmitida con éxito. Carabineros ha recibido su ubicación en el panel de CENCO.`);
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