"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SalesFinancialReportsPage() {
const supabase = createClient();

const [searchTerm, setSearchTerm] = useState("");
const [dateFilter, setDateFilter] = useState("All");
const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

// مصفوفة فارغة تماماً لربطها بالبيانات الحقيقية لاحقاً
const [salesData, setSalesData] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function fetchRealSalesData() {
try {
setLoading(true);
// يمكنك لاحقاً جلب السجلات الحقيقية من جدول المبيعات أو الطلبات في Supabase هنا
// مثال: const { data, error } = await supabase.from('orders').select('*');
// حالياً سنتركها فارغة تماماً لتتصفّر اللوحة بنجاح
setSalesData([]);
} catch (err) {
console.error("Error fetching sales data:", err);
} finally {
setLoading(false);
}
}

fetchRealSalesData();
}, [supabase]);

const filteredSales = salesData.filter(
(item) =>
item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
item.country?.toLowerCase().includes(searchTerm.toLowerCase())
);

const totalRevenue = salesData.reduce((acc, item) => acc + (item.retailPrice || 0), 0);
const totalCreditUsed = salesData.reduce((acc, item) => acc + (item.baseCost || 0), 0);
const totalNetProfit = salesData.reduce((acc, item) => acc + (item.profit || 0), 0);
const averageOrderValue = totalRevenue / (salesData.length || 1);
const averageProfitPerEsim = totalNetProfit / (salesData.length || 1);
const currentProfitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

const summaryCards = [
{ label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, sub: "Gross retail value", accent: "#ffffff" },
{ label: "Credit Used", value: `$${totalCreditUsed.toFixed(2)}`, sub: "Base cost deductions", accent: "#f5b94d" },
{ label: "Net Profit", value: `$${totalNetProfit.toFixed(2)}`, sub: "Total agency margin", accent: "#34d399" },
{ label: "Current Margin", value: `${currentProfitMargin.toFixed(1)}%`, sub: "Average profitability", accent: "#31dfff" },
{ label: "Avg Order Value", value: `$${averageOrderValue.toFixed(2)}`, sub: "Per transaction", accent: "#ffffff" },
{ label: "Avg Profit / eSIM", value: `$${averageProfitPerEsim.toFixed(2)}`, sub: "Margin per profile", accent: "#34d399" },
];

