# 🛒 UrbanCore Perú - E-Commerce Frontend

Bienvenido al repositorio oficial del frontend de **UrbanCore Perú**, una tienda virtual especializada en ropa urbana, streetwear, calzado y accesorios.

Este proyecto es una **Single Page Application (SPA)** desarrollada con **Angular**, diseñada para ofrecer una experiencia de usuario moderna, rápida, responsiva y conectada a una API REST construida con Spring Boot.

---

## 🚀 Tecnologías Utilizadas

- **Framework:** Angular con Standalone Components
- **Lenguaje:** TypeScript
- **Estilos:** CSS personalizado con diseño responsive
- **Consumo de API:** HttpClient de Angular
- **Autenticación:** JWT
- **Control de acceso:** Roles y permisos
- **Backend:** Spring Boot desplegado en Render
- **Base de datos:** MySQL en Clever Cloud
- **Despliegue Frontend:** GitHub Pages

---

## ✨ Características del Proyecto

El proyecto está estructurado de manera modular y cuenta con vistas públicas y privadas según el tipo de usuario.

- 🏠 **Inicio:** Landing page comercial con banners, categorías destacadas y diseño tipo e-commerce.
- 🛍️ **Catálogo:** Vista pública de productos con filtros por categoría, búsqueda y disponibilidad de stock.
- 🛒 **Carrito:** Permite agregar productos, modificar cantidades y confirmar compras.
- 🔐 **Autenticación:** Inicio de sesión y registro de usuarios mediante JWT.
- 👤 **Perfil:** Gestión de datos personales y cambio de contraseña.
- 📦 **Productos:** Administración de productos para usuarios autorizados.
- 🗂️ **Categorías:** Gestión de categorías de productos.
- 🏬 **Sucursales:** Administración de tiendas físicas.
- 📊 **Inventario:** Control de stock por sucursal.
- 🧾 **Ventas:** Registro y visualización de ventas según el rol del usuario.
- 📞 **Contacto:** Vista informativa para comunicación con la tienda.

---

## 👥 Roles del Sistema

El frontend adapta la navegación y las opciones disponibles según el rol autenticado.

### 🧑‍💼 ADMIN

Puede acceder a la administración completa del sistema:

- Usuarios
- Sucursales
- Categorías
- Productos
- Inventario
- Ventas globales
- Perfil

### 🧑‍🏫 SUPERVISOR

Puede gestionar información relacionada con su sucursal:

- Ventas de su sucursal
- Inventario de su sucursal
- Consulta de productos
- Perfil

### 🧑‍💻 SELLER

Puede registrar ventas desde la sucursal asignada:

- Nueva venta
- Mis ventas
- Consulta de productos
- Perfil

### 🛍️ CUSTOMER

Puede comprar desde la tienda online:

- Catálogo
- Carrito
- Mis compras
- Perfil

---

## 📁 Estructura Principal del Proyecto

```txt
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   └── models.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── branches/
│   │   ├── cart/
│   │   ├── catalog/
│   │   ├── categories/
│   │   ├── contact/
│   │   ├── dashboard/
│   │   ├── home/
│   │   ├── inventory/
│   │   ├── products/
│   │   ├── profile/
│   │   ├── sales/
│   │   └── users/
│   │
│   ├── app.component.html
│   ├── app.component.ts
│   └── app.routes.ts
│
├── assets/
├── environments/
├── index.html
├── main.ts
└── styles.css