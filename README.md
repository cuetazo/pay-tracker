# 💳 Pay Tracker — Monorepo

¡Bienvenido a **Pay Tracker**! Un ecosistema moderno, inteligente y automatizado para el seguimiento y gestión de tus finanzas personales. Este proyecto está estructurado como un monorrepositorio que integra una aplicación móvil multiplataforma, base de datos local y en la nube, flujos de automatización mediante **n8n**, un gateway de Nginx y servicios de backend.

---

## 📂 Estructura del Proyecto (Monorepo)

Este repositorio contiene los siguientes módulos principales:

*   **`tracker-pay/`**: Aplicación móvil híbrida desarrollada con **Expo (React Native)** y TypeScript.
*   **`backend/`**: Plantilla/estructura reservada para servicios API personalizados (Node.js/Python).
*   **`listener_service/`**: Servicio en segundo plano diseñado para escuchar eventos, correos, SMS o integraciones financieras.
*   **`compose.yml` & `nginx.conf`**: Configuración de contenedores con Docker Compose y gateway inverso Nginx para orquestar la base de datos local, n8n y enrutamiento Webhook.
*   **`docs/`**: Documentación oficial del proyecto, incluyendo el Roadmap, Historias de Usuario (HU), Backlog de producto y matrices de control.

---

## 🚀 Tecnologías Principales

### Móvil / Frontend (`tracker-pay`)
*   **Expo / React Native**: Desarrollo ágil para iOS y Android.
*   **TypeScript**: Tipado estático seguro.
*   **Expo Router**: Sistema de navegación basado en archivos (`(auth)`, `(onboarding)`, `(tabs)`, `(modal)`).
*   **Zustand**: Gestión de estado ágil e intuitiva (e.g., `authStore`, `themeStore`, `modalStore`).
*   **Supabase**: Backend serverless que maneja autenticación de usuarios y base de datos relacional en la nube.
*   **Expo Image**: Carga optimizada de avatares e imágenes.
*   **Tailwind CSS (NativeWind)**: Estilizado visual modular y adaptativo.

### Infraestructura local (`compose.yml`)
*   **Docker & Docker Compose**: Orquestación simplificada de servicios con un solo comando.
*   **Nginx (API Gateway)**: Enrutamiento seguro y reverse proxy para tráfico local y webhooks.
*   **n8n**: Automatización de flujos de trabajo (Workflows) e integración con plataformas externas de mensajería o banca.
*   **PostgreSQL 15**: Base de datos relacional persistente para almacenamiento local o integración de n8n.

---

## ✨ Características Destacadas

1.  **Onboarding Guiado**: Proceso de bienvenida donde los nuevos usuarios definen su saldo inicial y sus límites máximos de consumo mensual.
2.  **Dashboard Completo (Home)**: Visualiza el saldo disponible, total de egresos e ingresos, el progreso de tu límite de consumo mensual y las transacciones más recientes.
3.  **Gestión de Transacciones**: Historial interactivo con categorización dinámica de consumos y creación/edición de presupuestos.
4.  **Perfil Personalizable (`account.tsx`)**:
    *   **Edición en caliente**: Permite actualizar el saldo actual y el límite de gasto directamente con modales interactivos e integrados con Supabase.
    *   **Dark Mode Global**: Selector de tema oscuro 100% funcional que actualiza toda la interfaz, incluyendo la barra de navegación de pestañas (tab bar).
    *   **Autenticación segura**: Cierre de sesión y protección de rutas mediante Supabase Auth.
5.  **Automatización e Integraciones (n8n)**: Webhooks expuestos mediante el gateway Nginx (`/webhook/` y `/webhook-test/`) para recibir notificaciones en tiempo real.

---

## 🛠️ Guía de Instalación y Uso

### Requisitos Previos
*   [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
*   [Docker](https://www.docker.com/) y **Docker Compose**
*   Una cuenta de [Supabase](https://supabase.com/) con un proyecto activo (para la base de datos y autenticación en la nube).

---

### Paso 1: Configurar la Infraestructura Local

1. En la raíz del repositorio, inicia los contenedores de Docker (Nginx, PostgreSQL y n8n):
   ```bash
   docker compose up -d
   ```
2. Una vez completado, los servicios estarán disponibles en las siguientes direcciones de tu máquina local:
   *   **API Gateway (Nginx)**: `http://localhost:80` (enrutará las llamadas `/webhook/` y `/n8n/`).
   *   **n8n Workspace**: `http://localhost:5678` (usuario: `admin` / contraseña: `admin`).
   *   **PostgreSQL**: `localhost:5432` (Base de datos: `tracker`, usuario: `user`, contraseña: `password`).

---

### Paso 2: Configurar y Ejecutar la Aplicación Móvil (`tracker-pay`)

1. Navega a la carpeta de la aplicación móvil:
   ```bash
   cd tracker-pay
   ```
2. Instala todas las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `tracker-pay/` siguiendo el formato que se muestra a continuación:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto-supabase.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
   ```
4. Inicia el servidor de desarrollo de Expo:
   ```bash
   npm start
   ```
   *   *Tip*: Puedes presionar `a` para emulador de Android, `i` para simulador de iOS o escanear el código QR con la app **Expo Go** en tu dispositivo móvil.

---

## 🗺️ Documentación y Planificación (`docs/`)

En la carpeta [docs/](file:///c:/Users/Jhona/Documents/GitHub/pay-tracker/docs) se encuentran los artefactos metodológicos y técnicos del desarrollo:

*   **`HU- Pay Tracker.pdf`**: Documentación de las Historias de Usuario con sus respectivos criterios de aceptación.
*   **`Backlog Pay Tracker.pdf`**: Lista priorizada de características del producto.
*   **`RoadMap PayTracker.pdf`**: La planeación cronológica e hitos de entrega del desarrollo.
*   **`TCSM - GRUPO 06.xlsx`**: Matriz de seguimiento, control y tareas del equipo de trabajo.

---

## 👥 Contribuciones y Desarrollo

1. Asegúrate de crear una rama descriptiva para cada nueva característica (`feature/nombre-de-la-caracteristica`).
2. Sigue las buenas prácticas de React Native / TypeScript.
3. Para cualquier ajuste en la API Gateway, edita el archivo `nginx.conf` y reinicia el contenedor de Nginx (`docker compose restart api_gateway`).

---

¡Gracias por usar y colaborar en **Pay Tracker**! 🚀
