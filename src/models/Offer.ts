export interface Offer { 
        id: string;
        agent_code: string;
        agent_id: string;
        uuid: string;
        status: string;
        inserted_at: string;
        shipping_type: string;
        price: number;
        details?: {
        freight_fees?: {
            container?: string;
            dimensions?: {
            length: number;
            width: number;
            height: number;
            units?: string;
            };
            value?: number;
        };
        additional_fees?: Record<string, number>;
        origin_fees?: Record<string, number>;
        destination_fees?: Record<string, number>;
        basic_service?: {
            cancellation_fee?: number;
            free_days?: number;
            validity?: {
            time: number;
            unit: string;
            };
        };
        other_fees?: Record<string, number>;
        };
}