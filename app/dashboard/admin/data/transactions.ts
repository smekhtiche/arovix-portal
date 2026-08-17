export interface Transaction {
    id: string;
    type: "Top Up" | "eSIM Order" | "Commission";
    partnerId: string;
    amount: number;
    status: "Completed" | "Pending";
    createdAt: string;
    }
    
    
    export const transactions: Transaction[] = [
    {
    id: "TX-001",
    type: "Top Up",
    partnerId: "1",
    amount: 350,
    status: "Completed",
    createdAt: new Date().toISOString(),
    },
    ];
    