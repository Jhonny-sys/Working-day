ALTER TABLE tipos_documento
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

UPDATE tipos_documento SET categoria = 'Documentos de identidad para colombianos' WHERE codigo IN ('CC', 'TI');
UPDATE tipos_documento SET categoria = 'Documentos para extranjeros en Colombia' WHERE codigo IN ('CE', 'PAS');

INSERT INTO tipos_documento (codigo, nombre, categoria)
VALUES
  ('RC', 'Registro civil de nacimiento', 'Documentos de identidad para colombianos'),
  ('NUIP', 'Número único de identificación personal', 'Documentos de identidad para colombianos'),
  ('PPT', 'Permiso por protección temporal', 'Documentos para extranjeros en Colombia'),
  ('PEP', 'Permiso especial de permanencia', 'Documentos para extranjeros en Colombia'),
  ('NIT', 'Número de identificación tributaria', 'Otros documentos de identificación y tributarios'),
  ('OTRO', 'Otro documento', 'Otros documentos de identificación y tributarios')
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria;
