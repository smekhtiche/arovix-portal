"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AgentPartnerDetail() {
const router = useRouter();
const supabase = createClient();
const params = useParams();
const partnerId = params.id;

const [partner, setPartner] = useState<any>(null);
const [transactions, setTransactions] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function fetchPartnerAndTransactions() {
try {
setLoading(true);

// 1. جلب بيانات الشريك مع المحل المرتبط به
const { data: partnerData, error: partnerError } = await supabase
.from("partners")
.select("*, business_shops(*)")
.eq("id", partnerId)
.single();

if (partnerError) {
console.error("Error fetching partner:", partnerError.message);
setLoading(false);
return;
}

setPartner(partnerData);

// 2. جلب المعاملات الخاصة بالمحل بشكل آمن وديناميكي
const shop = Array.isArray(partnerData?.business_shops)
? partnerData.business_shops[0]
: partnerData?.business_shops;

if (shop && shop.id) {
const { data: txData, error: txError } = await supabase
.from("business_credit_transactions")
.select("*")
.eq("shop_id", shop.id)
.order("created_at", { ascending: false });

if (!txError && txData) {
setTransactions(txData);
}
}
} catch (err) {
console.error("Unexpected error:", err);
} finally {
setLoading(false);
}
}

if (partnerId) {
fetchPartnerAndTransactions();
}
}, [supabase, partnerId]);

if (loading) {
return <div className="min-h-screen bg-[#02030a] text-white p-8 font-mono">Loading partner details...</div>;
}

if (!partner) {
return <div className="min-h-screen bg-[#02030a] text-white p-8 font-mono">Partner not found.</div>;
}

const shop = Array.isArray(partner.business_shops) ? partner.business_shops[0] : partner.business_shops;
// حساب إجمالي عمليات الشحن (Top-ups) أو المبيعات ديناميكياً من المعاملات الحقيقية
const totalTopUps = transactions
.filter((tx: any) => tx.transaction_type === 'top_up' || tx.amount > 0)
.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

// حساب الأرباح ديناميكياً بناءً على نسبة عمولة الشريك المحددة في لوحة التحكم
const commissionRate = Number(partner.commission || 0) / 100;
const estimatedProfit = totalTopUps * commissionRate;

return (
<div className="min-h-screen bg-[#02030a] text-white p-6 md:p-8 font-mono">
<div className="max-w-5xl mx-auto">
{/* زر العودة للوحة الأيجنت */}
<button
onClick={() => router.push("/dashboard/agent")}
className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-2 transition"
>
← Back to Agent Dashboard
</button>

{/* بطاقة معلومات الشريك الرئيسية */}
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800 mb-6">
<div className="flex justify-between items-start mb-4">
<div>
<h1 className="text-2xl font-bold text-white mb-1">{partner.company_name}</h1>
<p className="text-sm text-slate-400">{partner.email}</p>
</div>
<span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
{partner.status || "Active"}
</span>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
<div>
<div className="text-xs text-slate-400">Partner ID</div>
<div className="text-sm font-bold text-white">{partner.partner_id}</div>
</div>
<div>
<div className="text-xs text-slate-400">Credit Balance</div>
<div className="text-sm font-bold text-emerald-400">${Number(shop?.business_credit ?? 0).toFixed(2)}</div>
</div>
<div>
<div className="text-xs text-slate-400">Tier / Commission</div>
<div className="text-sm font-bold text-amber-400">{partner.tier} ({partner.commission}%)</div>
</div>
<div>
<div className="text-xs text-slate-400">Shop ID</div>
<div className="text-sm font-bold text-slate-300 font-mono">{shop?.shop_id || "N/A"}</div>
</div>
</div>
</div>

{/* بطاقات الإحصائيات والأرباح الديناميكية الخاصة بهذا الشريك */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Volume / Top-Ups</div>
<div className="text-xl font-bold text-[#31dfff]">${totalTopUps.toFixed(2)}</div>
</div>
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Estimated Profit / Commission</div>
<div className="text-xl font-bold text-amber-400">${estimatedProfit.toFixed(2)}</div>
</div>
<div className="bg-[#0b0e1a] p-4 rounded-xl border border-slate-800">
<div className="text-xs text-slate-400 uppercase font-medium mb-1">Total Transactions Count</div>
<div className="text-xl font-bold text-white">{transactions.length}</div>
</div>
</div>

{/* جدول سجل المعاملات والـ Top-up الحقيقي */}
<div className="bg-[#0b0e1a] p-6 rounded-xl border border-slate-800">
<h2 className="text-lg font-bold mb-4 text-[#31dfff]">Transactions & Top-Up History</h2>
{transactions.length > 0 ? (
<div className="overflow-x-auto">
<table className="w-full text-left text-sm text-slate-300">
<thead className="bg-[#02030a] text-xs uppercase text-slate-400">
<tr>
<th className="py-3 px-3">Transaction ID</th>
<th className="py-3 px-3">Type</th>
<th className="py-3 px-3">Amount</th>
<th className="py-3 px-3">Date</th>
</tr>
</thead>
<tbody>
{transactions.map((tx: any) => (
<tr key={tx.id} className="border-b border-slate-800">
<td className="py-3 px-3 font-mono text-xs text-slate-400">{tx.id}</td>
<td className="py-3 px-3">
<span className={`px-2 py-0.5 rounded text-xs font-medium ${
tx.transaction_type === 'top_up' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
}`}>
{tx.transaction_type || "credit_update"}
</span>
</td>
<td className="py-3 px-3 font-bold text-emerald-400">+${Number(tx.amount || 0).toFixed(2)}</td>
<td className="py-3 px-3 text-slate-400 text-xs">
{tx.created_at ? new Date(tx.created_at).toLocaleString() : "N/A"}
</td>
</tr>
))}
</tbody>
</table>
</div>
) : (
<p className="text-slate-500 text-sm">No transactions found for this partner yet. Once a top-up or operation occurs, it will appear here automatically.</p>
)}
</div>
</div>
</div>
);
}

