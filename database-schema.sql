-- Ejemplo de estructura de tabla de usuarios
-- Esta tabla extiende la funcionalidad de auth.users de Supabase

-- Tabla de roles (opcional)
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles por defecto
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'importer', 'Importador'),
(3, 'agent', 'Agente de carga')
ON CONFLICT (id) DO NOTHING;

-- Tabla de mercados (si aplica)
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos mercados de ejemplo
INSERT INTO markets (id, name, code, active) VALUES
(1, 'América del Norte', 'NA', true),
(2, 'América del Sur', 'SA', true),
(3, 'Europa', 'EU', true),
(4, 'Asia', 'AS', true)
ON CONFLICT (id) DO NOTHING;

-- Tabla principal de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role_id INTEGER REFERENCES roles(id) DEFAULT 2,
  company_name VARCHAR(200),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación usuarios-mercados (muchos a muchos)
CREATE TABLE IF NOT EXISTS user_markets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, market_id)
);

-- Tabla de envíos (shipments)
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL,
  agent_code VARCHAR(50),
  origin_id INTEGER,
  origin_name VARCHAR(255),
  origin_country VARCHAR(100),
  destination_id INTEGER,
  destination_name VARCHAR(255),
  destination_country VARCHAR(100),
  transportation VARCHAR(100),
  comex_type VARCHAR(50),
  expiration_date TIMESTAMP WITH TIME ZONE,
  shipping_type VARCHAR(50),
  shipment_type VARCHAR(50),
  value DECIMAL(15,2),
  currency VARCHAR(10),
  additional_info TEXT,
  total_weight DECIMAL(10,2),
  measure_type VARCHAR(20),
  volume DECIMAL(10,2),
  units INTEGER,
  merchandise_type VARCHAR(100),
  dangerous_merch BOOLEAN DEFAULT false,
  tariff_item VARCHAR(20),
  container_id INTEGER,
  incoterms_id INTEGER,
  user_id INTEGER NOT NULL,
  market_id INTEGER REFERENCES markets(id),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ofertas (offers)
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
  agent_code VARCHAR(50),
  agent_id INTEGER,
  status VARCHAR(50),
  shipping_type VARCHAR(50),
  price DECIMAL(15,2),
  details TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para crear un usuario automáticamente cuando se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en shipments
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en offers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vista para obtener usuario con sus mercados
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.*,
  r.name as role_name,
  r.description as role_description,
  COALESCE(
    json_agg(
      CASE 
        WHEN m.id IS NOT NULL THEN 
          json_build_object(
            'id', m.id,
            'name', m.name,
            'code', m.code,
            'active', m.active
          )
        ELSE NULL
      END
    ) FILTER (WHERE m.id IS NOT NULL), 
    '[]'::json
  ) as all_markets
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_markets um ON u.id = um.user_id
LEFT JOIN markets m ON um.market_id = m.id
GROUP BY u.id, r.name, r.description;

-- RLS (Row Level Security) - opcional pero recomendado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_id = 1
    )
  );

-- DATOS DE EJEMPLO - 30 registros de shipments usando profile_id 1, 2 y 3
INSERT INTO shipments (
  status, agent_code, origin_id, origin_name, origin_country, 
  destination_id, destination_name, destination_country, transportation, 
  comex_type, expiration_date, shipping_type, value, currency, 
  additional_info, profile_id, market_id, shipment_details_id
) VALUES
-- Profile ID 1 (10 registros)
('active', 'AGT001', 1, 'Puerto de Los Angeles', 'Estados Unidos', 2, 'Puerto de Valparaíso', 'Chile', 'Marítimo', 'FOB', '2024-02-15 23:59:59', 'container', 25000.00, 'USD', 'Carga frágil - Electrónicos', 1, 1, 1001),
('active', 'AGT002', 3, 'Puerto de Hamburgo', 'Alemania', 4, 'Puerto de Santos', 'Brasil', 'Marítimo', 'CIF', '2024-02-20 23:59:59', 'container', 18500.00, 'EUR', 'Maquinaria industrial', 1, 2, 1002),
('active', 'AGT003', 5, 'Aeropuerto JFK', 'Estados Unidos', 6, 'Aeropuerto El Dorado', 'Colombia', 'Aéreo', 'DDP', '2024-02-12 23:59:59', 'air', 12000.00, 'USD', 'Medicamentos refrigerados', 1, 1, 1003),
('pending', 'AGT004', 7, 'Puerto de Shanghái', 'China', 8, 'Puerto de Callao', 'Perú', 'Marítimo', 'EXW', '2024-02-25 23:59:59', 'container', 35000.00, 'USD', 'Textiles y confecciones', 1, 4, 1004),
('active', 'AGT005', 9, 'Puerto de Rotterdam', 'Países Bajos', 10, 'Puerto de Montevideo', 'Uruguay', 'Marítimo', 'CFR', '2024-02-18 23:59:59', 'container', 22000.00, 'EUR', 'Químicos industriales', 1, 3, 1005),
('completed', 'AGT006', 11, 'Aeropuerto de Miami', 'Estados Unidos', 12, 'Aeropuerto de Lima', 'Perú', 'Aéreo', 'FCA', '2024-01-30 23:59:59', 'air', 8500.00, 'USD', 'Repuestos automotrices', 1, 1, 1006),
('active', 'AGT007', 13, 'Puerto de Yokohama', 'Japón', 14, 'Puerto de Buenaventura', 'Colombia', 'Marítimo', 'FOB', '2024-02-22 23:59:59', 'container', 28000.00, 'USD', 'Vehículos usados', 1, 4, 1007),
('pending', 'AGT008', 15, 'Puerto de Amberes', 'Bélgica', 16, 'Puerto de Guayaquil', 'Ecuador', 'Marítimo', 'CIF', '2024-02-14 23:59:59', 'container', 19500.00, 'EUR', 'Productos alimenticios', 1, 3, 1008),
('active', 'AGT009', 17, 'Aeropuerto de Frankfurt', 'Alemania', 18, 'Aeropuerto de Quito', 'Ecuador', 'Aéreo', 'DDP', '2024-02-16 23:59:59', 'air', 15000.00, 'EUR', 'Equipos médicos', 1, 3, 1009),
('active', 'AGT010', 19, 'Puerto de Long Beach', 'Estados Unidos', 20, 'Puerto de Acajutla', 'El Salvador', 'Marítimo', 'EXW', '2024-02-28 23:59:59', 'container', 31000.00, 'USD', 'Materiales de construcción', 1, 1, 1010),

