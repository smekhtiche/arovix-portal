export type AgentTier =
| "Standard"
| "Silver"
| "Gold"
| "Platinum"
| "Elite";


export interface Agent {
id: string;
name: string;
email: string;
country: string;

status: "Active" | "Suspended";

commission: number;

totalPartners: number;
totalSales: number;
}


export const agents: Agent[] = [
{
id: "AGENT-001",
name: "Victoria",
email: "victoria@arovix.io",
country: "Turkey",

status: "Active",

commission: 10,

totalPartners: 2,
totalSales: 1250,
},

{
id: "AGENT-002",
name: "Adam",
email: "adam@arovix.io",
country: "Greece",

status: "Active",

commission: 10,

totalPartners: 0,
totalSales: 0,
},
];
