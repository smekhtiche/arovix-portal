"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function PartnerDetailsPage() {
const router = useRouter();
const supabase = createClient();
const params = useParams();
const partnerId = params?.id as string;

const [partner, setPartner] = useState<any>(null);
const [shop, setShop] = useState<any>(null);
const [transactions, setTransactions] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [errorMsg, setErrorMsg] = useState("");

useEffect(() => {
if (!partnerId) return;

async function fetchPartnerDetails() {
try {
setLoading(true);

// 1. جلب بيانات الشريك الأساسية من جدول partners
const { data: partnerData, error: partnerError } = await supabase
.from("partners")
.select("*")
.eq("id", partnerId)
.single();

if (partnerError) throw partnerError;
setPartner(partnerData);

// 2. جلب بيانات المتجر والكريدت من جدول business_shops
const { data: shopData, error: shopError } = await supabase
.from("business_shops")
.select("*")
.eq("partner_id", partnerId)
.maybeSingle();

if (shopError) {
console.error("Error fetching shop:", shopError.message);
} else {
setShop(shopData);

// 3. جلب المعاملات المالية (Transactions) إذا وجد المتجر
if (shopData) {
const { data: txData, error: txError } = await supabase
.from("business_credit_transactions")
.select("*")
.eq("shop_id", shopData.shop_id)
.order("created_at", { ascending: false });

if (!txError && txData) {
setTransactions(txData);
}
}
}
} catch (err: any) {
console.error("Error loading partner details:", err);
setErrorMsg("Partner not found or database error.");
} finally {
setLoading(false);
}
}

fetchPartnerDetails();
}, [supabase, partnerId]);

if (loading) {
return (
<div className="min-h-screen bg-[#02030a] text-white flex items-center justify-center font-mono">
<p className="text-slate-400 text-lg">Loading Partner Details...</p>
</div>
);
}

if (errorMsg || !partner) {
return (
<div className="min-h-screen bg-[#02030a] text-white p-8 flex flex-col items-center justify-center font-mono">
<h1 className="text-2xl font-bold text-red-400 mb-4">Partner Not Found</h1>
<p className="text-slate-400 mb-6">{errorMsg || "The requested partner does not exist."}</p>
<button
onClick={() => router.push("/dashboard/admin")}
className="bg-[#31dfff] text-[#02030a] font-bold px-6 py-2 rounded-lg hover:opacity-90 transition"
>
Back to Dashboard
</button>
</div>
);
}

return (
<div className="min-h-screen bg-[#02030a] text-white p-6 md:p-8 font-mono">
<div className="max-w-7xl mx-auto">
{/* Header & Back Button */}
<div className="flex justify-between items-center mb-8">
<div>
<h1 className="text-2xl font-bold text-white">{partner.company_name || "Partner Details"}</h1>
<p className="text-sm text-slate-400">Complete overview of partner operations and transactions</p>
</div>
<button
onClick={() => router.push("/dashboard/admin")}
className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition"
>
← Back to Dashboard
</button>
</div>

{/* Info Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div className="bg-[#0b0e1a] p-5 rounded-xl border border-slate-800">
<span className="text-xs text-slate-400 uppercase">Partner ID</span>
<p className="text-lg font-bold text-[#31dfff] mt-1">{partner.partner_id || partner.id}</p>
</div>

<div className="bg-[#0b0e1a] p-5 rounded-xl border border-slate-800">
<span className="text-xs text-slate-400 uppercase">Business Credit</span>
<p className="text-2xl font-bold text-emerald-400 mt-1">
${shop?.business_credit?.toFixed(2) || "0.00"}
</p>
</div>

<div className="bg-[#0b0e1a] p-5 rounded-xl border border-slate-800">
<span className="text-xs text-slate-400 uppercase">Tier / Commission</span>
<div className="flex items-center gap-2 mt-1">
<span className="bg-slate-800 px-2 py-0.5 rounded text-sm">{partner.tier || "Standard"}</span>
<span className="text-amber-400 font-bold text-sm">{partner.commission || 0}%</span>
</div>
</div>

<div className="bg-[#0b0e1a] p-5 rounded-xl border border-slate-800">
<span className="text-xs text-slate-400 uppercase">Status</span>
<div className="mt-1">
<span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-medium">
{partner.status || "Active"}
</span>
</div>
</div>
</div>

{/* Detailed Information Section */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800 lg:col-span-1">
<h3 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-2">Contact & Info</h3>
<div className="flex flex-col gap-3 text-sm text-slate-300">
<div>
<span className="text-xs text-slate-500 block">Company Name</span>
<span className="font-medium text-white">{partner.company_name}</span>
</div>
<div>
<span className="text-xs text-slate-500 block">Email Address</span>
<span className="font-medium text-white">{partner.email || "Not Provided"}</span>
</div>
<div>
<span className="text-xs text-slate-500 block">Phone Number</span>
<span className="font-medium text-white">{partner.phone || "Not Provided"}</span>
</div>
<div>
<span className="text-xs text-slate-500 block">Shop ID</span>
<span className="font-medium text-[#31dfff]">{shop?.shop_id || "No Shop Assigned"}</span>
</div>
</div>
</div>

{/* Quick Metrics / Summary */}
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800 lg:col-span-2 flex flex-col justify-between">
<div>
<h3 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-2">Performance Summary</h3>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div className="bg-[#02030a] p-4 rounded-lg border border-slate-800">
<span className="text-xs text-slate-400 block">Total Orders</span>
<span className="text-xl font-bold text-white mt-1 block">0</span>
</div>
<div className="bg-[#02030a] p-4 rounded-lg border border-slate-800">
<span className="text-xs text-slate-400 block">Total Profit</span>
<span className="text-xl font-bold text-emerald-400 mt-1 block">$0.00</span>
</div>
<div className="bg-[#02030a] p-4 rounded-lg border border-slate-800">
<span className="text-xs text-slate-400 block">Transactions Count</span>
<span className="text-xl font-bold text-[#31dfff] mt-1 block">{transactions.length}</span>
</div>
</div>
</div>
</div>
</div>

{/* Transactions Table */}
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">
<h3 className="text-md font-bold text-white mb-4">Credit Transactions History</h3>
<div className="overflow-x-auto">
<table className="w-full text-left text-sm text-slate-300">
<thead className="bg-[#02030a] text-xs uppercase text-slate-400">
<tr>
<th className="py-3 px-4">Transaction ID</th>
<th className="py-3 px-4">Type</th>
<th className="py-3 px-4">Amount</th>
<th className="py-3 px-4">Date</th>
</tr>
</thead>
<tbody>
{transactions.length > 0 ? (
transactions.map((tx: any) => (
<tr key={tx.id || tx.transaction_id} className="border-b border-slate-800">
<td className="py-3 px-4 font-mono text-xs text-slate-400">{tx.id || tx.transaction_id}</td>
<td className="py-3 px-4">
<span className="px-2 py-1 rounded bg-slate-800 text-xs text-white">
{tx.type || tx.transaction_type || "Credit Update"}
</span>
</td>
<td className="py-3 px-4 font-bold text-emerald-400">${tx.amount || tx.credit_amount || 0}</td>
<td className="py-3 px-4 text-xs text-slate-400">
{tx.created_at ? new Date(tx.created_at).toLocaleString() : "N/A"}
</td>
</tr>
))
) : (
<tr>
<td colSpan={4} className="text-center py-6 text-slate-500">
No transactions recorded yet for this partner.
</td>
</tr>
)}
</tbody>
</table>
</div>
</div>
</div>
</div>
);
}