return (
<div className="min-h-screen bg-[#02030a] text-white relative overflow-hidden font-sans">
{/* Ambient glow layers */}
<div className="pointer-events-none fixed inset-0">
<div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-[#31dfff]/10 blur-[130px]" />
<div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-[#9d4fe0]/10 blur-[130px]" />
<div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-[#f5b94d]/5 blur-[140px]" />
</div>

{/* Subtle grid texture */}
<div
className="pointer-events-none fixed inset-0 opacity-[0.03]"
style={{
backgroundImage:
"linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
backgroundSize: "48px 48px",
}}
/>

<div className="relative max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
{/* 1. Header & Navigation */}
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
<div>
<div className="flex items-center gap-2 mb-2">
<span className="px-2.5 py-1 rounded-full bg-[#31dfff]/10 text-[#31dfff] border border-[#31dfff]/20 text-[10px] font-mono tracking-wider">
AROVIX FINANCIAL LEDGER
</span>
<span className="text-[10px] text-white/40 font-mono">LIVE MODE</span>
</div>
<h1
className="text-2xl lg:text-3xl font-bold tracking-tight"
style={{ fontFamily: "'Space Grotesk', sans-serif" }}
>
Sales &amp; <span className="text-[#31dfff]">Financial Reports</span>
</h1>
<p className="text-xs lg:text-sm text-white/50 mt-1.5 max-w-xl">
Complete institutional audit trail, profit margins, and automated eSIM retail distribution metrics.
</p>
</div>

<div className="flex items-center gap-3">
<Link href="/dashboard/agency">
<button className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/70 text-xs font-mono rounded-xl transition-all duration-300 cursor-pointer">
← Back to Dashboard
</button>
</Link>
<button
onClick={() => alert("No data to export yet")}
className="px-4 py-2.5 bg-[#31dfff]/10 border border-[#31dfff]/30 text-[#31dfff] hover:bg-[#31dfff]/20 text-xs font-mono font-bold rounded-xl transition-all duration-300 cursor-pointer"
>
Export CSV
</button>
<button
onClick={() => alert("No data to export yet")}
className="px-4 py-2.5 bg-[#9d4fe0]/10 border border-[#9d4fe0]/30 text-[#c896f0] hover:bg-[#9d4fe0]/20 text-xs font-mono font-bold rounded-xl transition-all duration-300 cursor-pointer"
>
Export PDF
</button>
</div>
</div>

{/* 2. Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
{summaryCards.map((card) => (
<div
key={card.label}
className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
>
<div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5">
{card.label}
</div>
<div
className="text-xl font-bold"
style={{ fontFamily: "'Space Grotesk', sans-serif", color: card.accent }}
>
{card.value}
</div>
<div className="text-[10px] text-white/40 mt-1">{card.sub}</div>
</div>
))}
</div>

{/* 3. Search & Filter Bar */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="w-full md:w-96">
<input
type="text"
placeholder="Search order, customer, or country..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full bg-[#02030a] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:border-[#31dfff]/50 outline-none transition-colors"
/>
</div>

<div className="flex items-center gap-3 w-full md:w-auto">
<span className="text-xs font-mono text-white/40">Filter range:</span>
<select
value={dateFilter}
onChange={(e) => setDateFilter(e.target.value)}
className="bg-[#02030a] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:border-[#31dfff]/50 outline-none transition-colors cursor-pointer"
>
<option value="All">All Time</option>
<option value="Today">Today</option>
<option value="Last 7 Days">Last 7 Days</option>
<option value="Last 30 Days">Last 30 Days</option>
<option value="This Month">This Month</option>
</select>
</div>
</div>

{/* 4. Sales Ledger Table */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
<h3 className="text-xs font-mono text-white/60 uppercase tracking-wider">
Institutional Sales Ledger ({filteredSales.length} Records)
</h3>
<span className="text-[10px] text-white/30 font-mono">Live tracking records</span>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-wider">
<th className="py-3 px-3">Order ID</th>
<th className="py-3 px-3">Date</th>
<th className="py-3 px-3">Country</th>
<th className="py-3 px-3">Package</th>
<th className="py-3 px-3">Base Cost</th>
<th className="py-3 px-3">Retail Price</th>
<th className="py-3 px-3">Net Profit</th>
<th className="py-3 px-3">Remaining Credit</th>
<th className="py-3 px-3">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5 text-xs font-mono">
{loading ? (
<tr>
<td colSpan={9} className="text-center py-10 text-white/40">
Loading sales ledger...
</td>
</tr>
) : filteredSales.length > 0 ? (
filteredSales.map((item) => (
<tr
key={item.id}
onClick={() => setSelectedOrder(item)}
className="hover:bg-[#31dfff]/[0.05] transition-colors cursor-pointer"
>
<td className="py-3.5 px-3 text-[#31dfff] font-bold">{item.id}</td>
<td className="py-3.5 px-3 text-white/50">{item.date}</td>
<td className="py-3.5 px-3 text-white font-sans">{item.country}</td>
<td className="py-3.5 px-3 text-white/70">{item.package}</td>
<td className="py-3.5 px-3 text-[#f5b94d]">${item.baseCost?.toFixed(2)}</td>
<td className="py-3.5 px-3 text-white font-bold">${item.retailPrice?.toFixed(2)}</td>
<td className="py-3.5 px-3 text-emerald-400 font-bold">+${item.profit?.toFixed(2)}</td>
<td className="py-3.5 px-3 text-white/70 font-bold">${item.remainingCredit?.toFixed(2)}</td>
<td className="py-3.5 px-3">
<span className="px-2.5 py-1 rounded-full text-[10px] border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
{item.status}
</span>
</td>
</tr>
))
) : (
<tr>
<td colSpan={9} className="text-center py-12 text-white/40 font-mono">
No sales records found. Your live transactions will appear here once initiated.
</td>
</tr>
)}
</tbody>
</table>
</div>
</div>
</div>

{/* 5. Transaction Detail Modal */}
{selectedOrder && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
<div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#050710] p-6 text-white shadow-2xl space-y-5">
<div className="flex justify-between items-center border-b border-white/10 pb-3">
<div>
<span className="text-[10px] font-mono text-[#31dfff] tracking-wider">TRANSACTION AUDIT</span>
<h3 className="text-sm font-bold font-mono text-white mt-0.5">{selectedOrder.id}</h3>
</div>
<button
onClick={() => setSelectedOrder(null)}
className="text-white/40 hover:text-white text-lg transition-colors cursor-pointer"
>
✕
</button>
</div>
{/* تفاصيل الطلب عند النقر */}
</div>
</div>
)}
</div>
);
}

