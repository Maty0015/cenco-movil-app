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