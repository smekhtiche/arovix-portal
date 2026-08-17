import React from "react";

type StatsProps = {
partnerBalance: number;
todayOrders: number;
activeEsims: number;
totalProfit: number;
};

export default function StatsCards({
partnerBalance,
todayOrders,
activeEsims,
totalProfit,
}: StatsProps) {

return (

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">


<div className="bg-[#0c0f1d] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">

<div className="flex justify-between items-start">

<p className="text-xs text-slate-400">
Business Credit
</p>

<span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-xs">
💳
</span>

</div>


<div className="text-2xl font-extrabold text-white">
${partnerBalance.toFixed(2)}
</div>


<p className="text-[10px] text-emerald-400 font-semibold">
Available for eSIM issuing
</p>

</div>





<div className="bg-[#0c0f1d] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">

<div className="flex justify-between items-start">

<p className="text-xs text-slate-400">
Today's Orders
</p>

<span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl text-xs">
📦
</span>

</div>


<div className="text-2xl font-extrabold text-white">
{todayOrders}
</div>


<p className="text-[10px] text-slate-400">
Processed orders
</p>

</div>





<div className="bg-[#0c0f1d] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">

<div className="flex justify-between items-start">

<p className="text-xs text-slate-400">
Active eSIMs
</p>

<span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs">
🌐
</span>

</div>


<div className="text-2xl font-extrabold text-white">
{activeEsims}
</div>


<p className="text-[10px] text-slate-400">
Currently active lines
</p>

</div>





<div className="bg-[#0c0f1d] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">

<div className="flex justify-between items-start">

<p className="text-xs text-slate-400">
Top Destinations
</p>

<span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl text-xs">
🌍
</span>

</div>


<div className="text-xl font-extrabold text-white">
Europe
</div>


<p className="text-[10px] text-slate-400">
Turkey, USA, Europe
</p>

</div>





<div className="bg-[#0c0f1d] border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden">

<div className="flex justify-between items-start">

<p className="text-xs text-slate-400">
Business Profit
</p>

<span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs">
📈
</span>

</div>


<div className="text-2xl font-extrabold text-white">
${totalProfit.toFixed(2)}
</div>


<p className="text-[10px] text-slate-400">
Net earnings
</p>

</div>



</div>

);

}
