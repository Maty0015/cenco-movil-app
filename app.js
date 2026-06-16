// --- LLAVES DE CONEXIÓN CON TU BASE DE DATOS SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ESTADO LOCAL DEL CIUDADANO AUTENTICADO ---
let usuarioLogeado = null;
let currentOnboardingStep = 0;

// Configuración de recursos del carrusel onboarding (Simulando capturas de tu Figma)
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

// --- LOGICA DE ONBOARDING ---
document.getElementById('btn-onboarding-next').addEventListener('click', () => {
    currentOnboardingStep++;
    if (currentOnboardingStep < onboardingData.length) {
        // Actualizar UI del paso del carrusel
        const step = onboardingData[currentOnboardingStep];
        document.getElementById('onboarding-title').innerText = step.title;
        document.getElementById('onboarding-description').innerText = step.description;
        document.getElementById('onboarding-bg-video').style.backgroundImage = step.videoBg;
        document.getElementById('onboarding-icon-badge').innerText = step.badge;
        
        // Actualizar puntitos indicadores
        const dots = document.querySelectorAll('.carousel-indicators .dot');
        dots.forEach((dot, index) => {
            if(index === currentOnboardingStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        if(currentOnboardingStep === onboardingData.length - 1) {
            document.getElementById('btn-onboarding-next').innerText = "Comenzar ✓";
        }
    } else {
        // Fin del onboarding -> Ir al Login
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
        
        // Transición SPA hacia la vista del contenedor de la App
        document.getElementById('screen-login').style.display = "none";
        document.getElementById('app-main-layout').style.display = "flex";
        window.switchTab('emergencias');
    } else {
        alert("Credenciales digitales inválidas para emergencias.");
    }
});

// --- CONTROLADOR DE NAVEGACIÓN INFERIOR (TAB BAR) ---
window.switchTab = function(destinoTab) {
    // Apagar todas las vistas
    document.getElementById('subview-emergencias').style.display = "none";
    document.getElementById('subview-videollamada').style.display = "none";
    document.getElementById('subview-perfil').style.display = "none";
    
    // Quitar active de botones
    document.getElementById('tab-btn-emergencias').classList.remove('active');
    document.getElementById('tab-btn-videollamada').classList.remove('active');
    document.getElementById('tab-btn-perfil').classList.remove('active');

    // Encender la pestaña solicitada
    if (destinoTab === 'emergencias') {
        document.getElementById('subview-emergencias').style.display = "block";
        document.getElementById('tab-btn-emergencias').classList.add('active');
    } else if (destinoTab === 'videollamada') {
        document.getElementById('subview-videollamada').style.display = "block";
        document.getElementById('tab-btn-videollamada').classList.add('active');
    } else if (destinoTab === 'perfil') {
        document.getElementById('subview-perfil').style.display = "block";
        document.getElementById('tab-btn-perfil').classList.add('active');
    }
};

// --- ACCIÓN CRÍTICA: BOTÓN DE PÁNICO S.O.S ---
window.activarBotonPanicoSOS = async function() {
    if (!usuarioLogeado) return;

    // Simulador de Coordenadas de Concepción (Donde opera el Dashboard)
    const latConcepcion = -36.82900000; 
    const lonConcepcion = -73.03980000;

    // Generar Folio aleatorio compatible con la llave VARCHAR de tu BD anterior
    const correlativoFolio = "SOS-" + Math.floor(100 + Math.random() * 900);

    // Inserción directa en la tabla de incidentes de Supabase
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
        alert(`🚨 Alerta SOS enviada con éxito.\nFolio: ${correlativoFolio}\n\nCarabineros ha recibido su ubicación actual en el Dashboard del cuadrante.`);
    }
};

// --- ADICIONALES DE REPORTE Y VIDEOLLAMADA ---
window.reportarDelitoMenor = function() {
    const reporteStr = prompt("Ingrese brevemente los detalles del suceso (Robo, daños, etc.):");
    if(!reporteStr) return;
    alert("Reporte guardado. En un caso real, esto inserta una tupla con 'categoria_tag = Denuncia' en Supabase.");
};

window.verHistorialEnvios = function() {
    alert("Cargando bitácora histórica personal enlazada a tu UUID de ciudadano...");
};

window.unirseAVideollamada = function() {
    alert("Conectando con la Central de Intérpretes del Turno CENCO...\nEstableciendo canal WebRTC de video adaptado.");
};

// --- OPCIONES DE ACCESIBILIDAD ---
let flagTamano = 0; 
window.cambiarTamanoTexto = function() {
    if(flagTamano === 0) {
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
    if(checkbox.checked) {
        document.body.classList.add('high-contrast-mode');
    } else {
        document.body.classList.remove('high-contrast-mode');
    }
};

window.cerrarSesionApp = function() {
    usuarioLogeado = null;
    document.getElementById('app-main-layout').style.display = "none";
    document.getElementById('screen-login').style.display = "flex";
};

// Inicialización de la portada del Onboarding simulada
document.getElementById('onboarding-bg-video').style.backgroundImage = onboardingData[0].videoBg;