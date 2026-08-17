"use client";

interface AgentHeaderProps {
agentName: string;
country: string;
commission: number;
}

export default function AgentHeader({
agentName,
country,
commission,
}: AgentHeaderProps) {
return (
<div className="relative">

<div
className="absolute -inset-px rounded-[24px] opacity-40 blur-sm animate-[spin_22s_linear_infinite]"
style={{
background:
"conic-gradient(from 0deg,#31dfff,#9d4fe0,#f5b94d,#31dfff)",
}}
/>

<div className="relative bg-[#070812]/90 backdrop-blur-xl rounded-[24px] border border-white/5 p-6 shadow-2xl">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

<div>

<h1 className="text-2xl font-bold text-[#31dfff]">
Agent Dashboard
</h1>

<p className="text-slate-400 mt-2">
Welcome back,
</p>

<h2 className="text-xl font-semibold text-white mt-1">
{agentName}
</h2>

</div>

<div className="flex gap-4">

<div className="bg-black/30 border border-white/10 rounded-xl px-5 py-3 text-center">

<div className="text-xs text-slate-400">
Country
</div>

<div className="text-white font-semibold mt-1">
{country}
</div>

</div>

<div className="bg-black/30 border border-white/10 rounded-xl px-5 py-3 text-center">

<div className="text-xs text-slate-400">
Commission
</div>

<div className="text-[#31dfff] font-bold mt-1">
{commission}%
</div>

</div>

</div>

</div>

</div>

</div>
);
}
