-- Script de configuración para la tabla customers en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear la tabla customers (si no existe)
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document_type TEXT,
  document_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. Crear índices únicos para email y document_number (solo si no están eliminados)
DROP INDEX IF EXISTS customers_email_unique;
CREATE UNIQUE INDEX customers_email_unique
ON customers(email)
WHERE deleted_at IS NULL AND email IS NOT NULL;

DROP INDEX IF EXISTS customers_document_number_unique;
CREATE UNIQUE INDEX customers_document_number_unique
ON customers(document_number)
WHERE deleted_at IS NULL AND document_number IS NOT NULL;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas para permitir todas las operaciones (DESARROLLO)
-- IMPORTANTE: En producción, debes ajustar estas políticas según tus necesidades de seguridad

-- Política para SELECT (leer)
DROP POLICY IF EXISTS "Allow public read access" ON customers;
CREATE POLICY "Allow public read access"
ON customers FOR SELECT
USING (true);

-- Política para INSERT (crear)
DROP POLICY IF EXISTS "Allow public insert access" ON customers;
CREATE POLICY "Allow public insert access"
ON customers FOR INSERT
WITH CHECK (true);

-- Política para UPDATE (actualizar)
DROP POLICY IF EXISTS "Allow public update access" ON customers;
CREATE POLICY "Allow public update access"
ON customers FOR UPDATE
USING (true);

-- Política para DELETE (eliminar)
DROP POLICY IF EXISTS "Allow public delete access" ON customers;
CREATE POLICY "Allow public delete access"
ON customers FOR DELETE
USING (true);

-- 5. Verificar la estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- 6. Insertar datos de prueba (opcional)
-- INSERT INTO customers (first_name, last_name, email, phone, document_type, document_number)
-- VALUES
--   ('Juan', 'Pérez', 'juan@example.com', '987654321', 'DNI', '12345678'),
--   ('María', 'García', 'maria@example.com', '987654322', 'DNI', '87654321'),
--   ('Pedro', 'López', 'pedro@example.com', '987654323', 'RUC', '20123456789');
