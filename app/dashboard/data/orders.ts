export type OrderStatus =
| "Pending"
| "Processing"
| "Completed"
| "Failed";


export interface Order {

id: string;

shopifyOrderId: string;

partnerId: string;

agentId: string;


customerEmail: string;

bundleName: string;


amount: number;


status: OrderStatus;


createdAt: string;

}



export const orders: Order[] = [

{
id: "ORDER-001",

shopifyOrderId: "SHOPIFY-1001",

partnerId: "SHOP-001",

agentId: "AGENT-002",

customerEmail: "customer@example.com",

bundleName: "Europe 10GB 30 Days",

amount: 14.99,

status: "Completed",

createdAt: "2026-08-04",
},


];
