"use client";

import { Partner } from "../../data/partners";

interface AgentPartnersTableProps {
partners: Partner[];
searchTerm: string;
setSearchTerm: (value: string) => void;
}

export default function AgentPartnersTable({
partners,
searchTerm,
setSearchTerm,
}: AgentPartnersTableProps) {

const filteredPartners = partners.filter((partner)=>{
const search = searchTerm.toLowerCase();

return (
(partner.companyName || "").toLowerCase().includes(search)
||
(partner.email || "").toLowerCase().includes(search)
||
(partner.country || "").toLowerCase().includes(search)
||
(partner.shopId || "").toLowerCase().includes(search)
);
});

return (
<div className="mt-8 bg-[#070812]/80 backdrop-blur-xl rounded-[24px] border border-white/5 p-6 shadow-2xl">
<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
<h2 className="text-lg font-bold text-[#31dfff]">
Managed Partners
</h2>

<input
type="text"
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
placeholder="Search partners..."
className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm w-full sm:w-64"
/>
</div>

<div className="overflow-x-auto rounded-2xl border border-white/5">
<table className="w-full text-left text-sm text-slate-300">
<thead className="bg-black/40 text-xs text-slate-500 uppercase">
<tr>
<th className="px-4 py-3">Partner</th>
<th className="px-4 py-3">Country</th>
<th className="px-4 py-3">Credit</th>
<th className="px-4 py-3">Orders</th>
<th className="px-4 py-3">Sales</th>
<th className="px-4 py-3">Commission</th>
<th className="px-4 py-3">Status</th>
</tr>
</thead>

<tbody className="divide-y divide-white/5">
{
filteredPartners.length > 0 ?
filteredPartners.map((partner)=>(
<tr
key={partner.id}
className="hover:bg-white/[0.03]"
>
<td className="px-4 py-3">
<div className="text-white font-semibold">
{partner.companyName}
</div>
<div className="text-xs text-slate-500">
{partner.email}
</div>
<div className="text-xs text-[#31dfff]">
{partner.shopId}
</div>
</td>

<td className="px-4 py-3">
{partner.country}
</td>

<td className="px-4 py-3 text-[#f5b94d] font-bold">
${(typeof partner.creditBalance === 'number' ? partner.creditBalance : Number(partner.creditBalance) || 0).toFixed(2)}
</td>

<td className="px-4 py-3">
{partner.totalOrders || 0}
</td>

<td className="px-4 py-3">
${(typeof partner.totalSales === 'number' ? partner.totalSales : Number(partner.totalSales) || 0).toFixed(2)}
</td>

<td className="px-4 py-3 text-purple-400 font-semibold">
{partner.commission ?? 0}%
</td>

<td className="px-4 py-3 text-emerald-400">
{partner.status}
</td>
</tr>
))
:
<tr>
<td
colSpan={7}
className="px-4 py-6 text-center text-slate-500 text-xs"
>
No partners found.
</td>
</tr>
}
</tbody>
</table>
</div>
</div>
);
}

