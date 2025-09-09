-- Función para obtener shipments paginados con estructura estándar
CREATE OR REPLACE FUNCTION get_shipments_paginated(
  p_user_id UUID DEFAULT NULL,
  p_market_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_shipping_type TEXT DEFAULT NULL,
  p_filter_type TEXT DEFAULT 'all',
  p_search_term TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_offset INTEGER;
  v_total_items INTEGER;
  v_total_pages INTEGER;
  v_has_next BOOLEAN;
  v_has_prev BOOLEAN;
  v_query TEXT;
  v_count_query TEXT;
  v_where_conditions TEXT[];
  v_where_clause TEXT;
  v_data JSON;
  v_result JSON;
BEGIN
  -- Calcular offset
  v_offset := (p_page - 1) * p_limit;
  
  -- Construir condiciones WHERE dinámicamente
  v_where_conditions := ARRAY[]::TEXT[];
  
  -- Filtros básicos
  IF p_user_id IS NOT NULL THEN
    v_where_conditions := array_append(v_where_conditions, 's.profile_id = ''' || p_user_id || '''');
  END IF;
  
  IF p_market_id IS NOT NULL THEN
    v_where_conditions := array_append(v_where_conditions, 's.market_id = ' || p_market_id);
  END IF;
  
  IF p_shipping_type IS NOT NULL THEN
    v_where_conditions := array_append(v_where_conditions, 's.shipping_type = ''' || p_shipping_type || '''');
  END IF;
  
  -- Filtros por tipo de embarque
  IF p_filter_type = 'withoutOffers' THEN
    v_where_conditions := array_append(v_where_conditions, 's.status = ''Active''');
    v_where_conditions := array_append(v_where_conditions, 'NOT EXISTS (SELECT 1 FROM offers o WHERE o.shipment_id = s.id)');
  ELSIF p_filter_type = 'withOffers' THEN
    v_where_conditions := array_append(v_where_conditions, 's.status = ''Active''');
    v_where_conditions := array_append(v_where_conditions, 'EXISTS (SELECT 1 FROM offers o WHERE o.shipment_id = s.id)');
  ELSIF p_filter_type = 'closed' THEN
    v_where_conditions := array_append(v_where_conditions, 's.status IN (''Closed'', ''Cancelled'')');
  ELSIF p_status IS NOT NULL THEN
    IF p_status = 'Closed' THEN
      v_where_conditions := array_append(v_where_conditions, 's.status IN (''Closed'', ''Cancelled'')');
    ELSE
      v_where_conditions := array_append(v_where_conditions, 's.status = ''' || p_status || '''');
    END IF;
  END IF;
  
  -- Filtro de búsqueda
  IF p_search_term IS NOT NULL AND length(p_search_term) >= 3 THEN
    v_where_conditions := array_append(v_where_conditions, 
      '(s.origin_name ILIKE ''%' || p_search_term || '%'' OR ' ||
      's.destination_name ILIKE ''%' || p_search_term || '%'' OR ' ||
      's.origin_country ILIKE ''%' || p_search_term || '%'' OR ' ||
      's.destination_country ILIKE ''%' || p_search_term || '%'')');
  END IF;
  
  -- Construir cláusula WHERE
  IF array_length(v_where_conditions, 1) > 0 THEN
    v_where_clause := 'WHERE ' || array_to_string(v_where_conditions, ' AND ');
  ELSE
    v_where_clause := '';
  END IF;
  
  -- Consulta para contar total de registros
  v_count_query := 'SELECT COUNT(*) FROM shipments s ' || v_where_clause;
  
  EXECUTE v_count_query INTO v_total_items;
  
  -- Calcular paginación
  v_total_pages := CEIL(v_total_items::FLOAT / p_limit);
  v_has_next := p_page < v_total_pages;
  v_has_prev := p_page > 1;
  
  -- Consulta principal con datos transformados
  v_query := '
    SELECT json_agg(
      json_build_object(
        ''id'', s.id,
        ''status'', s.status,
        ''uuid'', s.uuid,
        ''agent_code'', s.agent_code,
        ''origin_id'', s.origin_id,
        ''origin'', s.origin_country || '' - '' || s.origin_name,
        ''origin_country'', s.origin_country,
        ''origin_flag'', COALESCE(co.flag_emoji, ''🏳️''),
        ''destination_id'', s.destination_id,
        ''destination'', s.destination_country || '' - '' || s.destination_name,
        ''destination_country'', s.destination_country,
        ''destination_flag'', COALESCE(cd.flag_emoji, ''🏳️''),
        ''transportation'', s.transportation,
        ''comex_type'', s.comex_type,
        ''expiration_date'', s.expiration_date,
        ''shipping_type'', s.shipping_type,
        ''shipping_date'', s.shipping_date,
        ''value'', s.value,
        ''currency'', s.currency,
        ''additional_info'', s.additional_info,
        ''user_id'', s.profile_id,
        ''market_id'', s.market_id,
        ''bid_details_id'', s.shipment_details_id,
        ''inserted_at'', s.inserted_at,
        ''last_price'', (
          SELECT MIN(o.price::NUMERIC)
          FROM offers o 
          WHERE o.shipment_id = s.id
        ),
        ''offers_count'', (
          SELECT COUNT(*)
          FROM offers o 
          WHERE o.shipment_id = s.id
        ),
        ''cancellation_reason'', s.cancellation_reason,
        ''cancelled_at'', s.cancelled_at
      )
    )
    FROM shipments s
    LEFT JOIN countries co ON (co.country_name ILIKE s.origin_country OR co.country_name_es ILIKE s.origin_country)
    LEFT JOIN countries cd ON (cd.country_name ILIKE s.destination_country OR cd.country_name_es ILIKE s.destination_country)
    ' || v_where_clause || '
    ORDER BY s.inserted_at DESC
    LIMIT ' || p_limit || ' OFFSET ' || v_offset;
  
  EXECUTE v_query INTO v_data;
  
  -- Si no hay datos, devolver array vacío
  IF v_data IS NULL THEN
    v_data := '[]'::JSON;
  END IF;
  
  -- Construir respuesta final
  v_result := json_build_object(
    'data', v_data,
    'pagination', json_build_object(
      'currentPage', p_page,
      'totalPages', v_total_pages,
      'totalItems', v_total_items,
      'hasNext', v_has_next,
      'hasPrev', v_has_prev
    )
  );
  
  RETURN v_result;
END;
$$;
