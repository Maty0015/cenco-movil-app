// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://rcoigjmvmcnfzszssmly.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xsL00kSs04gdqOnplNUInA_gGOy-MEP";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- CONFIGURACIÓN DE EMAILJS (HU-10 Contactos de Confianza) ---
const EMAILJS_PUBLIC_KEY = "UPBNyLq76tEngPUeW"; 
const EMAILJS_SERVICE_ID = "service_izwkfux";
const EMAILJS_TEMPLATE_ID = "template_uv62kpd";

if (EMAILJS_PUBLIC_KEY) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// --- CRIPTOGRAFÍA Y SEGURIDAD DE DATOS (Ley 21.719 / Ley 19.628 Chile) ---
const SECURE_STORAGE_KEY = "CencoMovilSecretKeyLaw21719";

function guardarSesionEncriptada(usuario) {
    try {
        const textoPlano = JSON.stringify(usuario);
        const encriptado = CryptoJS.AES.encrypt(textoPlano, SECURE_STORAGE_KEY).toString();
        localStorage.setItem('USUARIO_SESION_SECURE', encriptado);
    } catch (e) {
        console.error("Error al encriptar sesión:", e);
    }
}

function obtenerSesionEncriptada() {
    try {
        const encriptado = localStorage.getItem('USUARIO_SESION_SECURE');
        if (!encriptado) return null;
        const bytes = CryptoJS.AES.decrypt(encriptado, SECURE_STORAGE_KEY);
        const textoPlano = bytes.toString(CryptoJS.enc.Utf8);
        if (!textoPlano) return null;
        return JSON.parse(textoPlano);
    } catch (e) {
        console.error("Error al desencriptar sesión:", e);
        return null;
    }
}

function eliminarSesionEncriptada() {
    localStorage.removeItem('USUARIO_SESION_SECURE');
}

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

// Datos dinámicos del ciudadano (se cargan al iniciar sesión)
let USUARIO_SESION = null;

/**
 * 🔐 Función de Control de Acceso Inicial
 */
