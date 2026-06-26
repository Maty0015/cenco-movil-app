📱 Cenco Móvil - Canal de Emergencia Inclusivo

Aplicación móvil interactiva nativa para el canal ciudadano inclusivo de *Carabineros de Chile*, desarrollada con tecnologías web estándar e integrada a entornos móviles mediante *Capacitor CLI* y *Android Studio*



🛠️ Arquitectura del Proyecto

Cenco-Movil/
├── www/                       # Cascarón web interactivo de la aplicación
│   ├── index.html             # Interfaz semántica y viewports táctiles
│   ├── style.css              # Identidad visual, variables y animaciones
│   └── app.js                 # Enrutador de pestañas y lógica de acceso
├── android/                   # Proyecto nativo compilado (filtrado en .gitignore)
└── capacitor.config.json      # Enlace nativo de Capacitor CLI


Componentes del Código Fuente


1. Interfaz Base (www/index.html)
Viewport Móvil: Configurado con user-scalable=no, maximum-scale=1.0 para deshabilitar el zoom accidental y emular un comportamiento táctil nativo.

Modularidad Dinámica: Estructurado mediante bloques independientes (#wrapper-login-movil y #wrapper-plataforma-movil) controlados por estados del DOM.

Integraciones: Carga Font-Awesome v6.5.1 para iconografía táctil y prepara el SDK de Supabase JS v2 para comunicación persistente en tiempo real.


2. Estilos e Identidad Visual (www/style.css)
Variables Centralizadas (:root): Réplica exacta de la paleta del Dashboard institucional (--verde-carabinero: #004d35, --rojo-critico: #ff4757).

Layout Hermético: Restringe el ancho máximo a 450px con overflow: hidden para asegurar consistencia en pantallas de cualquier tamaño.

Efecto S.O.S.: Define la animación por fotogramas (@keyframes expandirOnda) para simular pulsaciones expansivas de alerta vital en el botón radial.


3. Lógica y Enrutamiento (www/app.js)
Control de Acceso: Valida credenciales fijas de prueba (juan.perez@email.com / password123) transicionando la vista hacia la plataforma interna.

Navegación (Bottom Nav): Enrutador dinámico (window.navegarApp) mediante una estructura switch que conmuta la visibilidad en bloques flex/none para las sub-vistas: Emergencia (S.O.S.), Videollamada LSCh y Mi Perfil.


Despliegue Rápido en Consola (cmd)
Para sincronizar cambios del cascarón web y desplegar el emulador en Android Studio:


# 1. Empaquetar y sincronizar recursos web con el entorno nativo
npx cap sync android

# 2. Desplegar la suite oficial en Android Studio para levantar el Pixel 8
npx cap open android