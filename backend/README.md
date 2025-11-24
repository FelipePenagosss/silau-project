# Fundación Tazul - Backend API

Backend API REST para la gestión de clientes de Fundación Tazul, construido con Node.js, Express y TypeScript.

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Lenguaje tipado
- **Supabase** - Base de datos PostgreSQL
- **express-validator** - Validación de datos

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Configuración de Supabase
│   ├── modules/
│   │   └── customers/           # Módulo de clientes
│   │       ├── customer.model.ts
│   │       ├── customer.service.ts
│   │       ├── customer.validator.ts
│   │       ├── customer.controller.ts
│   │       └── customer.routes.ts
│   ├── middlewares/
│   │   └── errorHandler.ts      # Manejo global de errores
│   └── server.ts                # Punto de entrada
├── package.json
├── tsconfig.json
└── .env
```

## Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de Supabase:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
PORT=3000
NODE_ENV=development
```

### 3. Ejecutar el servidor

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
```

## Endpoints de la API

### Clientes (Customers)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/customers` | Listar clientes (con paginación y búsqueda) |
| GET | `/api/customers/:id` | Obtener un cliente por ID |
| POST | `/api/customers` | Crear nuevo cliente |
| PUT | `/api/customers/:id` | Actualizar cliente |
| DELETE | `/api/customers/:id` | Soft delete (eliminación lógica) |
| DELETE | `/api/customers/:id/hard` | Hard delete (eliminación permanente) |

### Ejemplos de Uso

#### Listar clientes con paginación

```bash
GET http://localhost:3000/api/customers?page=1&limit=10&search=juan
```

Respuesta:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Crear un nuevo cliente

```bash
POST http://localhost:3000/api/customers
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "phone": "987654321",
  "document_type": "DNI",
  "document_number": "12345678"
}
```

#### Actualizar un cliente

```bash
PUT http://localhost:3000/api/customers/1
Content-Type: application/json

{
  "first_name": "Juan Carlos",
  "phone": "999888777"
}
```

#### Eliminar un cliente (soft delete)

```bash
DELETE http://localhost:3000/api/customers/1
```

## Validaciones

### Crear Cliente
- `first_name`: Obligatorio, 2-100 caracteres
- `last_name`: Obligatorio, 2-100 caracteres
- `email`: Opcional, formato válido de email, único
- `phone`: Opcional, 7-20 caracteres
- `document_type`: Opcional, valores: DNI, RUC, CE, PASSPORT
- `document_number`: Opcional, 5-20 caracteres, único

### Actualizar Cliente
- Todos los campos son opcionales
- Mismas validaciones que crear cliente

## Características

- ✅ CRUD completo de clientes
- ✅ Paginación de resultados
- ✅ Búsqueda por nombre, apellido, email o documento
- ✅ Validación de datos con express-validator
- ✅ Soft delete (eliminación lógica)
- ✅ Hard delete (eliminación permanente)
- ✅ Validación de email único
- ✅ Validación de documento único
- ✅ Manejo global de errores
- ✅ TypeScript para tipado fuerte
- ✅ Seguridad con Helmet
- ✅ CORS habilitado
- ✅ Logging con Morgan

## Health Check

```bash
GET http://localhost:3000/health
```

Respuesta:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-22T10:30:00.000Z"
}
```

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor en modo desarrollo con hot reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Ejecuta el servidor compilado

## Próximos Módulos

- Productos
- Órdenes
- Autenticación
- Reportes
