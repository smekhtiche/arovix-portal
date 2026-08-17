"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function BusinessCreditHistoryPage() {
// بيانات افتراضية لعمليات شحن وتاريخ الرصيد (سيتم ربطها بالـ API لاحقاً)
const [creditTransactions] = useState([
{
id: "TXN-9842",
date: "2026-07-28 10:30",
amount: "+$500.00",
type: "Top-Up",
method: "Bank Transfer",
invoice: "INV-2026-089",
approvedBy: "Admin (Naji)",
status: "Approved",
remainingCredit: "$4,850.00"
},
{
id: "TXN-9510",
date: "2026-07-15 14:20",
amount: "+$1,000.00",
type: "Top-Up",
method: "USDT / Crypto",
invoice: "INV-2026-072",
approvedBy: "System Auto",
status: "Approved",
remainingCredit: "$4,350.00"
},
{
id: "TXN-9120",
date: "2026-07-01 09:15",
amount: "+$2,500.00",
type: "Top-Up",
method: "Credit Card",
invoice: "INV-2026-054",
approvedBy: "Admin (Samir)",
status: "Approved",
remainingCredit: "$3,350.00"
}
]);

return (
<div className="min-h-screen bg-[#070812] text-white p-6 lg:p-10 font-sans space-y-8">

{/* Header & Navigation */}
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
FINANCIAL LEDGER
</span>
<span className="text-xs text-slate-400 font-mono">Credit & Invoices Tracking</span>
</div>
<h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
Business Credit <span className="text-[#31dfff]">History</span>
</h1>
<p className="text-xs lg:text-sm text-slate-400 mt-1">
Complete institutional record of all credit top-ups, payment methods, invoices, and remaining balances.
</p>
</div>

<Link href="/dashboard/agency">
<button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono rounded-xl transition">
← Back to Dashboard
</button>
</Link>
</div>

{/* Credit History Table */}
<div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
<div className="flex justify-between items-center">
<h3 className="text-sm font-mono text-[#31dfff] uppercase tracking-wider">
📋 Top-Up & Credit Audit Trail
</h3>
<span className="text-xs text-slate-400 font-mono">Showing all approved transactions</span>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left border-collapse font-mono text-xs">
<thead>
<tr className="border-b border-white/10 text-slate-400 text-[11px]">
<th className="py-3 px-4">TXN ID</th>
<th className="py-3 px-4">Date & Time</th>
<th className="py-3 px-4">Amount</th>
<th className="py-3 px-4">Method</th>
<th className="py-3 px-4">Invoice</th>
<th className="py-3 px-4">Approved By</th>
<th className="py-3 px-4">Status</th>
<th className="py-3 px-4 text-right">Remaining Credit</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5 text-slate-300">
{creditTransactions.map((tx) => (
<tr key={tx.id} className="hover:bg-white/[0.02] transition">
<td className="py-4 px-4 font-bold text-white">{tx.id}</td>
<td className="py-4 px-4 text-slate-400">{tx.date}</td>
<td className="py-4 px-4 text-emerald-400 font-bold">{tx.amount}</td>
<td className="py-4 px-4">{tx.method}</td>
<td className="py-4 px-4 text-[#31dfff] underline cursor-pointer">{tx.invoice}</td>
<td className="py-4 px-4 text-slate-400">{tx.approvedBy}</td>
<td className="py-4 px-4">
<span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
{tx.status}
</span>
</td>
<td className="py-4 px-4 text-right font-bold text-white">{tx.remainingCredit}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>

</div>
);
}