-- Profile ID 2 (10 registros)
('active', 'AGT011', 21, 'Puerto de Barcelona', 'España', 22, 'Puerto de Cartagena', 'Colombia', 'Marítimo', 'FOB', '2024-02-17 23:59:59', 'container', 24000.00, 'EUR', 'Productos farmacéuticos', 2, 3, 1011),
('pending', 'AGT012', 23, 'Puerto de Kobe', 'Japón', 24, 'Puerto de Manzanillo', 'México', 'Marítimo', 'CIF', '2024-02-21 23:59:59', 'container', 27500.00, 'USD', 'Electrónicos de consumo', 2, 4, 1012),
('active', 'AGT013', 25, 'Aeropuerto de Los Angeles', 'Estados Unidos', 26, 'Aeropuerto de São Paulo', 'Brasil', 'Aéreo', 'CFR', '2024-02-13 23:59:59', 'air', 11000.00, 'USD', 'Instrumentos de precisión', 2, 1, 1013),
('completed', 'AGT014', 27, 'Puerto de Le Havre', 'Francia', 28, 'Puerto de Veracruz', 'México', 'Marítimo', 'DDP', '2024-01-28 23:59:59', 'container', 20000.00, 'EUR', 'Vinos y licores', 2, 3, 1014),
('active', 'AGT015', 29, 'Puerto de Singapur', 'Singapur', 30, 'Puerto de Iquique', 'Chile', 'Marítimo', 'FCA', '2024-02-24 23:59:59', 'container', 33000.00, 'USD', 'Componentes electrónicos', 2, 4, 1015),
('active', 'AGT016', 31, 'Aeropuerto de Chicago', 'Estados Unidos', 32, 'Aeropuerto de Buenos Aires', 'Argentina', 'Aéreo', 'EXW', '2024-02-19 23:59:59', 'air', 9500.00, 'USD', 'Software y licencias', 2, 1, 1016),
('pending', 'AGT017', 33, 'Puerto de Génova', 'Italia', 34, 'Puerto de Mazatlán', 'México', 'Marítimo', 'FOB', '2024-02-26 23:59:59', 'container', 26000.00, 'EUR', 'Muebles y decoración', 2, 3, 1017),
('active', 'AGT018', 35, 'Puerto de Busan', 'Corea del Sur', 36, 'Puerto de Paita', 'Perú', 'Marítimo', 'CIF', '2024-02-11 23:59:59', 'container', 29000.00, 'USD', 'Productos químicos', 2, 4, 1018),
('active', 'AGT019', 37, 'Aeropuerto de Amsterdam', 'Países Bajos', 38, 'Aeropuerto de Caracas', 'Venezuela', 'Aéreo', 'CFR', '2024-02-23 23:59:59', 'air', 13500.00, 'EUR', 'Equipos de telecomunicaciones', 2, 3, 1019),
('completed', 'AGT020', 39, 'Puerto de Oakland', 'Estados Unidos', 40, 'Puerto de Lázaro Cárdenas', 'México', 'Marítimo', 'DDP', '2024-01-25 23:59:59', 'container', 21500.00, 'USD', 'Herramientas industriales', 2, 1, 1020),

