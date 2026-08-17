export type PartnerTier =
| "Standard"
| "Silver"
| "Gold"
| "Platinum"
| "Elite";


export interface Partner {
id: string;

shopId: string;

companyName: string;

email: string;

country: string;

creditBalance: number;

totalOrders: number;

totalSales: number;

status: "Active" | "Suspended";

agentId: string;

tier: PartnerTier;

commission?: number;
}


export const partners: Partner[] = [

{
id: "1",

shopId: "SHOP-001",

companyName: "Sunrise Travel Agency",

email: "sunrise@arovix.io",

country: "Greece",

creditBalance: 350,

totalOrders: 24,

totalSales: 428.5,

status: "Active",

agentId: "AGENT-002",

tier: "Standard",

commission: 10,
},


{
id: "2",

shopId: "SHOP-002",

companyName: "Jazeera Digital Center",

email: "jazeera@arovix.io",

country: "Turkey",

creditBalance: 120,

totalOrders: 8,

totalSales: 142,

status: "Active",

agentId: "AGENT-001",

tier: "Gold",

commission: 15,
},

];
