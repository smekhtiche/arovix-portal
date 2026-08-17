"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

import DashboardHeader from "./componants/DashboardHeader";
import QuickActions from "./componants/QuickActions";
import RecentOrders from "./componants/RecentOrders";
import RecentTransactions from "./componants/RecentTransactions";

type OrderStatus =
| "Completed"
| "Processing"
| "Failed";

type TransactionStatus =
| "Approved"
| "Pending"
| "Rejected";

type DashboardOrder = {
orderId: string;
customerName: string;
planName: string;
date: string;
price: number;
status: OrderStatus;
};

type DashboardTransaction = {
id: string;
date: string;
amount: number;
paymentMethod: string;
reference: string;
status: TransactionStatus;
};

type SuccessResult = {
orderNumber: string;
iccid: string;
matchingId: string;
price: number;
remainingBalance: number;
};

type PartnerRecord = {
id?: string;
partner_id?: string;
user_id?: string;
company_name?: string;
companyName?: string;
partner_type?: string;
partnerType?: string;
email?: string;
phone?: string;
status?: string;
active?: boolean;
commission?: number | string;
tier?: string;
agent_id?: number | string;
};

type BusinessShopRecord = {
id?: string;
partner_id?: string;
shop_id?: string;
shop_name?: string;
business_credit?: number | string;
currency?: string;
status?: string;
};

