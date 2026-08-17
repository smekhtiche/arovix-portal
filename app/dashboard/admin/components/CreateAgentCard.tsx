"use client";

interface CreateAgentCardProps {
agentName: string;
agentEmail: string;
country: string;
commission: number;
successMsg: string;

setAgentName: (value: string) => void;
setAgentEmail: (value: string) => void;
setCountry: (value: string) => void;
setCommission: (value: number) => void;

onSubmit: (e: React.FormEvent) => void;
}

export default function CreateAgentCard({
agentName,
agentEmail,
country,
commission,
successMsg,
setAgentName,
setAgentEmail,
setCountry,
setCommission,
onSubmit,
}: CreateAgentCardProps) {
return (
<div className="relative h-fit">
<div
className="absolute -inset-px rounded-[24px] opacity-40 blur-sm"
style={{
background:
"conic-gradient(from 0deg,#31dfff,#9d4fe0,#f5b94d,#31dfff)",
}}
/>

<div className="relative bg-[#070812]/90 backdrop-blur-xl p-6 rounded-[24px] border border-white/5 shadow-2xl">
<h2 className="text-lg font-bold text-[#31dfff] mb-5">
Create New Agent Account
</h2>

{successMsg && (
<div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs">
{successMsg}
</div>
)}

<form onSubmit={onSubmit} className="space-y-4">
<div>
<label className="block text-xs text-white/50 mb-1">
Agent Name
</label>
<input
required
type="text"
value={agentName}
placeholder="Agent Name"
onChange={(e) => setAgentName(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Email
</label>
<input
required
type="email"
value={agentEmail}
placeholder="agent@arovix.io"
onChange={(e) => setAgentEmail(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Country
</label>
<input
required
type="text"
value={country}
placeholder="Country"
onChange={(e) => setCountry(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Agent Commission %
</label>
<input
type="number"
value={commission}
min={0}
max={100}
onChange={(e) => setCommission(Number(e.target.value))}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<button
type="submit"
className="w-full py-3 rounded-xl font-bold text-black"
style={{
background: "linear-gradient(135deg,#31dfff,#9d4fe0)",
}}
>
Create Agent Account
</button>
</form>
</div>
</div>
);
}

