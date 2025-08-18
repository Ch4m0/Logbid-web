-- Create RPC to notify agents about bid closure using SECURITY DEFINER
-- This mirrors the pattern used by create_shipment_and_notify and create_offer_and_notify

create or replace function public.notify_agents_about_bid_closure(
  bid_id integer,
  accepted_offer_id integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_market_id integer;
  v_uuid uuid;
  v_origin text;
  v_destination text;
  v_winning_offer record;
  v_offers record;
  v_winner_count integer := 0;
  v_rejected_count integer := 0;
begin
  -- Get shipment info (market and route)
  select s.market_id,
         s.uuid,
         (s.origin_country || ' - ' || s.origin_name) as origin,
         (s.destination_country || ' - ' || s.destination_name) as destination
  into v_market_id, v_uuid, v_origin, v_destination
  from public.shipments s
  where s.id = bid_id;

  if v_uuid is null then
    return json_build_object('success', false, 'error', 'Shipment not found');
  end if;

  -- Winning offer
  select o.id, o.agent_id, o.price, o.agent_code, o.uuid
  into v_winning_offer
  from public.offers o
  where o.id = accepted_offer_id;

  if v_winning_offer.id is null then
    return json_build_object('success', false, 'error', 'Winning offer not found');
  end if;

  -- Cursor through distinct agents that offered on the shipment
  for v_offers in
    select distinct on (o.agent_id)
           o.agent_id,
           o.id as offer_id,
           o.price as offer_price,
           o.agent_code
    from public.offers o
    where o.shipment_id = bid_id
    order by o.agent_id, o.price asc
  loop
    if v_offers.agent_id = v_winning_offer.agent_id then
      -- Winner notification
      insert into public.notifications (
        user_id,
        type,
        title,
        message,
        data,
        shipment_id,
        offer_id,
        market_id,
        read
      ) values (
        v_winning_offer.agent_id,
        'offer_accepted',
        '🎉 ¡Tu oferta fue aceptada!',
        format('¡Felicidades! Tu oferta de $%s USD fue aceptada para el envío %s → %s', v_winning_offer.price, v_origin, v_destination),
        jsonb_build_object(
          'offer_uuid', v_winning_offer.uuid,
          'shipment_uuid', v_uuid::text,
          'agent_code', v_winning_offer.agent_code,
          'price', v_winning_offer.price::text,
          'currency', 'USD',
          'origin', v_origin,
          'destination', v_destination
        ),
        bid_id,
        v_winning_offer.id,
        v_market_id,
        false
      );
      v_winner_count := v_winner_count + 1;
    else
      -- Rejected notification
      insert into public.notifications (
        user_id,
        type,
        title,
        message,
        data,
        shipment_id,
        offer_id,
        market_id,
        read
      ) values (
        v_offers.agent_id,
        'offer_rejected',
        '❌ Tu oferta no fue seleccionada',
        format('Tu oferta de $%s USD no fue seleccionada para el envío %s → %s. La oferta ganadora fue de $%s USD', v_offers.offer_price, v_origin, v_destination, v_winning_offer.price),
        jsonb_build_object(
          'shipment_uuid', v_uuid::text,
          'agent_code', v_offers.agent_code,
          'price', v_offers.offer_price::text,
          'currency', 'USD',
          'origin', v_origin,
          'destination', v_destination,
          'winningPrice', v_winning_offer.price::text
        ),
        bid_id,
        v_offers.offer_id,
        v_market_id,
        false
      );
      v_rejected_count := v_rejected_count + 1;
    end if;
  end loop;

  return json_build_object(
    'success', true,
    'winners_notified', v_winner_count,
    'rejected_notified', v_rejected_count,
    'market_id', v_market_id
  );
end;
$$;

-- Allow authenticated users to execute the function
grant execute on function public.notify_agents_about_bid_closure(integer, integer) to authenticated, anon;