export default function AgencyDashboardPage() {
const router = useRouter();
const supabase = createClient();

const [successResult, setSuccessResult] =
useState<SuccessResult | null>(null);

const [loading, setLoading] =
useState(true);

const [dashboardError, setDashboardError] =
useState("");

const [activePartner, setActivePartner] =
useState<PartnerRecord | null>(null);

const [activeShop, setActiveShop] =
useState<BusinessShopRecord | null>(null);

const [balance, setBalance] =
useState<number>(0);

const [profit, setProfit] =
useState<number>(0);

const [ordersCount, setOrdersCount] =
useState<number>(0);

const [esimsCount, setEsimsCount] =
useState<number>(0);

const [orders, setOrders] =
useState<DashboardOrder[]>([]);

const [transactions, setTransactions] =
useState<DashboardTransaction[]>([]);

/*
============================================================
LOAD REAL SUPABASE PARTNER + BUSINESS SHOP
============================================================
*/

useEffect(() => {
let mounted = true;

const loadDashboard = async () => {
try {
setLoading(true);
setDashboardError("");

/*
--------------------------------------------------------
1. GET AUTHENTICATED USER
--------------------------------------------------------
*/

const {
data: { user },
error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
if (mounted) {
router.replace("/login");
}

return;
}

/*
--------------------------------------------------------
2. USE AUTH USER UUID
--------------------------------------------------------

IMPORTANT:
We no longer identify the Partner by email.

The real relationship is:

auth.users.id
↓
partners.user_id
*/

const userId = user.id;

if (!userId) {
if (mounted) {
setDashboardError(
"Authenticated account has no valid user ID."
);
}

return;
}

/*
--------------------------------------------------------
3. FIND PARTNER BY AUTH USER UUID
--------------------------------------------------------
*/

const {
data: partner,
error: partnerError,
} = await supabase
.from("partners")
.select("*")
.eq("user_id", userId)
.maybeSingle();

if (partnerError) {
console.error(
"Partner loading error:",
partnerError
);

if (mounted) {
setDashboardError(
"Unable to load partner information."
);
}

return;
}

if (!partner) {
if (mounted) {
setDashboardError(
"No partner account is linked to this login."
);
}

return;
}

/*
--------------------------------------------------------
4. SAVE REAL PARTNER
--------------------------------------------------------
*/

const realPartner =
partner as PartnerRecord;

if (mounted) {
setActivePartner(realPartner);
}

/*
--------------------------------------------------------
5. FIND BUSINESS SHOP BY PARTNER DATABASE UUID
--------------------------------------------------------

IMPORTANT:

partners.id
↓
business_shops.partner_id
*/

let shop: BusinessShopRecord | null =
null;

if (realPartner.id) {
const {
data: shopData,
error: shopError,
} = await supabase
.from("business_shops")
.select(
"id, partner_id, shop_id, shop_name, business_credit, currency, status"
)
.eq(
"partner_id",
realPartner.id
)
.maybeSingle();

if (shopError) {
console.error(
"Business Shop loading error:",
shopError
);

if (mounted) {
setDashboardError(
"Unable to load Business Shop information."
);
}

return;
}

if (shopData) {
shop =
shopData as BusinessShopRecord;
}
}

/*
--------------------------------------------------------
6. SAVE REAL BUSINESS SHOP + BUSINESS CREDIT
--------------------------------------------------------
*/

if (shop) {
const realCredit =
Number(shop.business_credit);

if (mounted) {
setActiveShop(shop);

setBalance(
Number.isFinite(realCredit)
? Number(realCredit.toFixed(2))
: 0
);

setDashboardError("");
}
} else {
if (mounted) {
setActiveShop(null);
setBalance(0);

setDashboardError(
"Partner account loaded, but no Business Shop is linked to this partner."
);
}
}

/*
--------------------------------------------------------
7. LOAD LOCAL DISPLAY RECORDS
--------------------------------------------------------
*/

let loadedOrders: DashboardOrder[] =
[];

let loadedTransactions:
DashboardTransaction[] = [];

try {
const savedOrders =
localStorage.getItem(
"arv_live_orders"
);

const savedTransactions =
localStorage.getItem(
"arv_live_transactions"
);

loadedOrders = savedOrders
? (JSON.parse(
savedOrders
) as DashboardOrder[])
: [];

loadedTransactions =
savedTransactions
? (JSON.parse(
savedTransactions
) as DashboardTransaction[])
: [];
} catch (storageError) {
console.error(
"Dashboard local storage error:",
storageError
);

loadedOrders = [];
loadedTransactions = [];
}

if (mounted) {
setOrders(loadedOrders);

setTransactions(
loadedTransactions
);

setProfit(0);

setOrdersCount(
loadedOrders.length
);

setEsimsCount(
loadedOrders.length
);
}
} catch (error) {
console.error(
"Dashboard loading error:",
error
);

if (mounted) {
setDashboardError(
"An unexpected error occurred while loading the dashboard."
);
}
} finally {
if (mounted) {
setLoading(false);
}
}
};

loadDashboard();

return () => {
mounted = false;
};
}, [router, supabase]);

/*
============================================================
REAL eSIM ISSUE SUCCESS
============================================================
*/

const handleIssueSuccess = (
apiData: any,
packagePrice: number,
backendRemainingBalance?: number
) => {
console.log(
"REAL eSIM ISSUE SUCCESS:",
apiData
);

const returnedBalance = Number(
backendRemainingBalance
);

const apiBalance = Number(
apiData?.remainingBalance ??
apiData?.businessCredit ??
apiData?.balance
);

let realRemainingBalance =
balance;

if (
Number.isFinite(
returnedBalance
)
) {
realRemainingBalance =
returnedBalance;
} else if (
Number.isFinite(apiBalance)
) {
realRemainingBalance =
apiBalance;
}

setBalance(
Number(
realRemainingBalance.toFixed(2)
)
);

if (
Number.isFinite(
Number(apiData?.profit)
)
) {
setProfit(
Number(apiData.profit)
);
}

const newOrder: DashboardOrder = {
orderId:
apiData?.orderNumber ||
apiData?.orderId ||
apiData?.orderReference ||
`ARV-ORD-${Math.floor(
100000 +
Math.random() *
900000
)}`,

customerName:
apiData?.customerName ||
"Customer",

planName:
apiData?.package ||
apiData?.packageName ||
"eSIM Package",

date:
apiData?.createdAt ||
new Date().toISOString(),

price:
Number(packagePrice),

status:
"Completed",
};

setOrders(
(previousOrders) => {
const updatedOrders = [
newOrder,
...previousOrders,
];

localStorage.setItem(
"arv_live_orders",
JSON.stringify(
updatedOrders
)
);

return updatedOrders;
}
);

setOrdersCount(
(previous) =>
previous + 1
);

setEsimsCount(
(previous) =>
previous + 1
);

const newTransaction:
DashboardTransaction = {
id:
apiData?.transactionId ||
apiData?.transactionReference ||
`TRX-${Math.floor(
100000 +
Math.random() *
900000
)}`,

date:
apiData?.createdAt ||
new Date().toISOString(),

amount:
-Number(packagePrice),

paymentMethod:
"Business Credit",

reference:
newOrder.orderId,

status:
"Approved",
};

setTransactions(
(previousTransactions) => {
const updatedTransactions = [
newTransaction,
...previousTransactions,
];

localStorage.setItem(
"arv_live_transactions",
JSON.stringify(
updatedTransactions
)
);

return updatedTransactions;
}
);

setSuccessResult({
orderNumber:
newOrder.orderId,

iccid:
apiData?.iccid ||
"—",

matchingId:
apiData?.matchingId ||
apiData?.lpaCode ||
"—",

price:
Number(packagePrice),

remainingBalance:
Number(
realRemainingBalance.toFixed(
2
)
),
});
};

/*
============================================================
LOADING
============================================================
*/

if (loading) {
return (
<div className="min-h-screen bg-[#070812] text-white flex items-center justify-center">
<div className="text-center space-y-3">
<div className="text-[#31dfff] text-xl font-bold">
AROVIX
</div>

<div className="text-xs text-slate-400">
Loading partner dashboard...
</div>
</div>
</div>
);
}

/*
============================================================
REAL PARTNER DISPLAY VALUES
============================================================
*/

const partnerName =
activePartner?.company_name ||
activePartner?.companyName ||
"AROVIX Agency";

const partnerCode =
activePartner?.partner_id ||
"—";

const partnerType =
activePartner?.partner_type ||
"Agency";

const partnerEmail =
activePartner?.email ||
null;

const shopCode =
activeShop?.shop_id ||
"—";

/*
============================================================
COMMISSION DISPLAY
============================================================
*/

const commissionValue =
Number(activePartner?.commission);

const commissionDisplay =
Number.isFinite(commissionValue)
? `${commissionValue}%`
: "—";

/*
============================================================
DASHBOARD STATS
============================================================
*/

const stats = [
{
label:
"Business Credit",

value:
`$${balance.toFixed(2)}`,

icon:
"💳",

borderColor:
"border-cyan-500/40",

valueColor:
"text-emerald-400",

note:
"Backend-controlled balance",
},

{
label:
"Today's Orders",

value:
ordersCount.toString(),

icon:
"📦",

borderColor:
"border-blue-500/30",

valueColor:
"text-white",

note:
"Successfully processed",
},

{
label:
"Active eSIMs",

value:
esimsCount.toString(),

icon:
"🌐",

borderColor:
"border-cyan-500/30",

valueColor:
"text-white",

note:
"Connected globally",
},

{
label:
"Commission",

value:
commissionDisplay,

icon:
"💰",

borderColor:
"border-amber-500/40",

valueColor:
"text-amber-300",

note:
"Current partner commission",
},

{
label:
"Est. Business Profit",

value:
`$${profit.toFixed(2)}`,

icon:
"📈",

borderColor:
"border-emerald-500/40",

valueColor:
"text-emerald-300",

note:
"Business performance",
},
];

/*
============================================================
RENDER
============================================================
*/

return (
<div className="p-6 space-y-6 bg-[#070812] min-h-screen text-white font-mono">

{/* HEADER */}

<DashboardHeader
partnerName={
partnerName
}

partnerCode={
partnerCode
}

partnerType={
partnerType as
| "Mobile Shop"
| "Travel Agency"
| "Business Partner"
| "Distribution Partner"
}
/>

{/* REAL SHOP INFO */}

<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-4">

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

<div>
<p className="text-[10px] text-slate-500 uppercase">
Partner ID
</p>

<p className="text-sm text-[#31dfff] font-bold">
{partnerCode}
</p>
</div>

<div>
<p className="text-[10px] text-slate-500 uppercase">
Shop ID
</p>

<p className="text-sm text-white font-bold">
{shopCode}
</p>
</div>

<div>
<p className="text-[10px] text-slate-500 uppercase">
Account Email
</p>

<p className="text-sm text-white">
{partnerEmail ||
"—"}
</p>
</div>

</div>
</div>

{/* DATABASE ERROR */}

{dashboardError && (
<div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300">
{dashboardError}
</div>
)}

{/* STATS */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

{stats.map(
(stat) => (
<div
key={
stat.label
}
className={`
bg-gradient-to-br
from-[#0c0f1d]
to-[#121730]
border
${stat.borderColor}
p-5
rounded-2xl
shadow-xl
space-y-2
`}
>

<div className="flex justify-between items-center">

<span className="text-xs text-slate-400 uppercase tracking-wider">
{stat.label}
</span>

<span className="p-2 bg-white/5 rounded-xl text-xs">
{stat.icon}
</span>

</div>

<div
className={`
text-3xl
font-black
${stat.valueColor}
`}
>
{stat.value}
</div>

<div className="text-[10px] text-slate-400 flex items-center gap-1">

<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

<span>
{stat.note}
</span>

</div>

</div>
)
)}

</div>

{/* SUCCESS */}

{successResult && (
<div className="bg-emerald-500/15 border border-emerald-500/40 p-6 rounded-3xl space-y-4 text-xs text-white shadow-2xl backdrop-blur-md">

<div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">

<div className="flex items-center gap-2">

<span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />

<span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
eSIM Issued Successfully
</span>

</div>

<button
type="button"
onClick={() =>
setSuccessResult(
null
)
}
className="text-slate-400 hover:text-white text-sm font-bold"
>
✕
</button>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">

<div className="space-y-2 bg-[#070812] p-4 rounded-2xl border border-white/10">

<p>
📦{" "}
<span className="text-slate-400">
Order ID:
</span>{" "}

<span className="text-white font-bold">
{
successResult.orderNumber
}
</span>
</p>

<p>
🌐{" "}
<span className="text-slate-400">
ICCID:
</span>{" "}

<span className="text-[#31dfff] font-bold">
{
successResult.iccid
}
</span>
</p>

<p>
🏷️{" "}
<span className="text-slate-400">
Matching ID:
</span>{" "}

<span className="text-white font-mono">
{
successResult.matchingId
}
</span>
</p>

</div>

<div className="space-y-2 bg-[#070812] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">

<div className="space-y-1">

<p>
💰{" "}
<span className="text-slate-400">
Charged:
</span>{" "}

<span className="text-rose-400 font-bold">
-$
{successResult.price.toFixed(
2
)}
</span>
</p>

<p>
💳{" "}
<span className="text-slate-400">
Backend Balance:
</span>{" "}

<span className="text-emerald-400 font-bold">
$
{successResult.remainingBalance.toFixed(
2
)}
</span>
</p>

</div>

<button
type="button"
onClick={() =>
setSuccessResult(
null
)
}
className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition"
>
Done & Close
</button>

</div>

</div>

</div>
)}

{/* QUICK ACTIONS */}

<QuickActions
partnerId={
partnerCode
}

shopId={
activeShop?.shop_id ||
""
}

partnerName={
partnerName
}

partnerEmail={
partnerEmail
}

partnerBalance={
balance
}

onIssueSuccess={
handleIssueSuccess
}
/>

{/* SALES LEDGER */}

<div className="bg-gradient-to-br from-[#0c0f1d] to-[#070812] border border-blue-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

<div className="flex items-center gap-3">

<div className="p-3 rounded-xl bg-blue-500/10 text-[#31dfff] text-xl">
📊
</div>

<div>

<h3 className="text-sm font-bold text-white">
Sales & Profit Reports Ledger
</h3>

<p className="text-xs text-slate-400">
View retail allocations,
margins, and financial
reports.
</p>

</div>

</div>

<Link
href="/dashboard/agency/sales"
className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/40 hover:border-[#31dfff] text-[#31dfff] text-xs font-mono font-bold rounded-xl transition flex items-center gap-2"
>
<span>
Open Sales Ledger
</span>

<span>
→
</span>
</Link>

</div>

{/* RECENT ORDERS / TRANSACTIONS */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

<RecentOrders
orders={
orders as any
}
/>

<RecentTransactions
transactions={
transactions as any
}
/>

</div>

</div>
);
}
