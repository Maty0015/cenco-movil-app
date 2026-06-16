// =========================================================================
// 🚀 CONTROLADOR DE SEGURIDAD Y ACCESIBILIDAD - CENCO MOVIL
// =========================================================================

// --- VARIABLES DE ESTADO Y PANTALLAS ---
const screenLogin = document.getElementById('screen-login');
const screenOnboarding = document.getElementById('screen-onboarding');
const screenMain = document.getElementById('screen-main');

const subConfigTexto = document.getElementById('screen-config-texto');
const subConfigNotificaciones = document.getElementById('screen-config-notificaciones');

// --- ENRUTADOR DE ACCESO PRINCIPAL ---
window.handleLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    // Validación estricta para el simulador ciudadano
    if (email === 'juan.perez@email.com' && pass === 'password123') {
        screenLogin.style.display = 'none';
        
        // Cargar preferencias guardadas del ciudadano en la memoria local
        const tamañoGuardado = localStorage.getItem('appTextSize') || 'grande';
        window.setAppTextSize(tamañoGuardado);

        const contrasteGuardado = localStorage.getItem('altoContrasteActive') === 'true';
        if (contrasteGuardado) {
            document.body.classList.add('alto-contraste');
            const toggleContraste = document.getElementById('toggle-contraste');
            if (toggleContraste) toggleContraste.checked = true;
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
    }
};

window.nextSlide = function(slideNumber) {
    document.querySelectorAll('.onboarding-slide').forEach(s => s.classList.remove('active'));
    document.getElementById(`slide-${slideNumber}`).classList.add('active');
};

window.finishOnboarding = function() {
    localStorage.setItem('onboardingCompleted', 'true');
    screenOnboarding.style.display = 'none';
    screenMain.style.display = 'flex';
    window.switchSubView('emergencia');
};

// --- ALTERNADOR DE PANTALLAS INFERIORES VIVAS ---
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

// --- FLUJO OPERATIVO DEL BOTÓN SOS INTERACTIVO ---
window.abrirFiltroConfirmacionSOS = function() {
    document.getElementById('modal-confirmar-sos').style.display = "flex";
};

window.cerrarModalConfirmarSOS = function() {
    document.getElementById('modal-confirmar-sos').style.display = "none";
};

// Gatilla la onda expansiva concéntrica continua al confirmar
window.dispararAlertaOndaSOSReal = function() {
    window.cerrarModalConfirmarSOS();

    const onda1 = document.getElementById('wave-effect-1');
    const onda2 = document.getElementById('wave-effect-2');

    // Encendemos y gatillamos animación elástica visual
    onda1.style.display = "block";
    onda2.style.display = "block";

    onda1.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    // Desfase de la segunda ola para dar sensación de señal continua de radio fiscal
    setTimeout(() => {
        onda2.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    }, 400);

    alert("🚨 SEÑAL SOS EMITIDA AL CENCO CON EXITO\nGeolocalización bloqueada de forma conforme. Enviando cuadrante más cercano de Carabineros.");
};

// --- MOTOR DE AJUSTES DE ACCESIBILIDAD ---
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
    // Removemos las escalas previas del Body de forma elástica
    document.body.classList.remove('text-size-pequeno', 'text-size-mediano', 'text-size-grande', 'text-size-extra-grande');
    // Inyectamos la nueva jerarquía de fuentes
    document.body.classList.add(`text-size-${tamaño}`);

    // Limpiamos los selectores redondos previos
    document.querySelectorAll('.check-circle-indicator').forEach(chk => chk.classList.remove('active'));
    
    // Encendemos la bolita de verificación de la opción activa
    const targetCheck = document.getElementById(`chk-${tamaño}`);
    if (targetCheck) targetCheck.classList.add('active');

    // Traducimos el texto en el menú de perfil principal
    const labelMap = { 'pequeno': 'Pequeño', 'mediano': 'Mediano', 'grande': 'Grande', 'extra-grande': 'Extra Grande' };
    const labelActual = document.getElementById('label-size-actual');
    if (labelActual) labelActual.innerText = labelMap[tamaño];

    // Persistimos en la memoria del smartphone
    localStorage.setItem('appTextSize', tamaño);
};

window.logoutApp = function() {
    localStorage.removeItem('onboardingCompleted');
    screenMain.style.display = 'none';
    screenLogin.style.display = 'flex';
};

// --- INICIALIZADOR DE ARRANQUE SEGURO ---
function iniciarAppMovilNativa() {
    screenLogin.style.display = 'flex';
    screenOnboarding.style.display = 'none';
    screenMain.style.display = 'none';
}

iniciarAppMovilNativa();