"use client";

interface AgentStatsProps {
partners: number;
orders: number;
sales: number;
commission: number;
}


export default function AgentStats({
partners,
orders,
sales,
commission,
}: AgentStatsProps) {


return (

<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">


<div className="bg-[#070812]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">

<p className="text-xs text-slate-400">
Partners
</p>

<h2 className="text-2xl font-bold text-white mt-2">
{partners}
</h2>

</div>



<div className="bg-[#070812]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">

<p className="text-xs text-slate-400">
Orders
</p>

<h2 className="text-2xl font-bold text-white mt-2">
{orders}
</h2>

</div>




<div className="bg-[#070812]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">

<p className="text-xs text-slate-400">
Network Sales
</p>

<h2 className="text-2xl font-bold text-[#f5b94d] mt-2">
${sales.toFixed(2)}
</h2>

</div>





<div className="bg-[#070812]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">

<p className="text-xs text-slate-400">
Your Commission
</p>

<h2 className="text-2xl font-bold text-emerald-400 mt-2">
${commission.toFixed(2)}
</h2>

</div>


</div>

);

}
