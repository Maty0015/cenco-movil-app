// --- CONFIGURACIÓN E INICIALIZACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://rcoigjmvmcnfzszssmly.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xsL00kSs04gdqOnplNUInA_gGOy-MEP";

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
        escucharEstadoAlertasRealtime();
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
            window.cargarHistorialAlertasCiudadano();
            break;
            
        default:
            console.error("Ruta no definida en el ecosistema móvil: " + destino);
    }
};

/**
 * 📋 Consultar y Renderizar el Historial de Alertas del Ciudadano desde Supabase
 */
window.cargarHistorialAlertasCiudadano = async function() {
    const contenedor = document.getElementById('historial-sos-lista');
    if (!contenedor) return;

    contenedor.innerHTML = '<p style="color: var(--texto-mutado); font-size: 0.9rem; text-align: center; margin-top: 10px;">Buscando alertas en la central...</p>';

    const { data: alertas, error } = await supabaseClient
        .from('alertas_sos')
        .select('*')
        .eq('rut_ciudadano', USUARIO_SESION.rut)
        .order('creado_al', { ascending: false });

    if (error) {
        console.error("❌ Error al cargar historial:", error.message);
        contenedor.innerHTML = '<p style="color: #ff4757; font-size: 0.9rem; text-align: center; margin-top: 10px;">Error al cargar historial.</p>';
        return;
    }

    if (!alertas || alertas.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--texto-mutado); font-size: 0.9rem; text-align: center; margin-top: 20px; font-style: italic;">No has emitido alertas S.O.S. todavía.</p>';
        return;
    }

    contenedor.innerHTML = alertas.map(alert => {
        let badgeColor = '#ff4757'; // Rojo (Crítico)
        let textEstado = 'Enviado';
        let iconStatus = 'fa-circle-exclamation';

        if (alert.estado === 'EN ATENCION') {
            badgeColor = '#3b82f6'; // Azul
            textEstado = 'Carabineros en camino';
            iconStatus = 'fa-truck-medical';
        } else if (alert.estado === 'RESUELTO') {
            badgeColor = '#10b981'; // Verde
            textEstado = 'Resuelto';
            iconStatus = 'fa-circle-check';
        }

        const fecha = new Date(alert.creado_al).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

        return `
            <div style="background: white; border-radius: 8px; padding: 12px 15px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: left; width: 100%;">
                <div>
                    <strong style="font-size: 0.9rem; display: block; color: var(--texto-oscuro); margin: 0;">S.O.S. - ${fecha} hrs</strong>
                    <span style="font-size: 0.8rem; color: var(--texto-mutado); display: block; margin-top: 3px; word-break: break-all;">📍 ${alert.ubicacion_texto}</span>
                </div>
                <div style="text-align: right; margin-left: 8px;">
                    <span style="background: ${badgeColor}15; color: ${badgeColor}; font-size: 0.75rem; font-weight: bold; padding: 4px 8px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
                        <i class="fa-solid ${iconStatus}"></i> ${textEstado}
                    </span>
                </div>
            </div>
        `;
    }).join('');
};

/**
 * 🔊 Escuchar en Tiempo Real si Carabineros cambia el estado de mis emergencias
 */
function escucharEstadoAlertasRealtime() {
    console.log("🟢 Celular escuchando cambios de estado en tiempo real...");
    
    supabaseClient
        .channel('cambios-estado-ciudadano')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'alertas_sos'
        }, (payload) => {
            // Verificar si el cambio pertenece al RUT del usuario conectado
            if (payload.new.rut_ciudadano === USUARIO_SESION.rut) {
                console.log("🚨 CAMBIO DE ESTADO EN MI ALERTA:", payload.new);
                
                // Mostrar notificación tipo push en la parte superior del cel en lugar de alert() molesto
                if (payload.new.estado === 'EN ATENCION') {
                    window.mostrarNotificacionToast("🚓", "Carabineros en Camino", "Tu S.O.S. fue recibido y una patrulla se dirige al lugar.");
                } else if (payload.new.estado === 'RESUELTO') {
                    window.mostrarNotificacionToast("✅", "Procedimiento Resuelto", "Tu caso de emergencia ha sido cerrado con éxito.");
                }
                
                // Si el ciudadano tiene abierto el perfil, recargar la lista
                const subviewPerfilActivo = document.getElementById('subview-perfil');
                if (subviewPerfilActivo && subviewPerfilActivo.style.display === 'flex') {
                    window.cargarHistorialAlertasCiudadano();
                }
            }
        })
        .subscribe();
}

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

    // Mostrar el toast flotante indicando que el SOS fue enviado
    window.mostrarNotificacionToast("🚨", "S.O.S. Transmitido", "Alerta enviada correctamente a la central", true);

    // Quitar las ondas de radio después de 5 segundos
    setTimeout(() => {
        wave1.style.display = "none";
        wave2.style.display = "none";
    }, 5000);
}

/**
 * 💬 Función genérica para mostrar notificaciones estilo Push / WhatsApp en el dispositivo
 */
window.mostrarNotificacionToast = function(icono, titulo, mensaje, mostrarTicks = false) {
    const toast = document.getElementById('toast-whatsapp');
    const iconBox = document.getElementById('toast-whatsapp-icon');
    const titleBox = document.getElementById('toast-whatsapp-title');
    const bodyBox = document.getElementById('toast-whatsapp-body');

    if (!toast || !iconBox || !titleBox || !bodyBox) return;

    iconBox.innerText = icono;
    titleBox.innerText = titulo;
    
    if (mostrarTicks) {
        bodyBox.innerHTML = `${mensaje} <span class="whatsapp-ticks">✓✓</span>`;
    } else {
        bodyBox.innerHTML = mensaje; // Usar innerHTML para permitir resets
    }

    // Añade clase para deslizar hacia abajo el banner
    toast.classList.add('mostrar');

    // Lo oculta a los 5 segundos automáticamente
    setTimeout(() => {
        toast.classList.remove('mostrar');
    }, 5000);
};