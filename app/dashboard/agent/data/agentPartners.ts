export interface AgentPartner {

    id: string;
    
    shopId: string;
    
    companyName: string;
    
    email: string;
    
    country: string;
    
    creditBalance: number;
    
    totalOrders: number;
    
    totalSales: number;
    
    status: "Active" | "Suspended";
    
    commission: number;
    
    agentId: string;
    
    }
    
    
    
    export const agentPartners: AgentPartner[] = [
    
    
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
    
    commission: 10,
    
    agentId: "AGENT-001",
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
    
    commission: 15,
    
    agentId: "AGENT-001",
    },
    
    
    ];
    