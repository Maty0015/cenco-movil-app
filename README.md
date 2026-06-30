# 📱 Cenco Móvil - Canal de Emergencia Inclusivo

Aplicación móvil híbrida para el canal ciudadano inclusivo de **Carabineros de Chile**, desarrollada con tecnologías web estándar e integrada a entornos móviles nativos de Android mediante **Capacitor CLI** y **Android Studio**.

---

## 🚀 Funcionalidades Clave

1. **Botón de Pánico Radial (S.O.S):**
   * Disparo radial por pulsación continua de 3 segundos para prevenir llamadas accidentales.
   * Transmite geolocalización GPS exacta de latitud y longitud hacia la central de emergencias.
2. **Chat CENCO en Tiempo Real:**
   * Canal de mensajería instantáneo interactivo enlazado a la emergencia activa.
   * **Burbujas y Mensajes Rápidos:** Panel inclusivo con chips predefinidos para personas sordas (*"Agresor cerca"*, *"Vengan rápido"*, *"Estoy asustado"*), evitando la necesidad de digitar bajo tensión.
   * **Bloqueo de Chat:** El chat se activa al disparar el S.O.S. y se bloquea y archiva inmediatamente al marcar el procedimiento como resuelto en la central.
3. **Persistencia y Seguridad (Ley N° 21.719):**
   * Guardado de sesión de usuario encriptado de forma local (`CryptoJS.AES`) para proteger los datos personales del ciudadano.
   * Validación dinámica de contraseñas de acceso consultando los perfiles de la base de datos de Supabase.

---

## 🛠️ Arquitectura del Proyecto

```
cenco-movil-app/
├── www/                       # Cascarón web interactivo (Frontend)
│   ├── index.html             # Interfaz semántica con Viewport táctil y Chat
│   ├── style.css              # Estilos CSS, variables de colores y animación SOS
│   └── app.js                 # Control de vistas, Supabase Realtime y Chat
├── android/                   # Proyecto nativo compilado (Android Studio)
├── capacitor.config.json      # Configuración de enlace de Capacitor CLI
└── package.json               # Dependencias del ecosistema NodeJS y Capacitor
```

---

## ⚡ Instrucciones de Instalación y Ejecución

Para empaquetar, compilar y sincronizar la aplicación con tu dispositivo o emulador Android:

### 1. Instalación de Dependencias
Abre la consola en la carpeta de la app móvil e instala las dependencias de Capacitor:
```bash
cd cenco-movil-app
npm install
```

### 2. Sincronizar Cambios Web con Android
Cada vez que realices cambios en los archivos dentro de la carpeta `www/`, debes sincronizarlos con la build nativa de Android Studio ejecutando:
```bash
npx cap sync android
```

### 3. Ejecución en Dispositivo / Emulador
Para abrir el proyecto en la suite de Android Studio y correr el emulador (Pixel 8 u otro):
```bash
npx cap open android
```
* **En Android Studio:**
  1. Espera a que termine la sincronización de Gradle.
  2. Haz clic en el botón superior **Run (Play)** para instalar y ejecutar el APK nativo en tu teléfono o emulador virtual.

---

## 🔑 Credenciales de Prueba

* **Usuario 1:** `juan.perez@email.com` / `password123`
* **Usuario 2:** `maria.gonzalez@email.com` / `password123`