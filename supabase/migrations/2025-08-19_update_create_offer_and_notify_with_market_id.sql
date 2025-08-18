-- Update create_offer_and_notify function to include market_id in notification
create or replace function public.create_offer_and_notify(
  offer_data jsonb
)
returns json
language plpgsql
security definer
as $$
DECLARE
  new_offer RECORD;
  shipment_record RECORD;
  customer_id UUID;
  notification_data JSON;
  result JSON;
  details_json JSONB;
  origin_text TEXT;
  destination_text TEXT;
  parsed_additional_info JSONB;
BEGIN
  -- Parsear el additional_info si viene como string JSON
  BEGIN
    IF offer_data->>'additional_info' IS NOT NULL THEN
      parsed_additional_info := (offer_data->>'additional_info')::jsonb;
    ELSE
      parsed_additional_info := '{}'::jsonb;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si no puede parsear, usar objeto vacío
    parsed_additional_info := '{}'::jsonb;
  END;

  -- Construir el objeto details correctamente estructurado
  details_json := jsonb_build_object(
    'currency', offer_data->>'currency',
    'basic_service', COALESCE(parsed_additional_info->'details'->'basic_service', '{}'::jsonb),
    'freight_fees', COALESCE(parsed_additional_info->'details'->'freight_fees', '{}'::jsonb),
    'origin_fees', COALESCE(parsed_additional_info->'details'->'origin_fees', '{}'::jsonb),
    'destination_fees', COALESCE(parsed_additional_info->'details'->'destination_fees', '{}'::jsonb),
    'other_fees', COALESCE(parsed_additional_info->'details'->'other_fees', '{}'::jsonb),
    -- Mantener el additional_info original para compatibilidad
    'additional_info', offer_data->>'additional_info'
  );

  -- 1. Insertar la nueva oferta
  INSERT INTO offers (
    shipment_id,
    agent_id,
    price,
    status,
    details,
    shipping_type,
    agent_code,
    inserted_at,
    updated_at
  ) VALUES (
    (offer_data->>'shipment_id')::integer,
    (offer_data->>'agent_id')::uuid,
    (offer_data->>'price')::numeric,
    'pending',  -- Estado inicial de la oferta
    details_json,
    offer_data->>'shipping_type',
    offer_data->>'agent_code',
    NOW(),
    NOW()
  )
  RETURNING * INTO new_offer;
  
  -- 2. Obtener información del shipment y su dueño (customer)
  SELECT s.*, p.auth_id as customer_auth_id
  INTO shipment_record
  FROM shipments s
  JOIN profiles p ON s.profile_id = p.auth_id  -- 🔧 Corregido: usar auth_id
  WHERE s.id = new_offer.shipment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipment no encontrado';
  END IF;

  -- Construir textos de origen y destino
  origin_text := shipment_record.origin_country || ' - ' || shipment_record.origin_name;
  destination_text := shipment_record.destination_country || ' - ' || shipment_record.destination_name;
  
  -- 3. Preparar datos de notificación con template para interpolación
  notification_data := json_build_object(
    'offer_id', new_offer.id,
    'shipment_id', shipment_record.id,
    'shipment_uuid', shipment_record.uuid,
    'price', new_offer.price::text,
    'currency', offer_data->>'currency',
    'origin', origin_text,
    'destination', destination_text,
    'shipping_type', shipment_record.shipping_type,
    'agent_code', new_offer.agent_code,
    'market_id', COALESCE(offer_data->>'market_id', shipment_record.market_id::text)
  );
  
  -- 4. Crear notificación para el customer con template interpolable
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    shipment_id,
    offer_id,
    market_id,
    read,
    created_at
  ) VALUES (
    shipment_record.customer_auth_id,  -- ID del customer
    'new_offer',
    '💰 ¡Nueva oferta recibida!',
    'Recibiste una nueva oferta de ${{price}} {{currency}} para tu envío {{origin}} → {{destination}}',
    notification_data,
    shipment_record.id,
    new_offer.id,
    COALESCE((offer_data->>'market_id')::integer, shipment_record.market_id),
    false,
    NOW()
  );
  
  -- 5. Retornar resultado
  result := json_build_object(
    'success', true,
    'offer', row_to_json(new_offer),
    'customer_notified', true,
    'customer_id', shipment_record.customer_auth_id
  );
  
  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- En caso de error, hacer rollback implícito y retornar error
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

grant execute on function public.create_offer_and_notify(jsonb) to authenticated, anon;