window.procesarLoginMovil = async function(event) {
    event.preventDefault();

    const email = document.getElementById('movil-email').value.trim();
    const pass = document.getElementById('movil-pass').value;

    const btnSubmit = event.target.querySelector('button');
    const textoOriginal = btnSubmit.innerText;
    btnSubmit.innerText = "Verificando...";
    btnSubmit.disabled = true;

    try {
        // Consultar el perfil del ciudadano en Supabase
        const { data: usuario, error } = await supabaseClient
            .from('perfiles_ciudadanos')
            .select('*')
            .eq('correo', email)
            .single();

        if (error || !usuario) {
            window.mostrarNotificacionToast("❌", "Error de Acceso", "Usuario no registrado en la base de datos.");
            btnSubmit.innerText = textoOriginal;
            btnSubmit.disabled = false;
            return;
        }

        // Simulación básica de contraseña
        if (pass === 'password123') {
            USUARIO_SESION = usuario; // Asignar la sesión viva
            guardarSesionEncriptada(usuario); // Guardar de forma encriptada (Ley 21719)
            
            wrapperLoginMovil.style.display = "none";
            wrapperPlataformaMovil.style.display = "flex";
            window.navegarApp('sos');
            escucharEstadoAlertasRealtime();
        } else {
            window.mostrarNotificacionToast("🔑", "Contraseña Incorrecta", "La contraseña ingresada es inválida.");
        }
    } catch (err) {
        console.error(err);
        window.mostrarNotificacionToast("🔌", "Error de Red", "No se pudo conectar con el servidor.");
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
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
    // A) Poblar datos del perfil dinámicamente en el DOM
    if (USUARIO_SESION) {
        document.getElementById('perfil-nombre').innerText = USUARIO_SESION.nombre_completo;
        document.getElementById('perfil-rut').innerText = `RUT: ${USUARIO_SESION.rut}`;
        
        const partes = USUARIO_SESION.nombre_completo.split(' ');
        const iniciales = (partes[0] ? partes[0][0] : '') + (partes[1] ? partes[1][0] : '');
        document.getElementById('perfil-avatar').innerText = iniciales.toUpperCase();

        if (document.getElementById('perfil-contacto-nombre')) {
            document.getElementById('perfil-contacto-nombre').value = USUARIO_SESION.contacto_nombre || '';
        }
        if (document.getElementById('perfil-contacto-correo')) {
            document.getElementById('perfil-contacto-correo').value = USUARIO_SESION.contacto_correo || '';
        }
    }

    const contenedor = document.getElementById('historial-sos-lista');
    if (!contenedor) return;

    contenedor.innerHTML = '<p style="color: var(--texto-mutado); font-size: 0.95rem; text-align: center; margin-top: 10px;">Buscando alertas en la central...</p>';

    const { data: alertas, error } = await supabaseClient
        .from('alertas_sos')
        .select('*')
        .eq('rut_ciudadano', USUARIO_SESION ? USUARIO_SESION.rut : '')
        .order('creado_al', { ascending: false });

    if (error) {
        console.error("❌ Error al cargar historial:", error.message);
        contenedor.innerHTML = '<p style="color: #ff4757; font-size: 0.95rem; text-align: center; margin-top: 10px;">Error al cargar historial.</p>';
        return;
    }

    if (!alertas || alertas.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--texto-mutado); font-size: 0.85rem; text-align: center; margin-top: 10px; font-style: italic;">No has emitido reportes de urgencia todavía.</p>';
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
            <div style="background: white; border-radius: 8px; padding: 10px 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: left; width: 100%;">
                <div>
                    <strong style="font-size: 0.85rem; display: block; color: var(--texto-oscuro); margin: 0;">Urgencia - ${fecha} hrs</strong>
                    <span style="font-size: 0.75rem; color: var(--texto-mutado); display: block; margin-top: 2px; word-break: break-all;">📍 ${alert.ubicacion_texto}</span>
                </div>
                <div style="text-align: right; margin-left: 6px;">
                    <span style="background: ${badgeColor}15; color: ${badgeColor}; font-size: 0.7rem; font-weight: bold; padding: 3px 6px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                        <i class="fa-solid ${iconStatus}"></i> ${textEstado}
                    </span>
                </div>
            </div>
        `;
    }).join('');
};

/**
 * 💾 Guardar o Actualizar los datos del Contacto de Confianza en Supabase
 */
window.guardarContactoConfianza = async function(event) {
    event.preventDefault();
    if (!USUARIO_SESION) return;

    const nombre = document.getElementById('perfil-contacto-nombre').value.trim();
    const correo = document.getElementById('perfil-contacto-correo').value.trim();

    if (!nombre || !correo) {
        window.mostrarNotificacionToast("⚠️", "Campos Incompletos", "Completa el nombre y el correo.");
        return;
    }

    const btn = event.target;
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Guardando...";

    try {
        const { error } = await supabaseClient
            .from('perfiles_ciudadanos')
            .update({
                contacto_nombre: nombre,
                contacto_correo: correo
            })
            .eq('rut', USUARIO_SESION.rut);

        if (error) {
            console.error("❌ Error al actualizar contacto:", error.message);
            window.mostrarNotificacionToast("❌", "Error al Guardar", "No se pudieron guardar los datos.");
        } else {
            // Actualizar en el modelo local en caliente
            USUARIO_SESION.contacto_nombre = nombre;
            USUARIO_SESION.contacto_correo = correo;
            guardarSesionEncriptada(USUARIO_SESION); // ✅ Guardar cambios de forma encriptada (Ley 21719)
            window.mostrarNotificacionToast("💾", "Contacto Actualizado", "Red de apoyo guardada correctamente.");
        }
    } catch (err) {
        console.error(err);
        window.mostrarNotificacionToast("🔌", "Error de Red", "Falla de red al intentar guardar.");
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
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
                    const mensajePatrulla = payload.new.patrulla_asignada 
                        ? `La patrulla ${payload.new.patrulla_asignada} va en camino a tu ubicación.`
                        : "Carabineros va en camino a tu ubicación.";
                    window.mostrarNotificacionToast("🚓", "Carabineros en Camino", mensajePatrulla);
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
    if (!USUARIO_SESION) {
        window.mostrarNotificacionToast("⚠️", "Sin Sesión", "Inicia sesión para reportar una emergencia.");
        return;
    }
    console.log("🚨 Solicitando coordenadas GPS reales del dispositivo...");

    // Función auxiliar corregida para realizar el INSERT mapeando latitud y longitud obligatorias
    const enviarDatosSupabase = async (textoDireccion, latitudVal, longitudVal) => {
        const { data, error } = await supabaseClient
            .from('alertas_sos')
            .insert([
                {
                    nombre_ciudadano: USUARIO_SESION.nombre_completo,
                    rut_ciudadano: USUARIO_SESION.rut,
                    ubicacion_texto: textoDireccion,
                    latitud: latitudVal,       
                    longitud: longitudVal,     
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
            notificarContactoConfianzaRealtime(latitudVal, longitudVal); // ✅ Llamar al despachador de correos
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
    window.mostrarNotificacionToast("🚨", "Urgencia Transmitida", "Alerta enviada correctamente a la central", true);

    // Quitar las ondas de radio después de 5 segundos
    setTimeout(() => {
        wave1.style.display = "none";
        wave2.style.display = "none";
    }, 5000);
}

/**
 * ✉️ Notificar al contacto de confianza vía EmailJS (o simulación reactiva si no hay llave)
 */
async function notificarContactoConfianzaRealtime(latitud, longitud) {
    if (!USUARIO_SESION || !USUARIO_SESION.contacto_correo) {
        console.warn("⚠️ No se puede enviar notificación: contacto de confianza sin correo configurado.");
        return;
    }

    const nombreContacto = USUARIO_SESION.contacto_nombre;
    const correoContacto = USUARIO_SESION.contacto_correo;
    const mapsLink = `https://maps.google.com/?q=${latitud},${longitud}`;

    // Si el usuario configuró su clave pública de EmailJS, disparamos el envío real
    if (EMAILJS_PUBLIC_KEY) {
        console.log(`✉️ Enviando correo real de emergencia a ${correoContacto}...`);
        try {
            const templateParams = {
                to_name: nombreContacto,
                to_email: correoContacto,
                from_name: USUARIO_SESION.nombre_completo,
                maps_link: mapsLink,
                latitud: latitud,
                longitud: longitud
            };

            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log("✅ Correo de emergencia enviado con éxito vía EmailJS.");
            
            // Mostrar confirmación visual al usuario en su celular
            setTimeout(() => {
                window.mostrarNotificacionToast("✉️", "Contacto Notificado", `Se envió un email de alerta a ${nombreContacto}.`);
            }, 3000);
        } catch (err) {
            console.error("❌ Error al enviar correo de emergencia con EmailJS:", err);
            window.mostrarNotificacionToast("⚠️", "Falla de Notificación", "No se pudo despachar el correo de alerta.");
        }
    } else {
        // MODO SIMULACIÓN (Si no han configurado la clave de EmailJS)
        console.log(`✉️ [SIMULACIÓN NOTIFICACIÓN] Enviando correo de alerta de emergencia...`);
        console.log(`   Destinatario: ${nombreContacto} (${correoContacto})`);
        console.log(`   Mensaje: "¡Alerta de Urgencia! ${USUARIO_SESION.nombre_completo} ha reportado una urgencia. Ubicación GPS: ${mapsLink}"`);
        
        // Simular latencia de red para que se sienta real
        setTimeout(() => {
            window.mostrarNotificacionToast("✉️", "Contacto Notificado", `Simulado: Email de alerta enviado a ${nombreContacto}.`);
        }, 3000);
    }
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

// ==========================================
// 🗂️ LÓGICA DE REPORTAR DELITOS MENORES (HU-MOCK FIGMA)
// ==========================================

const CRIMES_LIST = [
    {
        id: "robo-sorpresa",
        title: "Robo por sorpresa (Lanzazo)",
        icon: "fa-mobile-screen-button",
        bgColor: "#fee2e2",
        iconColor: "#ef4444",
        description: "Sustracción repentina de sus pertenencias (como celular o cartera) sin violencia física directa, aprovechando el descuido.",
        thumb: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "hurto",
        title: "Hurto (Sin violencia)",
        icon: "fa-briefcase",
        bgColor: "#ffedd5",
        iconColor: "#f97316",
        description: "Sustracción de bienes sin que usted se dé cuenta en el momento, sin uso de fuerza o intimidación.",
        thumb: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "danos",
        title: "Daños a vehículo/propiedad",
        icon: "fa-car",
        bgColor: "#fef3c7",
        iconColor: "#d97706",
        description: "Destrucción, rotura o perjuicio causado intencionalmente a su vehículo, casa o pertenencias.",
        thumb: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "estafa",
        title: "Estafa o engaño",
        icon: "fa-circle-question",
        bgColor: "#fef9c3",
        iconColor: "#ca8a04",
        description: "Engaño para obtener dinero o bienes de su propiedad, ya sea en persona, por internet o por teléfono.",
        thumb: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "perdida",
        title: "Pérdida de documentos",
        icon: "fa-file-circle-xmark",
        bgColor: "#dbeafe",
        iconColor: "#2563eb",
        description: "Extravío de cédula de identidad, pasaporte, tarjetas bancarias u otros documentos importantes.",
        thumb: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "amenazas",
        title: "Amenazas",
        icon: "fa-shield-halved",
        bgColor: "#f3e8ff",
        iconColor: "#9333ea",
        description: "Alguien le ha advertido con causarle daño a usted, a su familia o a sus bienes.",
        thumb: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "alcohol",
        title: "Consumo alcohol en calle",
        icon: "fa-beer-mug-empty",
        bgColor: "#ccfbf1",
        iconColor: "#0d9488",
        description: "Personas bebiendo alcohol en la vía pública o espacios no habilitados, generando inseguridad.",
        thumb: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: "comercio",
        title: "Comercio ilegal",
        icon: "fa-shop",
        bgColor: "#e0f7fa",
        iconColor: "#00acc1",
        description: "Venta de productos en la calle sin permiso, bloqueando el paso o vendiendo artículos robados.",
        thumb: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=60"
    }
];

let selectedCrimeObj = null;
let simulatedVideoFile = null;

window.abrirDrawerDelitoMenor = function() {
    selectedCrimeObj = null;
    simulatedVideoFile = null;

    // Apagar cámara si estaba encendida
    window.detenerStreamingCamara();

    // Reiniciar inputs y estilos
    document.getElementById('crime-descripcion-texto').value = "";
    
    // Ocultar cámaras y previsualizaciones
    document.getElementById('camera-record-container').style.display = "none";
    document.getElementById('camera-live-stream').style.display = "none";
    document.getElementById('camera-playback-preview').style.display = "none";
    document.getElementById('btn-camera-action').style.display = "none";
    document.getElementById('txt-video-status').innerText = "Ningún video seleccionado o grabado";

    const btnToggle = document.getElementById('btn-camera-toggle');
    btnToggle.style.background = "#f0fdf4";
    btnToggle.style.color = "var(--verde-carabinero)";
    document.getElementById('lbl-camera-toggle').innerText = "Grabar Señas en Vivo";

    // Setear cabecera del drawer
    document.getElementById('drawer-titulo').innerText = "Seleccionar Delito";
    document.getElementById('drawer-subtitulo').innerText = "¿Qué tipo de incidente desea reportar?";

    // Intercambiar vistas internas
    document.getElementById('view-lista-delitos').style.display = "grid";
    document.getElementById('view-formulario-delito').style.display = "none";

    // Pintar la lista de delitos en el grid
    const grid = document.getElementById('view-lista-delitos');
    grid.innerHTML = CRIMES_LIST.map(crime => `
        <button onclick="window.seleccionarDelito('${crime.id}')" class="crime-card">
            <div class="crime-card-icon" style="background: ${crime.bgColor}; color: ${crime.iconColor};">
                <i class="fa-solid ${crime.icon}"></i>
            </div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--texto-oscuro); height: 32px; display: flex; align-items: center; justify-content: center; line-height: 1.2;">
                ${crime.title}
            </span>
        </button>
    `).join('');

    // Mostrar el drawer (efectos visuales)
    document.getElementById('drawer-delitos-menores').classList.add('mostrar');
};

window.cerrarDrawerDelitoMenor = function() {
    window.detenerStreamingCamara();
    document.getElementById('drawer-delitos-menores').classList.remove('mostrar');
};

window.cerrarDrawerDelitoMenorExterno = function(e) {
    if (e.target.id === 'drawer-delitos-menores') {
        window.cerrarDrawerDelitoMenor();
    }
};

window.seleccionarDelito = function(id) {
    const crime = CRIMES_LIST.find(c => c.id === id);
    if (!crime) return;

    selectedCrimeObj = crime;

    // Cambiar títulos
    document.getElementById('drawer-titulo').innerText = crime.title;
    document.getElementById('drawer-subtitulo').innerText = "Complete los detalles del reporte";

    // Ocultar lista y mostrar formulario
    document.getElementById('view-lista-delitos').style.display = "none";
    document.getElementById('view-formulario-delito').style.display = "flex";

    // Cargar metadatos
    document.getElementById('crime-video-thumb').src = crime.thumb;
    document.getElementById('crime-detalles-desc').innerText = crime.description;
};

// --- CONTROLADORES DE GRABACIÓN DE CÁMARA EN VIVO (Alternativa A) ---
let mediaRecorderInstance = null;
let recordedChunks = [];
let cameraStreamInstance = null;
let recordingTimerInterval = null;
let recordingSeconds = 0;
let isRecordingActive = false;

window.toggleCameraRecording = async function() {
    const container = document.getElementById('camera-record-container');
    const liveStream = document.getElementById('camera-live-stream');
    const playbackPreview = document.getElementById('camera-playback-preview');
    const btnToggle = document.getElementById('btn-camera-toggle');
    const lblToggle = document.getElementById('lbl-camera-toggle');
    const btnAction = document.getElementById('btn-camera-action');
    const statusTxt = document.getElementById('txt-video-status');

    // Si la cámara ya está activa, la apagamos
    if (cameraStreamInstance) {
        window.detenerStreamingCamara();
        container.style.display = "none";
        btnAction.style.display = "none";
        btnToggle.style.background = "#f0fdf4";
        btnToggle.style.color = "var(--verde-carabinero)";
        lblToggle.innerText = "Grabar Señas en Vivo";
        return;
    }

    // Encender cámara
    try {
        console.log("📹 Encendiendo cámara...");
        // Restricciones de baja resolución y desactivación de audio (ideal para LSCh de bajo peso)
        const constraints = {
            video: {
                width: { ideal: 480 },
                height: { ideal: 360 },
                frameRate: { ideal: 15 }
            },
            audio: false // Sin audio = pesa 80% menos
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStreamInstance = stream;
        liveStream.srcObject = stream;
        liveStream.style.display = "block";
        playbackPreview.style.display = "none";
        container.style.display = "flex";

        // Mostrar controles de grabación
        btnAction.style.display = "flex";
        btnAction.style.background = "#ef4444";
        btnAction.innerHTML = '<i class="fa-solid fa-circle"></i> Iniciar Grabación';
        btnAction.dataset.state = "idle";

        // Estilos del toggle
        btnToggle.style.background = "#f1f5f9";
        btnToggle.style.color = "#475569";
        lblToggle.innerText = "Apagar Cámara";

        statusTxt.innerText = "Cámara lista. Posiciónese frente a la cámara.";
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        window.mostrarNotificacionToast("❌", "Permiso de Cámara", "No se pudo acceder a la cámara: " + err.message);
    }
};

window.detenerStreamingCamara = function() {
    if (cameraStreamInstance) {
        cameraStreamInstance.getTracks().forEach(track => track.stop());
        cameraStreamInstance = null;
    }
    if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
    }
    const badge = document.getElementById('recording-badge');
    if (badge) badge.style.display = "none";
    isRecordingActive = false;
};

window.handleCameraAction = function() {
    const btnAction = document.getElementById('btn-camera-action');
    const state = btnAction.dataset.state;

    if (state === "idle") {
        window.iniciarGrabacionSeñas();
    } else if (state === "recording") {
        window.detenerGrabacionSeñas();
    } else if (state === "recorded") {
        window.resetearGrabacionSeñas();
    }
};

window.iniciarGrabacionSeñas = function() {
    if (!cameraStreamInstance) return;

    recordedChunks = [];
    isRecordingActive = true;
    recordingSeconds = 0;

    // Configurar mimeTypes compatibles
    let options = { mimeType: 'video/webm;codecs=vp8' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
    }

    try {
        mediaRecorderInstance = new MediaRecorder(cameraStreamInstance, options);
    } catch (e) {
        console.error("MediaRecorder no soportó formatos específicos, usando por defecto:", e);
        mediaRecorderInstance = new MediaRecorder(cameraStreamInstance);
    }

    mediaRecorderInstance.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorderInstance.onstop = function() {
        const mimeType = mediaRecorderInstance.mimeType || 'video/webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        
        // Crear archivo real de bajo peso
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        simulatedVideoFile = new File([blob], `video_delito_${Date.now()}.${extension}`, { type: mimeType });

        const sizeInMb = (simulatedVideoFile.size / (1024 * 1024)).toFixed(2);
        
        // Mostrar vista previa grabada
        const playbackPreview = document.getElementById('camera-playback-preview');
        const liveStream = document.getElementById('camera-live-stream');
        
        liveStream.style.display = "none";
        playbackPreview.src = URL.createObjectURL(blob);
        playbackPreview.style.display = "block";

        // Actualizar estados de botones
        const btnAction = document.getElementById('btn-camera-action');
        btnAction.dataset.state = "recorded";
        btnAction.style.background = "#f97316"; // Naranja re-grabar
        btnAction.innerHTML = '<i class="fa-solid fa-rotate"></i> Volver a Grabar';

        const statusTxt = document.getElementById('txt-video-status');
        statusTxt.innerHTML = `✓ Señas grabadas con éxito (${sizeInMb} MB)`;
        window.mostrarNotificacionToast("📹", "Grabación Lista", `Se grabaron ${recordingSeconds} segundos de señas (${sizeInMb} MB).`);

        // Apagar el stream de la cámara (para liberar hardware)
        if (cameraStreamInstance) {
            cameraStreamInstance.getTracks().forEach(track => track.stop());
            cameraStreamInstance = null;
        }
    };

    // Comenzar grabación
    mediaRecorderInstance.start(100); // Guardar datos cada 100ms
    
    const btnAction = document.getElementById('btn-camera-action');
    btnAction.dataset.state = "recording";
    btnAction.style.background = "#1e293b"; // Gris oscuro
    btnAction.innerHTML = '<i class="fa-solid fa-square"></i> Detener Grabación';

    // Mostrar temporizador
    const badge = document.getElementById('recording-badge');
    const timerText = document.getElementById('recording-timer');
    badge.style.display = "flex";
    timerText.innerText = "0s";

    recordingTimerInterval = setInterval(() => {
        recordingSeconds++;
        timerText.innerText = `${recordingSeconds}s`;

        // Detener automáticamente a los 15 segundos para evitar archivos pesados
        if (recordingSeconds >= 15) {
            window.detenerGrabacionSeñas();
        }
    }, 1000);
};

window.detenerGrabacionSeñas = function() {
    if (mediaRecorderInstance && mediaRecorderInstance.state !== "inactive") {
        mediaRecorderInstance.stop();
    }
    if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
    }
    const badge = document.getElementById('recording-badge');
    if (badge) badge.style.display = "none";
    isRecordingActive = false;
};

window.resetearGrabacionSeñas = async function() {
    // Limpiar archivo previo
    simulatedVideoFile = null;
    document.getElementById('txt-video-status').innerText = "Ningún video seleccionado o grabado";
    
    // Volver a activar cámara
    await window.toggleCameraRecording(); // apaga si estuviera encendido (no lo está)
    await window.toggleCameraRecording(); // enciende de nuevo
};

window.enviarReporteDelitoMenor = async function(e) {
    e.preventDefault();
    if (!USUARIO_SESION) return;
    if (!selectedCrimeObj) return;

    const descripcion = document.getElementById('crime-descripcion-texto').value.trim();

    if (!descripcion && !simulatedVideoFile) {
        window.mostrarNotificacionToast("⚠️", "Reporte Incompleto", "Escribe una descripción o sube un video.");
        return;
    }

    const btn = document.getElementById('btn-enviar-delito');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Transmitiendo...";

    const enviarDatosDelito = async (textoDireccion, latitudVal, longitudVal) => {
        let urlPublicoVideo = null;

        // Subir el archivo real si existe
        if (simulatedVideoFile && simulatedVideoFile instanceof File) {
            console.log("☁️ Subiendo video real a Supabase Storage...", simulatedVideoFile.name);
            const fileExt = simulatedVideoFile.name.split('.').pop();
            const fileName = `video_delito_${Date.now()}.${fileExt}`;
            const filePath = `${USUARIO_SESION.rut}/${fileName}`;

            try {
                const { data, error: uploadError } = await supabaseClient.storage
                    .from('videos-delitos')
                    .upload(filePath, simulatedVideoFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("❌ Error de subida a Storage:", uploadError.message);
                    window.mostrarNotificacionToast("⚠️", "Error de Nube", "Storage: " + uploadError.message);
                    btn.disabled = false;
                    btn.innerText = originalText;
                    return; // Detener flujo para no subir reporte sin el video real
                } else {
                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('videos-delitos')
                        .getPublicUrl(filePath);
                    urlPublicoVideo = publicUrl;
                    console.log("✅ Video subido con éxito a la nube:", urlPublicoVideo);
                }
            } catch (err) {
                console.error("❌ Falla en la subida a Storage:", err);
                window.mostrarNotificacionToast("❌", "Falla de Conexión", "Falla de red: " + err.message);
                btn.disabled = false;
                btn.innerText = originalText;
                return;
            }
        }

        const descTexto = descripcion || "(Explicado en video de señas)";
        const videoInfo = urlPublicoVideo 
            ? ` 📹 [Video: ${urlPublicoVideo}]` 
            : (simulatedVideoFile ? ` 📹 [Video Local: ${simulatedVideoFile.name || simulatedVideoFile}]` : "");
        
        const detalleCompleto = `${textoDireccion} | Delito: ${selectedCrimeObj.title} | Detalle: ${descTexto}${videoInfo}`;

        const { error } = await supabaseClient
            .from('alertas_sos')
            .insert([
                {
                    nombre_ciudadano: USUARIO_SESION.nombre_completo,
                    rut_ciudadano: USUARIO_SESION.rut,
                    ubicacion_texto: detalleCompleto,
                    latitud: latitudVal,
                    longitud: longitudVal,
                    estado: "PENDIENTE",
                    categoria_tag: selectedCrimeObj.id.toUpperCase()
                }
            ]);

        if (error) {
            console.error("❌ Error al transmitir delito menor:", error.message);
            window.mostrarNotificacionToast("❌", "Error al transmitir", "No se pudo conectar con la central.");
        } else {
            console.log("🚨 Reporte de Delito Menor transmitido con éxito.");
            window.mostrarNotificacionToast("✅", "Reporte Enviado", "Tu reporte fue recibido en la Central CENCO.");
            window.cerrarDrawerDelitoMenor();

            const subviewPerfilActivo = document.getElementById('subview-perfil');
            if (subviewPerfilActivo && subviewPerfilActivo.style.display === 'flex') {
                window.cargarHistorialAlertasCiudadano();
            }
        }
    };

    // Consultar geolocalización
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const ubicacionTexto = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                await enviarDatosDelito(ubicacionTexto, lat, lon);
                btn.disabled = false;
                btn.innerText = originalText;
            },
            async (error) => {
                console.warn("⚠️ Sin GPS para delito menor. Enviando ubicación por defecto.");
                await enviarDatosDelito("Ubicación Georreferenciada Manual (Concepción Centro)", -36.8261, -73.0498);
                btn.disabled = false;
                btn.innerText = originalText;
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        await enviarDatosDelito("Ubicación por defecto (Sin soporte GPS)", -36.8261, -73.0498);
        btn.disabled = false;
        btn.innerText = originalText;
    }
};

