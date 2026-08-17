"use client";

import React from "react";

interface ESimOrder {
orderId: string;
customerName: string;
planName: string;
date: string;
price: number;
status: "Completed" | "Processing" | "Failed";
}


interface RecentOrdersProps {
orders: ESimOrder[];
}


export default function RecentOrders({
orders
}: RecentOrdersProps) {

return (
<div className="bg-[#070812]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">

<div className="flex justify-between items-center mb-6">

<div>
<h3 className="text-lg font-bold text-white">
Recent eSIM Orders
</h3>

<p className="text-xs text-slate-400 mt-0.5">
Track your agency live eSIM sales and customer allocations.
</p>
</div>


<span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
Live Sales
</span>

</div>


<div className="overflow-x-auto">

<table className="w-full text-left border-collapse">


<thead>

<tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">

<th className="py-3 px-4 font-semibold">
Order ID
</th>

<th className="py-3 px-4 font-semibold">
Customer
</th>

<th className="py-3 px-4 font-semibold">
eSIM Plan
</th>

<th className="py-3 px-4 font-semibold">
Date & Time
</th>

<th className="py-3 px-4 font-semibold">
Price
</th>

<th className="py-3 px-4 font-semibold text-right">
Status
</th>

</tr>

</thead>


<tbody className="divide-y divide-white/5 text-sm">


{orders.length === 0 ? (

<tr>

<td
colSpan={6}
className="py-8 text-center text-slate-400"
>
No eSIM orders yet
</td>

</tr>


) : (


orders.map((order) => (

<tr
key={order.orderId}
className="hover:bg-white/[0.02] transition-colors"
>


<td className="py-4 px-4 font-mono text-white font-medium">
{order.orderId}
</td>


<td className="py-4 px-4 text-slate-200">
{order.customerName}
</td>


<td className="py-4 px-4 text-slate-300">
{order.planName}
</td>


<td className="py-4 px-4 text-slate-400 text-xs">
{order.date}
</td>


<td className="py-4 px-4 font-mono font-bold text-white">
${order.price.toFixed(2)}
</td>


<td className="py-4 px-4 text-right">

<span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">

{order.status}

</span>

</td>


</tr>

))

)}


</tbody>


</table>


</div>


</div>
);
}
