// src/models/BidListItem.ts

export class BidListItem {
  constructor(
    public id: number,
    public status: string,
    public uuid: string,
    public agent_code: string,
    public origin_id: number,
    public origin_name: string,
    public origin_country: string,
    public destination_id: number,
    public destination_name: string,
    public destination_country: string,
    public transportation: string,
    public comex_type: string,
    public expiration_date: string,
    public shipping_type: string,
    public value: string,
    public currency: string,
    public additional_info: string,
    public user_id: number,
    public market_id: number,
    public bid_details_id: number,
    public inserted_at: string,
    public last_price: number
  ) {}
}
