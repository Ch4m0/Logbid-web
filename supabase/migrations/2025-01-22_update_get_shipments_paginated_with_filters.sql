-- Actualizar la función get_shipments_paginated para incluir filtros adicionales opcionales

CREATE OR REPLACE FUNCTION get_shipments_paginated(
  p_user_id UUID,
  p_market_id TEXT,
  p_status TEXT,
  p_shipping_type TEXT,
  p_filter_type TEXT DEFAULT 'all',
  p_search_term TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 10,
  -- Nuevos parámetros de filtros opcionales
  p_origin_filter TEXT DEFAULT NULL,
  p_destination_filter TEXT DEFAULT NULL,
  p_creation_date_filter TEXT DEFAULT NULL,
  p_expiration_date_filter TEXT DEFAULT NULL,
  p_uuid_filter TEXT DEFAULT NULL,
  p_offers_count_filter TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_offset INTEGER;
  v_total_count INTEGER;
  v_total_pages INTEGER;
  v_has_next BOOLEAN;
  v_has_prev BOOLEAN;
  v_shipment_data JSON;
  v_result JSON;
BEGIN
  -- Calcular offset
  v_offset := (p_page - 1) * p_limit;
  
  -- Construir la consulta principal con todos los filtros
  WITH filtered_shipments AS (
    SELECT DISTINCT s.*,
      COALESCE(offer_counts.offers_count, 0) as offers_count
    FROM shipments s
    LEFT JOIN (
      SELECT shipment_id, COUNT(*) as offers_count
      FROM offers
      WHERE status = 'Active'
      GROUP BY shipment_id
    ) offer_counts ON s.id = offer_counts.shipment_id
    WHERE s.user_id = p_user_id
      AND s.market_id::text = p_market_id
      AND s.status = p_status
      AND s.shipping_type = p_shipping_type
      -- Filtro por tipo de ofertas
      AND (
        p_filter_type = 'all' OR
        (p_filter_type = 'withoutOffers' AND COALESCE(offer_counts.offers_count, 0) = 0) OR
        (p_filter_type = 'withOffers' AND COALESCE(offer_counts.offers_count, 0) > 0) OR
        (p_filter_type = 'closed' AND s.status = 'Closed')
      )
      -- Filtro por término de búsqueda
      AND (
        p_search_term IS NULL OR
        s.uuid::text ILIKE '%' || p_search_term || '%' OR
        s.origin ILIKE '%' || p_search_term || '%' OR
        s.destination ILIKE '%' || p_search_term || '%'
      )
      -- Filtros adicionales opcionales
      AND (p_origin_filter IS NULL OR s.origin ILIKE '%' || p_origin_filter || '%')
      AND (p_destination_filter IS NULL OR s.destination ILIKE '%' || p_destination_filter || '%')
      AND (p_creation_date_filter IS NULL OR s.inserted_at::date = p_creation_date_filter::date)
      AND (p_expiration_date_filter IS NULL OR s.expiration_date::date = p_expiration_date_filter::date)
      AND (p_uuid_filter IS NULL OR s.uuid::text ILIKE '%' || p_uuid_filter || '%')
      AND (p_offers_count_filter IS NULL OR COALESCE(offer_counts.offers_count, 0)::text = p_offers_count_filter)
  ),
  shipment_data AS (
    SELECT 
      json_build_object(
        'id', s.id,
        'uuid', s.uuid,
        'origin', s.origin,
        'destination', s.destination,
        'inserted_at', s.inserted_at,
        'expiration_date', s.expiration_date,
        'shipping_date', s.shipping_date,
        'shipping_type', s.shipping_type,
        'status', s.status,
        'value', s.value,
        'currency', s.currency,
        'offers_count', s.offers_count,
        'origin_flag', COALESCE(origin_countries.flag, '🏳️'),
        'destination_flag', COALESCE(dest_countries.flag, '🏳️'),
        'transportation', 
          CASE 
            WHEN s.shipping_type = '1' THEN 'Marítimo'
            WHEN s.shipping_type = '2' THEN 'Aéreo'
            ELSE 'Terrestre'
          END
      ) as shipment_json
    FROM filtered_shipments s
    LEFT JOIN countries origin_countries ON s.origin ILIKE '%' || origin_countries.name || '%'
    LEFT JOIN countries dest_countries ON s.destination ILIKE '%' || dest_countries.name || '%'
    ORDER BY s.inserted_at DESC
    LIMIT p_limit OFFSET v_offset
  )
  
  -- Obtener el conteo total
  SELECT COUNT(*) INTO v_total_count FROM filtered_shipments;
  
  -- Calcular metadatos de paginación
  v_total_pages := CEIL(v_total_count::FLOAT / p_limit);
  v_has_next := p_page < v_total_pages;
  v_has_prev := p_page > 1;
  
  -- Obtener los datos de shipments como array JSON
  SELECT COALESCE(json_agg(shipment_json), '[]'::json) INTO v_shipment_data
  FROM shipment_data;
  
  -- Construir el resultado final
  v_result := json_build_object(
    'data', v_shipment_data,
    'pagination', json_build_object(
      'currentPage', p_page,
      'totalPages', v_total_pages,
      'totalItems', v_total_count,
      'hasNext', v_has_next,
      'hasPrev', v_has_prev
    )
  );
  
  RETURN v_result;
END;
$$;
