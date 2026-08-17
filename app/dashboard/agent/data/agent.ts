export interface Agent {

    id: string;
    
    name: string;
    
    email: string;
    
    country: string;
    
    status: "Active" | "Suspended";
    
    commission: number;
    
    }
    
    
    export const agents: Agent[] = [
    
    {
    id:"AGENT-001",
    name:"Victoria",
    email:"victoria@arovix.io",
    country:"Turkey",
    status:"Active",
    commission:10,
    },
    
    
    {
    id:"AGENT-002",
    name:"Adam",
    email:"adam@arovix.io",
    country:"Greece",
    status:"Active",
    commission:10,
    },
    
    ];
    