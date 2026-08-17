"use client";

import React from "react";


interface Transaction {
id: string;
date: string;
amount: number;
paymentMethod: string;
reference: string;
status: "Approved" | "Pending" | "Rejected";
}


interface RecentTransactionsProps {
transactions: Transaction[];
}


export default function RecentTransactions({
transactions
}: RecentTransactionsProps) {


return (

<div className="bg-[#070812]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">


<div className="flex justify-between items-center mb-6">

<div>

<h3 className="text-lg font-bold text-white">
Recent Business Transactions
</h3>


<p className="text-xs text-slate-400 mt-0.5">
Track your business credit activity, top-ups, and eSIM purchases.
</p>


</div>


<span className="text-xs font-mono text-[#31dfff] bg-[#31dfff]/10 border border-[#31dfff]/30 px-3 py-1 rounded-full">
Live Records
</span>


</div>



<div className="overflow-x-auto">


<table className="w-full text-left border-collapse">


<thead>

<tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">


<th className="py-3 px-4 font-semibold">
Transaction ID
</th>


<th className="py-3 px-4 font-semibold">
Date & Time
</th>


<th className="py-3 px-4 font-semibold">
Amount
</th>


<th className="py-3 px-4 font-semibold">
Method
</th>


<th className="py-3 px-4 font-semibold">
Reference
</th>


<th className="py-3 px-4 font-semibold text-right">
Status
</th>


</tr>

</thead>



<tbody className="divide-y divide-white/5 text-sm">



{transactions.length === 0 ? (


<tr>

<td
colSpan={6}
className="py-8 text-center text-slate-400"
>

No transactions yet

</td>

</tr>



) : (


transactions.map((trx)=>(


<tr

key={`${trx.id}-${trx.date}-${trx.amount}`}

className="hover:bg-white/[0.02] transition-colors"

>



<td className="py-4 px-4 font-mono text-white font-medium">

{trx.id}

</td>



<td className="py-4 px-4 text-slate-300 text-xs">

{trx.date}

</td>



<td className="py-4 px-4 font-mono font-bold text-white">

${Number(trx.amount).toFixed(2)}

</td>



<td className="py-4 px-4 text-slate-300">

{trx.paymentMethod}

</td>



<td className="py-4 px-4 font-mono text-xs text-slate-400">

{trx.reference}

</td>



<td className="py-4 px-4 text-right">


<span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">

{trx.status}

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
