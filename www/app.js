// --- CONFIGURACIÓN E INICIALIZACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://rcoigjmvmcnfzszssmly.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qNhIIRqHXtHUa1AysCXgIA_AVf3Bcpe";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// 4. Captura del Botón Radial y Ondas para SOS
const btnSosRadial = document.getElementById('btn-sos-radial');
const wave1 = document.getElementById('wave-1');
const wave2 = document.getElementById('wave-2');
const toastWhatsapp = document.getElementById('toast-whatsapp');

// Variables para el temporizador de presión prolongada (3 Segundos)
let tiempoPresionado = null;
const DURACION_PRESION = 3000; // 3000 milisegundos = 3 segundos

// Datos estáticos del ciudadano logueado
const USUARIO_SESION = {
    nombre: "Juan Pérez",
    rut: "12.345.678-9"
};

/**
 * 🔐 Función de Control de Acceso Inicial
 */
window.procesarLoginMovil = function(event) {
    event.preventDefault();

    const email = document.getElementById('movil-email').value.trim();
    const pass = document.getElementById('movil-pass').value;

    if (email === 'juan.perez@email.com' && pass === 'password123') {
        wrapperLoginMovil.style.display = "none";
        wrapperPlataformaMovil.style.display = "flex";
        window.navegarApp('sos');
    } else {
        alert("🚨 Credenciales incorrectas. Intente usando el usuario de prueba.");
    }
};

/**
 * 🗺️ Enrutador Modular Interno (Switch de Vistas)
 */
window.navegarApp = function(destino) {
    navSos.classList.remove('active');
    navVideo.classList.remove('active');
    navPerfil.classList.remove('active');

    subviewSos.style.display = "none";
    subviewVideo.style.display = "none";
    subviewPerfil.style.display = "none";

    switch (destino) {
        case 'sos':
            navSos.classList.add('active');
            subviewSos.style.display = "flex";
            break;
            
        case 'video':
            navVideo.classList.add('active');
            subviewVideo.style.display = "flex";
            break;
            
        case 'perfil':
            navPerfil.classList.add('active');
            subviewPerfil.style.display = "flex";
            break;
            
        default:
            console.error("Ruta no definida en el ecosistema móvil: " + destino);
    }
};

/**
 * 🌊 Lógica del Botón de Pánico: Mantener presionado 3 Segundos
 */
function iniciarPresion(e) {
    e.preventDefault();
    
    // Añadimos clase visual para denotar que se está cargando/presionando
    btnSosRadial.classList.add('presionando');
    
    // Encendemos las olas en señal de carga inicial
    wave1.style.display = "block";
    wave2.style.display = "block";
    wave1.style.animationPlayState = "running";
    wave2.style.animationPlayState = "running";

    // Si ya existía un temporizador activo por error, lo limpiamos
    if (tiempoPresionado) clearTimeout(tiempoPresionado);

    // Disparador tras cumplir estrictamente los 3 segundos continuos
    tiempoPresionado = setTimeout(() => {
        dispararSOSInstitucional();
        finalizarPresion();
    }, DURACION_PRESION);
}

function finalizarPresion() {
    btnSosRadial.classList.remove('presionando');
    if (tiempoPresionado) {
        clearTimeout(tiempoPresionado);
        tiempoPresionado = null;
    }
    
    // Si no se cumplieron los 3 segundos, apagamos las ondas inmediatamente
    if (!toastWhatsapp.classList.contains('mostrar')) {
        wave1.style.display = "none";
        wave2.style.display = "none";
    }
}

// Vinculación de eventos tanto para computadoras (Mouse) como dispositivos móviles (Touch)
if (btnSosRadial) {
    btnSosRadial.addEventListener('mousedown', iniciarPresion);
    btnSosRadial.addEventListener('mouseup', finalizarPresion);
    btnSosRadial.addEventListener('mouseleave', finalizarPresion);

    btnSosRadial.addEventListener('touchstart', iniciarPresion);
    btnSosRadial.addEventListener('touchend', finalizarPresion);
}

/**
 * 📱 Envío Real de Alerta SOS Inclusiva a Supabase (Dashboard Realtime)
 */
async function dispararSOSInstitucional() {
    console.log("🚨 Solicitando coordenadas GPS reales del dispositivo...");

    // Función auxiliar corregida para realizar el INSERT mapeando latitud y longitud obligatorias
    const enviarDatosSupabase = async (textoDireccion, latitudVal, longitudVal) => {
        const { data, error } = await supabaseClient
            .from('alertas_sos')
            .insert([
                {
                    nombre_ciudadano: USUARIO_SESION.nombre,
                    rut_ciudadano: USUARIO_SESION.rut,
                    ubicacion_texto: textoDireccion,
                    latitud: latitudVal,       // ✅ Añadido obligatorio
                    longitud: longitudVal,     // ✅ Añadido obligatorio
                    estado: "CRÍTICO",
                    categoria_tag: "SOS"
                }
            ]);

        if (error) {
            console.error("❌ Error al transmitir a Supabase:", error.message);
            alert("Error de conexión: No se pudo subir el SOS a la base de datos. Detalle: " + error.message);
        } else {
            console.log("🚨 S.O.S. Transmitido de forma conforme a la central CENCO mediante la tabla 'alertas_sos'.");
            ejecutarEfectosVisualesExito();
        }
    };

    // Consultar la API del navegador/móvil para geolocalización exacta
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const ubicacionTexto = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                await enviarDatosSupabase(ubicacionTexto, lat, lon);
            },
            async (error) => {
                console.warn("⚠️ Permiso de GPS denegado o falla de señal. Enviando con ubicación por defecto.");
                const ubicacionTexto = "Ubicación Georreferenciada Manual (Concepción Centro)";
                // Se envían coordenadas por defecto reales (-36.8261, -73.0498) para evitar el crash del NOT NULL
                await enviarDatosSupabase(ubicacionTexto, -36.8261, -73.0498);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        await enviarDatosSupabase("Dispositivo sin soporte de Geolocalización nativa", -36.8261, -73.0498);
    }
}

/**
 * ✨ Feedback visual tras una subida exitosa
 */
function ejecutarEfectosVisualesExito() {
    // Dejar las ondas fijas expandiéndose en señal de enviado permanente
    wave1.style.display = "block";
    wave2.style.display = "block";

    // Levantar la alerta flotante estilo WhatsApp
    toastWhatsapp.classList.add('mostrar');

    // Quitar la alerta automáticamente después de 4 segundos
    setTimeout(() => {
        toastWhatsapp.classList.remove('mostrar');
        // Apagar olas una vez que el mensaje se desvanece por completo
        wave1.style.display = "none";
        wave2.style.display = "none";
    }, 4000);
}