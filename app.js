// --- VARIABLES DE ESTADO ---
const screenLogin = document.getElementById('screen-login');
const screenOnboarding = document.getElementById('screen-onboarding');
const screenMain = document.getElementById('screen-main');

const subConfigTexto = document.getElementById('screen-config-texto');
const subConfigNotificaciones = document.getElementById('screen-config-notificaciones');

// --- ENRUTADOR DE ACCESO ---
window.handleLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (email === 'juan.perez@email.com' && pass === 'password123') {
        screenLogin.style.display = 'none';
        
        // Cargar preferencias guardadas del ciudadano
        const tamañoGuardado = localStorage.getItem('appTextSize') || 'grande';
        window.setAppTextSize(tamañoGuardado);

        const contrasteGuardado = localStorage.getItem('altoContrasteActive') === 'true';
        if (contrasteGuardado) {
            document.body.classList.add('alto-contraste');
            document.getElementById('toggle-contraste').checked = true;
        }

        window.checkFirstTime();
    } else {
        alert("Credenciales de acceso incorrectas.");
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

// --- ALTERNADOR DE PANTALLAS INFERIORES ---
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

window.dispararAlertaOndaSOSReal = function() {
    window.cerrarModalConfirmarSOS();

    const onda1 = document.getElementById('wave-effect-1');
    const onda2 = document.getElementById('wave-effect-2');

    onda1.style.display = "block";
    onda2.style.display = "block";

    onda1.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    setTimeout(() => {
        onda2.style.animation = "expandirOndaSOS 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite";
    }, 400);

    alert("🚨 SEÑAL SOS ENVIADA AL CENCO\nGeolocalización bloqueada y despachando cuadrante más cercano.");
};

// --- MOTOR DE AJUSTES DE ACCESIBILIDAD ---
window.cambiarSubPantallaPerfil = function(idPantalla) {
    document.getElementById(idPantalla).style.display = "flex";
};

window.volverAlPerfilMenu = function() {
    subConfigTexto.style.display = "none";
    subConfigNotificaciones.style.display = "none";
};

window.toggleAltoContraste = function() {
    const active = document.body.classList.toggle('alto-contraste');
    localStorage.setItem('altoContrasteActive', active);
};

window.setAppTextSize = function(tamaño) {
    document.body.classList.remove('text-size-pequeno', 'text-size-mediano', 'text-size-grande', 'text-size-extra-grande');
    document.body.classList.add(`text-size-${tamaño}`);

    document.querySelectorAll('.check-circle-indicator').forEach(chk => chk.classList.remove('active'));
    document.getElementById(`chk-${tamaño}`).classList.add('active');

    const labelMap = { 'pequeno': 'Pequeño', 'mediano': 'Mediano', 'grande': 'Grande', 'extra-grande': 'Extra Grande' };
    document.getElementById('label-size-actual').innerText = labelMap[tamaño];

    localStorage.setItem('appTextSize', tamaño);
};

window.logoutApp = function() {
    localStorage.removeItem('onboardingCompleted');
    screenMain.style.display = 'none';
    screenLogin.style.display = 'flex';
};