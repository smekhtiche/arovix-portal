export type TransactionType =
| "TopUp"
| "Purchase"
| "Commission"
| "Refund";


export interface Transaction {

id: string;


partnerId: string;


agentId: string;


type: TransactionType;


amount: number;


balanceAfter: number;


description: string;


createdAt: string;

}



export const transactions: Transaction[] = [


{
id: "TX-001",

partnerId: "SHOP-001",

agentId: "AGENT-002",

type: "TopUp",

amount: 500,

balanceAfter: 500,

description: "Initial business credit top up",

createdAt: "2026-08-04",

},



{
id: "TX-002",

partnerId: "SHOP-001",

agentId: "AGENT-002",

type: "Purchase",

amount: -14.99,

balanceAfter: 485.01,

description: "eSIM Europe 10GB purchase",

createdAt: "2026-08-04",

},



{
id: "TX-003",

partnerId: "SHOP-001",

agentId: "AGENT-002",

type: "Commission",

amount: 1.50,

balanceAfter: 1.50,

description: "Agent commission earned",

createdAt: "2026-08-04",

},


];
