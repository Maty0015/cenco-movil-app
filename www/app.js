// =========================================================================
// 🧠 CASCARÓN LÓGICO DE NAVEGACIÓN SPA - CENCO MÓVIL
// =========================================================================

// 1. Captura de contenedores principales (Vistas)
const wrapperLoginMovil = document.getElementById('wrapper-login-movil');
const wrapperPlataformaMovil = document.getElementById('wrapper-plataforma-movil');

// 2. Captura de sub-vistas del Bottom Nav
const subviewSos = document.getElementById('subview-sos');
const subviewVideo = document.getElementById('subview-video');
const subviewPerfil = document.getElementById('subview-perfil');

// 3. Captura de botones del menú inferior para aplicar estados activos
const navSos = document.getElementById('nav-sos');
const navVideo = document.getElementById('nav-video');
const navPerfil = document.getElementById('nav-perfil');


/**
 * 🔐 Función de Control de Acceso Inicial
 * Al dar submit, oculta el formulario y despliega la app interna.
 */
window.procesarLoginMovil = function(event) {
    event.preventDefault(); // Evita que la página se recargue

    const email = document.getElementById('movil-email').value.trim();
    const pass = document.getElementById('movil-pass').value;

    // Validación básica con las credenciales por defecto fijadas en el HTML
    if (email === 'juan.perez@email.com' && pass === 'password123') {
        
        // Efecto espejo: Apagamos el login y encendemos el contenedor interno
        wrapperLoginMovil.style.display = "none";
        wrapperPlataformaMovil.style.display = "flex";
        
        // Forzamos que la primera vista al entrar siempre sea Emergencia (SOS)
        window.navegarApp('sos');
    } else {
        alert("🚨 Credenciales incorrectas. Intente usando el usuario de prueba.");
    }
};


/**
 * 🗺️ Enrutador Modular Interno (Switch de Vistas)
 * Oculta todas las sub-vistas y solo enciende la seleccionada.
 */
window.navegarApp = function(destino) {
    // Paso A: Remover el color verde activo de todos los botones del menú
    navSos.classList.remove('active');
    navVideo.classList.remove('active');
    navPerfil.classList.remove('active');

    // Paso B: Ocultar absolutamente todas las sub-vistas
    subviewSos.style.display = "none";
    subviewVideo.style.display = "none";
    subviewPerfil.style.display = "none";

    // Paso C: Activar selectivamente el destino correspondiente
    switch (destino) {
        case 'sos':
            navSos.classList.add('active');
            subviewSos.style.display = "flex";
            break;
            
        case 'video':
            navVideo.classList.add('active');
            subviewVideo.style.display = "flex"; // Cambia a flex para mantener estructura elástica
            break;
            
        case 'perfil':
            navPerfil.classList.add('active');
            subviewPerfil.style.display = "flex";
            break;
            
        default:
            console.error("Ruta no definida en el ecosistema móvil: " + destino);
    }
};