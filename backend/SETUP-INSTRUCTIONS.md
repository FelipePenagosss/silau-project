# Guía de Configuración - Backend Customers

## ✅ Estado Actual

- ✅ Backend instalado correctamente
- ✅ Credenciales de Supabase configuradas en `.env`
- ✅ Servidor corriendo en `http://localhost:3000`

## 📋 Pasos para Completar la Configuración

### 1. Configurar la tabla en Supabase

1. Ve a tu proyecto de Supabase: https://qyiyjesccodkqbhndcns.supabase.co
2. Abre el **SQL Editor** (menú lateral izquierdo)
3. Crea una nueva query
4. Copia y pega el contenido del archivo [`supabase-setup.sql`](./supabase-setup.sql)
5. Haz clic en **Run** para ejecutar el script

Este script:
- Crea la tabla `customers` con todas las columnas necesarias
- Crea índices únicos para `email` y `document_number`
- Configura Row Level Security (RLS)
- Crea políticas para permitir operaciones CRUD

### 2. Verificar que el backend esté corriendo

Abre tu navegador y ve a:
```
http://localhost:3000/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-22T..."
}
```

### 3. Probar la API de Customers

#### Listar clientes (GET)
```bash
curl http://localhost:3000/api/customers
```

#### Crear un cliente (POST)
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "phone": "987654321",
    "document_type": "DNI",
    "document_number": "12345678"
  }'
```

### 4. Iniciar el Frontend Angular

En otra terminal:
```bash
ng serve
```

Luego abre tu navegador en:
```
http://localhost:4200/dashboard/customers
```

## 🔧 Solución de Problemas

### Problema: "Missing Supabase environment variables"

**Solución:** Verifica que el archivo `backend/.env` tenga las credenciales correctas:
```env
SUPABASE_URL=https://qyiyjesccodkqbhndcns.supabase.co
SUPABASE_ANON_KEY=tu_clave_aqui
```

### Problema: Error al crear cliente - "Email already exists"

**Solución:** El email ya existe en la base de datos. Usa otro email diferente.

### Problema: Error CORS

**Solución:** El backend ya tiene CORS habilitado. Asegúrate de que el frontend esté corriendo en `localhost:4200`.

### Problema: "Row Level Security" - Sin permisos

**Solución:** Ejecuta el script SQL completo en Supabase para configurar las políticas RLS.

### Problema: No se puede conectar al backend desde Angular

**Solución:** Verifica que:
1. El backend esté corriendo en puerto 3000
2. La URL en `customer.service.ts` sea `http://localhost:3000/api/customers`

## 📊 Verificar datos en Supabase

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `customers`
3. Deberías ver los clientes que hayas creado

## 🚀 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/customers` | Listar clientes |
| GET | `/api/customers/:id` | Obtener cliente por ID |
| POST | `/api/customers` | Crear nuevo cliente |
| PUT | `/api/customers/:id` | Actualizar cliente |
| DELETE | `/api/customers/:id` | Soft delete |
| DELETE | `/api/customers/:id/hard` | Hard delete |

## 📝 Datos de Ejemplo para Pruebas

```json
{
  "first_name": "María",
  "last_name": "García",
  "email": "maria.garcia@example.com",
  "phone": "999888777",
  "document_type": "DNI",
  "document_number": "87654321"
}
```

## ⚠️ Importante para Producción

Las políticas RLS actuales permiten **acceso público total**. Esto está bien para desarrollo, pero en producción deberías:

1. Implementar autenticación
2. Restringir políticas RLS por usuario
3. Validar permisos según roles

## 📞 Próximos Pasos

Una vez que todo funcione:
1. ✅ Crear clientes desde el frontend
2. ✅ Editar clientes existentes
3. ✅ Eliminar clientes (soft delete)
4. ✅ Buscar y filtrar clientes
5. Implementar autenticación
6. Crear módulos de Productos y Órdenes
