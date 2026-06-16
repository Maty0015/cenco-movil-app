// --- CONEXIÓN LIMPIA A SUPABASE ---
const SUPABASE_URL = "https://zxeslmngcrqtbolfkbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5tU3B4kVQOBGy0pkXYhgcQ_iXi21B4O";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- FUNCIÓN DE LOGIN EXCLUSIVA ---
window.testLoginPasoAPaso = async function(e) {
    e.preventDefault(); // EVITA QUE LA PÁGINA SE RECARGUE EN VERCEL
    
    const emailStr = document.getElementById('app-email').value.trim();
    const passwordStr = document.getElementById('app-pass').value.trim();

    alert("Paso 1: Conectando a Supabase para verificar a: " + emailStr);

    try {
        const { data: ciudadanos, error } = await supabase
            .from('perfiles_ciudadanos')
            .select('*')
            .eq('email', emailStr)
            .eq('contrasena_plana', passwordStr);

        if (error) {
            alert("Error devuelto por Supabase: " + error.message);
            return;
        }

        if (ciudadanos && ciudadanos.length > 0) {
            // LOGIN CORRECTO
            alert("¡ÉXITO TOTAL! Base de datos conectada. Encontrado el usuario: " + ciudadanos[0].nombre_completo);
        } else {
            // LOGIN INCORRECTO
            alert("Supabase respondió, pero NO encontró ese usuario o la contraseña está mal puesta.");
        }

    } catch (err) {
        alert("Error crítico al intentar la consulta: " + err.message);
    }
};