/**
 * 📹 Procesar archivo de video real seleccionado por el ciudadano
 */
window.procesarArchivoVideo = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    simulatedVideoFile = file; // Guardar el objeto File real

    // Mostrar tamaño en MB legible
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    
    const uploadBtn = document.getElementById('btn-crime-upload-video');
    uploadBtn.style.border = "2px solid #10b981";
    uploadBtn.style.background = "#f0fdf4";
    uploadBtn.style.color = "#10b981";
    document.getElementById('txt-video-status').innerHTML = `<i class="fa-solid fa-circle-check"></i> Archivo: ${file.name.substring(0, 20)}... (${sizeInMb} MB)`;

    window.mostrarNotificacionToast("📹", "Video Adjunto", "El archivo de video está cargado y listo para enviarse.");
};

/**
 * 🔑 Cerrar Sesión del Ciudadano
 */
window.cerrarSesionMovil = function() {
    eliminarSesionEncriptada();
    USUARIO_SESION = null;
    
    // Ocultar plataforma y mostrar login
    wrapperPlataformaMovil.style.display = "none";
    wrapperLoginMovil.style.display = "flex";
    
    // Limpiar inputs
    document.getElementById('movil-email').value = "";
    document.getElementById('movil-pass').value = "";
    
    window.mostrarNotificacionToast("🔑", "Sesión Cerrada", "Has cerrado tu sesión con éxito.");
};

// Verificar si hay una sesión guardada en localStorage al cargar la app (Ley 21719 descifrado)
window.addEventListener('DOMContentLoaded', () => {
    const usuarioRecuperado = obtenerSesionEncriptada();
    if (usuarioRecuperado) {
        try {
            USUARIO_SESION = usuarioRecuperado;
            console.log("🔐 Sesión encriptada recuperada y descifrada con éxito:", USUARIO_SESION);
            
            // Saltar login e ingresar directo a la sección S.O.S.
            wrapperLoginMovil.style.display = "none";
            wrapperPlataformaMovil.style.display = "flex";
            window.navegarApp('sos');
            escucharEstadoAlertasRealtime();
        } catch (e) {
            console.error("Error al restaurar sesión:", e);
            eliminarSesionEncriptada();
        }
    }
});