# 🏨 Hotel Elefante - Guía de Inicialización

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **Git** (opcional) - [Descargar aquí](https://git-scm.com/)

## 🚀 Pasos para Inicializar el Servidor

### 1. Abrir Terminal
- Presiona `Win + R`, escribe `cmd` y presiona Enter
- O abre PowerShell desde el menú de inicio

### 2. Navegar al Proyecto
```bash
cd "C:\Users\santi\OneDrive\Escritorio\PROYECTOS\HOTEL ELEFANTE 2"
```

### 3. Instalar Dependencias
```bash
npm install
```
⏳ *Este paso puede tomar unos minutos la primera vez*

### 4. Configurar Base de Datos
```bash
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```

### 5. Iniciar el Servidor
```bash
npm run dev
```

### 6. Abrir en el Navegador
- Ve a: `http://localhost:3002`
- ¡Listo! El hotel ya está funcionando 🎉

## 🔑 Credenciales de Acceso

### Administrador
- **Email:** `admin@hotelelefante.com`
- **Contraseña:** `admin123`
- **Acceso:** Panel completo de administración

### Operador
- **Email:** `operador@hotelelefante.com`
- **Contraseña:** `operador123`
- **Acceso:** Gestión de reservas y mensajes

### Usuario Cliente
- **Email:** `usuario@hotelelefante.com`
- **Contraseña:** `usuario123`
- **Acceso:** Reservas y perfil de cliente

## 🛠️ Herramientas Adicionales

### Ver Base de Datos (Opcional)
```bash
npx prisma studio
```
- Se abre en: `http://localhost:5555`
- Permite ver y editar datos directamente

### Detener el Servidor
- En la terminal donde está corriendo, presiona: `Ctrl + C`

## 📱 Páginas Disponibles

### Páginas Públicas
- **Inicio:** `http://localhost:3002/`
- **Habitaciones:** `http://localhost:3002/habitaciones`
- **Servicios:** `http://localhost:3002/servicios`
- **Contacto:** `http://localhost:3002/contacto`

### Panel Administrador
- **Dashboard:** `http://localhost:3002/admin`
- **Habitaciones:** `http://localhost:3002/admin/habitaciones`
- **Usuarios:** `http://localhost:3002/admin/usuarios`
- **Promociones:** `http://localhost:3002/admin/promociones`

### Panel Operador
- **Dashboard:** `http://localhost:3002/operador`
- **Reservas:** `http://localhost:3002/operador/reservas`
- **Mensajes:** `http://localhost:3002/operador/mensajes`

## ❗ Solución de Problemas

### Error: "Puerto 3002 en uso"
```bash
# Cambiar puerto en package.json o usar:
npm run dev -- -p 3003
```

### Error: "Comando no encontrado"
- Verifica que Node.js esté instalado: `node --version`
- Reinstala dependencias: `rm -rf node_modules && npm install`

### Error de Base de Datos
```bash
# Resetear base de datos
rm dev.db
npx prisma migrate dev --name init
node prisma/seed.js
```

### Página en Blanco
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador (F12)
- Intenta refrescar la página (Ctrl + F5)

## 📞 Funcionalidades Principales

### ✅ Sistema Completo
- **Reservas online** con calendario
- **Gestión de habitaciones** en tiempo real
- **Panel de administración** completo
- **Email marketing** y promociones
- **Sistema de mensajes** de contacto
- **Analytics y reportes** detallados
- **Mapa interactivo** del hotel
- **Autenticación** con roles de usuario

### ✅ Tecnologías Utilizadas
- **Frontend:** Next.js 14 + React 18
- **Base de Datos:** SQLite + Prisma ORM
- **Autenticación:** NextAuth.js
- **UI:** Tailwind CSS + Radix UI
- **Gráficos:** Recharts
- **Emails:** Nodemailer

## 🎯 Comandos Rápidos

```bash
# Iniciar desarrollo
npm run dev

# Ver base de datos
npx prisma studio

# Resetear datos
node prisma/seed.js

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate
```

---

**¿Necesitas ayuda?** 
- Revisa la consola del navegador (F12) para errores
- Verifica que todos los comandos se ejecuten sin errores
- Asegúrate de estar en la carpeta correcta del proyecto

**¡Disfruta gestionando el Hotel Elefante! 🐘✨**
