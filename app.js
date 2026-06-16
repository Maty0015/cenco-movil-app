// =========================================================================
// 🚀 CONTROLADOR DE SEGURIDAD, ACCESIBILIDAD Y CONEXIÓN - CENCO MOVIL
// =========================================================================

const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const screenLogin = document.getElementById('screen-login');
const screenOnboarding = document.getElementById('screen-onboarding');
const screenMain = document.getElementById('screen-main');

const subConfigTexto = document.getElementById('screen-config-texto');
const subConfigNotificaciones = document.getElementById('screen-config-notificaciones');

// --- ENRUTADOR DE ACCESO PROBADO ---
window.handleLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    if (email === 'juan.perez@email.com' && pass === 'password123') {
        screenLogin.style.display = 'none';
        
        // Cargar preferencias del ciudadano
        const tamañoGuardado = localStorage.getItem('appTextSize') || 'grande';
        window.setAppTextSize(tamañoGuardado);

        const contrasteGuardado = localStorage.getItem('altoContrasteActive') === 'true';
        if (contrasteGuardado) {
            document.body.classList.add('alto-contraste');
            document.getElementById('toggle-contraste').checked = true;
        }

        window.checkFirstTime();
    } else {
        alert("🚨 Credenciales de acceso incorrectas.\nUse juan.perez@email.com / password123");
    }
};

window.checkFirstTime = function() {
    const alreadySeenOnboarding = localStorage.getItem('onboardingCompleted');
    if (alreadySeenOnboarding) {
        screenMain.style.display = 'flex';
        window.switchSubView('emergencia');
    } else {
        screenOnboarding.style.display = 'flex';
        window.nextSlide(1); // CORREGIDO: Fuerza a renderizar el slide inicial
    }
};

// CORREGIDO: Activa de manera estricta el bloque flex para pasar la pantalla de bienvenida
window.nextSlide = function(slideNumber) {
    document.querySelectorAll('.onboarding-slide').forEach(s => {
        s.style.display = "none";
        s.classList.remove('active');
    });
    
    const targetSlide = document.getElementById(`slide-${slideNumber}`);
    if (targetSlide) {
        targetSlide.style.display = "flex";
        targetSlide.classList.add('active');
    }
};

window.finishOnboarding = function() {
    localStorage.setItem('onboardingCompleted', 'true');
    screenOnboarding.style.display = 'none';
    screenMain.style.display = 'flex';
    window.switchSubView('emergencia');
};

window.switchSubView = function(vista) {
    document.getElementById('subview-emergencia').style.display = "none";
    document.getElementById('subview-perfil').style.display = "none";
    
    document.getElementById('nav-btn-emergencia').classList.remove('active');
    document.getElementById('nav-btn-perfil').classList.remove('active');

    if (vista === 'emergencia') {
        document.getElementById('subview-emergencia').style.display = "block";
        document.getElementById('nav-btn-emergencia').classList.add('active');
    } else if (vista === 'perfil') {
        document.getElementById('subview-perfil').style.display = "block";
        document.getElementById('nav-btn-perfil').classList.add('active');
    }
};

window.abrirFiltroConfirmacionSOS = function() {
    document.getElementById('modal-confirmar-sos').style.display = "flex";
};

window.cerrarModalConfirmarSOS = function() {
    document.getElementById('modal-confirmar-sos').style.display = "none";
};

window.dispararAlertaOndaSOSReal = async function() {
    window.cerrarModalConfirmarSOS();

    const onda1 = document.getElementById('wave-effect-1');
    const onda2 = document.getElementById('wave-effect-2');

    onda1.style.display = "block";
    onda2.style.display = "block";
    onda1.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    setTimeout(() => {
        if (onda2) onda2.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    }, 400);

    const folioAleatorio = "SOS-" + Math.floor(100 + Math.random() * 900);

    const { error } = await supabaseClient
        .from('incidentes_cenco')
        .insert([{
            id: folioAleatorio,
            usuario_id: "b2222222-2222-2222-2222-222222222222",
            nombre_usuario_anonimo: "Juan Pérez",
            tipo_incidente: "Botón SOS",
            categoria_tag: "SOS",
            ubicacion_texto: "Barros Arana 500, Concepción Centro",
            latitud: -36.82650000,
            longitud: -73.05080000,
            detalles_reporte: "Alerta de pánico activada en vivo desde dispositivo móvil por usuario con discapacidad auditiva.",
            estado_procedimiento: "CRÍTICO"
        }]);

    if (error) {
        alert("Error de transmisión de red: " + error.message);
        return;
    }

    alert(`🚨 ¡ALERTA DESPACHADA! \nProcedimiento registrado bajo el folio fiscal ${folioAleatorio}.\nCarabineros ha recibido tu ubicación en Concepción Centro.`);
};

window.cambiarSubPantallaPerfil = function(idPantalla) {
    document.getElementById(idPantalla).style.display = "flex";
};

window.volverAlPerfilMenu = function() {
    if (subConfigTexto) subConfigTexto.style.display = "none";
    if (subConfigNotificaciones) subConfigNotificaciones.style.display = "none";
};

window.toggleAltoContraste = function() {
    const active = document.body.classList.toggle('alto-contraste');
    localStorage.setItem('altoContrasteActive', active);
};

window.setAppTextSize = function(tamaño) {
    document.body.classList.remove('text-size-pequeno', 'text-size-mediano', 'text-size-grande', 'text-size-extra-grande');
    document.body.classList.add(`text-size-${tamaño}`);

    document.querySelectorAll('.check-circle-indicator').forEach(chk => chk.classList.remove('active'));
    
    const targetCheck = document.getElementById(`chk-${tamaño}`);
    if (targetCheck) targetCheck.add('active');

    const labelMap = { 'pequeno': 'Pequeño', 'mediano': 'Mediano', 'grande': 'Grande', 'extra-grande': 'Extra Grande' };
    const labelActual = document.getElementById('label-size-actual');
    if (labelActual) labelActual.innerText = labelMap[tamaño];

    localStorage.setItem('appTextSize', tamaño);
};

window.logoutApp = function() {
    localStorage.removeItem('onboardingCompleted');
    screenMain.style.display = 'none';
    screenLogin.style.display = 'flex';
};

function iniciarAppMovilNativa() {
    screenLogin.style.display = 'flex';
    screenOnboarding.style.display = 'none';
    screenMain.style.display = 'none';
}

iniciarAppMovilNativa();