-- Profile ID 3 (10 registros)
('active', 'AGT021', 41, 'Puerto de Marsella', 'Francia', 42, 'Puerto de Barranquilla', 'Colombia', 'Marítimo', 'FCA', '2024-02-27 23:59:59', 'container', 23500.00, 'EUR', 'Cosméticos y perfumes', 3, 3, 1021),
('pending', 'AGT022', 43, 'Puerto de Ningbo', 'China', 44, 'Puerto de Coronel', 'Chile', 'Marítimo', 'EXW', '2024-02-15 23:59:59', 'container', 32000.00, 'USD', 'Maquinaria minera', 3, 4, 1022),
('active', 'AGT023', 45, 'Aeropuerto de Dallas', 'Estados Unidos', 46, 'Aeropuerto de Medellín', 'Colombia', 'Aéreo', 'FOB', '2024-02-20 23:59:59', 'air', 10500.00, 'USD', 'Dispositivos médicos', 3, 1, 1023),
('active', 'AGT024', 47, 'Puerto de Valencia', 'España', 48, 'Puerto de Puerto Cabello', 'Venezuela', 'Marítimo', 'CIF', '2024-02-18 23:59:59', 'container', 25500.00, 'EUR', 'Productos agrícolas', 3, 3, 1024),
('completed', 'AGT025', 49, 'Puerto de Tianjin', 'China', 50, 'Puerto de San Antonio', 'Chile', 'Marítimo', 'CFR', '2024-01-31 23:59:59', 'container', 30000.00, 'USD', 'Textiles técnicos', 3, 4, 1025),
('active', 'AGT026', 51, 'Aeropuerto de Atlanta', 'Estados Unidos', 52, 'Aeropuerto de Panama City', 'Panamá', 'Aéreo', 'DDP', '2024-02-16 23:59:59', 'air', 14000.00, 'USD', 'Equipos de laboratorio', 3, 1, 1026),
('pending', 'AGT027', 53, 'Puerto de Felixstowe', 'Reino Unido', 54, 'Puerto de Tampico', 'México', 'Marítimo', 'FCA', '2024-02-22 23:59:59', 'container', 22500.00, 'GBP', 'Productos de lujo', 3, 3, 1027),
('active', 'AGT028', 55, 'Puerto de Qingdao', 'China', 56, 'Puerto de Arica', 'Chile', 'Marítimo', 'EXW', '2024-02-14 23:59:59', 'container', 28500.00, 'USD', 'Componentes automotrices', 3, 4, 1028),
('active', 'AGT029', 57, 'Aeropuerto de Londres Heathrow', 'Reino Unido', 58, 'Aeropuerto de Montevideo', 'Uruguay', 'Aéreo', 'FOB', '2024-02-25 23:59:59', 'air', 12500.00, 'GBP', 'Productos biotecnológicos', 3, 3, 1029),
('completed', 'AGT030', 59, 'Puerto de Seattle', 'Estados Unidos', 60, 'Puerto de Ensenada', 'México', 'Marítimo', 'CIF', '2024-01-29 23:59:59', 'container', 26500.00, 'USD', 'Equipos de construcción', 3, 1, 1030);

-- Insertar algunas ofertas de ejemplo para algunos shipments
INSERT INTO offers (shipment_id, agent_code, agent_id, status, shipping_type, price, details) VALUES
(1, 'AGT101', 101, 'pending', 'container', 24500.00, 'Oferta competitiva con seguro incluido'),
(1, 'AGT102', 102, 'pending', 'container', 24800.00, 'Servicio express disponible'),
(2, 'AGT103', 103, 'accepted', 'container', 18200.00, 'Mejor precio del mercado'),
(3, 'AGT104', 104, 'pending', 'air', 11800.00, 'Manejo especializado de medicamentos'),
(4, 'AGT105', 105, 'rejected', 'container', 36000.00, 'Precio fuera del presupuesto'),
(5, 'AGT106', 106, 'pending', 'container', 21500.00, 'Entrega garantizada en fecha'),
(6, 'AGT107', 107, 'completed', 'air', 8200.00, 'Servicio completado satisfactoriamente'),
(7, 'AGT108', 108, 'pending', 'container', 27500.00, 'Incluye manejo especializado'),
(8, 'AGT109', 109, 'pending', 'container', 19200.00, 'Certificaciones de calidad incluidas'),
(9, 'AGT110', 110, 'accepted', 'air', 14500.00, 'Equipo médico certificado'),
(11, 'AGT111', 111, 'pending', 'container', 23500.00, 'Transporte refrigerado'),
(12, 'AGT112', 112, 'pending', 'container', 27000.00, 'Servicio puerta a puerta'),
(13, 'AGT113', 113, 'accepted', 'air', 10800.00, 'Entrega rápida garantizada'),
(15, 'AGT114', 114, 'pending', 'container', 32500.00, 'Incluye almacenamiento'),
(16, 'AGT115', 115, 'rejected', 'air', 10000.00, 'Condiciones no aceptadas'),
(21, 'AGT116', 116, 'pending', 'container', 23000.00, 'Manejo especializado de cosméticos'),
(22, 'AGT117', 117, 'pending', 'container', 31500.00, 'Equipo especializado para minería'),
(23, 'AGT118', 118, 'accepted', 'air', 10200.00, 'Certificación médica incluida'),
(24, 'AGT119', 119, 'pending', 'container', 25000.00, 'Productos perecederos'),
(26, 'AGT120', 120, 'pending', 'air', 13500.00, 'Laboratorio certificado'); 