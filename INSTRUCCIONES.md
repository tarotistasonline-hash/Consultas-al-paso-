# Instrucciones de Uso y Despliegue - Natura Conecta AI 🌸

¡Hola! Hemos preparado esta guía paso a paso, escrita de forma simple y directa para que puedas usar o desplegar tu aplicación **Natura Conecta AI**, incluso si no tienes ningún conocimiento técnico.

---

## Opción 1: Usar la versión en la Nube (La más fácil y rápida) 🚀

**¡No necesitas instalar nada ni configurar servidores!** Nosotros ya hemos alojado y configurado la aplicación en los servidores seguros de Google. Está lista y funcionando perfectamente con la base de datos y la inteligencia artificial integrada.

Puedes usar e instrumentar este enlace directo en cualquier celular, tablet o computadora:
👉 **[Enlace de la Aplicación Compartida](https://ais-pre-j4so2u54ed7p4sgf5iwesw-172786148761.us-east1.run.app)**

*Tip: Puedes guardar este enlace en los marcadores de tu navegador o añadirlo a la pantalla de inicio de tu celular como si fuera una aplicación normal.*

---

## ¿Por qué dio error en Netlify? 🧐

**Netlify es una excelente plataforma, pero solo sirve para páginas estáticas (el frente visual).**

Tu aplicación **Natura Conecta AI** consta de dos partes:
1. **El frente visual (Frontend):** Lo que ves, los botones, los chats y colores.
2. **El "cerebro" inteligente (Backend en `server.ts`):** Es un servidor que resguarda de manera 100% segura tu clave de inteligencia artificial (Gemini) para que nadie te la pueda robar.

Cuando subes el archivo a Netlify, solo se cargan los componentes visuales. Al intentar enviar un dilema de Natura, los botones intentan hablar con el "cerebro", pero como Netlify no tiene soporte para correr servidores de Node.js en planes estáticos tradicionales, la conexión se rompe y da el error de: *"Fin inesperado de la entrada JSON"*. ¡Por eso se requiere un servidor completo!

---

## Opción 2: Ejecutar en tu computadora (Local) 💻

Si deseas guardarlo y usarlo en tu propia computadora local de manera ilimitada, hemos creado comandos rápidos para que lo hagas con **un solo doble clic**.

### Pasos:
1. **Descarga el ZIP** desde el botón de la aplicación o el menú de exportación.
2. **Descomprime el archivo** en una carpeta de tu computadora.
3. Asegúrate de tener instalado **Node.js** (es gratuito y lo descargas de [nodejs.org](https://nodejs.org/)). Es lo único que necesita tu computadora para correr código.
4. Ejecuta el archivo iniciador según tu sistema:
   - **En Windows:** Haz doble clic sobre el archivo `iniciar_app.bat`.
   - **En Mac:** Haz doble clic sobre el archivo `iniciar_app.command`.

¡Automáticamente se instalará todo lo necesario y se abrirá una ventana de tu navegador en `http://localhost:3000` con tu app lista para usar!

---

## Opción 3: Alojarlo gratis en Internet (Servidor Completo) 🌐

Si deseas tener tu propio enlace en el cual tus consultoras y clientes puedan entrar, pero que use tu propia URL o configuración, debes usar un servicio de **Servidor Full-Stack** (que corra tanto base de datos, backend y frontend). Las mejores plataformas gratuitas son:

### A. Render (Recomendado y muy fácil)
1. Créate una cuenta gratuita en **[Render.com](https://render.com)**.
2. Sube los archivos a un repositorio privado de **GitHub** (Render se conecta directamente).
3. Haz clic en **"New"** y selecciona **"Web Service"**.
4. Conéctalo a tu repositorio.
5. Usa los siguientes parámetros en la configuración:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Variables de Entorno (Environment Variables):** Agrega tu clave `GEMINI_API_KEY` para que tu chat inteligente funcione de forma segura.
6. ¡Haz clic en deploy y Render te dará un enlace público permanente totalmente gratis!

### B. Railway
* Funciona igual de rápido y cuenta con un plan gratuito automático para este tipo de aplicaciones agrupadas.

---

¡Disfruta de tu consultor inteligente Natura Conecta AI! Si tienes dudas sobre cómo usar las herramientas financieras o los prompts de ventas, revisa los presets integrados de la app.
