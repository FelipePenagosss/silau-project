-- Script de corrección para la tabla customers
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Agregar la columna deleted_at si no existe
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Agregar created_at y updated_at si no existen
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Verificar que RLS esté habilitado
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR políticas anteriores si existen
DROP POLICY IF EXISTS "Allow public read access" ON customers;
DROP POLICY IF EXISTS "Allow public insert access" ON customers;
DROP POLICY IF EXISTS "Allow public update access" ON customers;
DROP POLICY IF EXISTS "Allow public delete access" ON customers;

-- 5. Crear políticas RLS para permitir todas las operaciones
CREATE POLICY "Allow public read access"
ON customers FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access"
ON customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON customers FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access"
ON customers FOR DELETE
USING (true);

-- 6. Crear índices únicos
DROP INDEX IF EXISTS customers_email_unique;
CREATE UNIQUE INDEX customers_email_unique
ON customers(email)
WHERE deleted_at IS NULL AND email IS NOT NULL;

DROP INDEX IF EXISTS customers_document_number_unique;
CREATE UNIQUE INDEX customers_document_number_unique
ON customers(document_number)
WHERE deleted_at IS NULL AND document_number IS NOT NULL;

-- 7. Verificar estructura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;
