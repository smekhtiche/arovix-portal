"use client";

import { PartnerTier } from "../../data/partners";
import { Agent } from "../../data/agents";

interface CreatePartnerCardProps {
shopName: string;
shopEmail: string;
initialCredit: string;
tier: PartnerTier;
commission: number;
agents: Agent[];
selectedAgentId: string;
successMsg: string;
setShopName: (value: string) => void;
setShopEmail: (value: string) => void;
setInitialCredit: (value: string) => void;
setTier: (value: PartnerTier) => void;
setCommission: (value: number) => void;
setSelectedAgentId: (value: string) => void;
onSubmit: (e: React.FormEvent) => void;
}

export default function CreatePartnerCard({
shopName,
shopEmail,
initialCredit,
tier,
commission,
agents,
selectedAgentId,
successMsg,
setShopName,
setShopEmail,
setInitialCredit,
setTier,
setCommission,
setSelectedAgentId,
onSubmit,
}: CreatePartnerCardProps) {
return (
<div className="relative h-fit">
<div
className="absolute -inset-px rounded-[24px] opacity-40 blur-sm animate-[spin_22s_linear_infinite]"
style={{
background: "conic-gradient(from 0deg,#31dfff,#9d4fe0,#f5b94d,#31dfff)",
}}
/>

<div className="relative bg-[#070812]/90 backdrop-blur-xl p-6 rounded-[24px] border border-white/5 shadow-2xl">
<h2 className="text-lg font-bold text-[#31dfff] mb-5">
Create New Partner Account
</h2>

{successMsg && (
<div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs">
{successMsg}
</div>
)}

<form onSubmit={onSubmit} className="space-y-4">
<div>
<label className="block text-xs text-white/50 mb-1">
Agency / Shop Name
</label>
<input
required
type="text"
value={shopName}
placeholder="Agency / Shop Name"
onChange={(e) => setShopName(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">Email</label>
<input
required
type="email"
value={shopEmail}
placeholder="partner@arovix.io"
onChange={(e) => setShopEmail(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Initial Credit USD
</label>
<input
required
type="number"
value={initialCredit}
placeholder="500"
onChange={(e) => setInitialCredit(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
/>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Assigned Agent
</label>
<select
value={selectedAgentId}
onChange={(e) => setSelectedAgentId(e.target.value)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
>
{agents && agents.length > 0 ? (
agents.map((agent: any) => (
<option
key={agent.id}
value={agent.id}
className="bg-[#070812] text-white"
>
{agent.name || agent.full_name || "Unnamed Agent"}
</option>
))
) : (
<option value="" className="bg-[#070812] text-white">
No Agents Available
</option>
)}
</select>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Partner Tier
</label>
<select
value={tier}
onChange={(e) => setTier(e.target.value as PartnerTier)}
className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
>
<option value="Standard" className="bg-[#070812] text-white">Standard</option>
<option value="Silver" className="bg-[#070812] text-white">Silver</option>
<option value="Gold" className="bg-[#070812] text-white">Gold</option>
<option value="Platinum" className="bg-[#070812] text-white">Platinum</option>
<option value="Elite" className="bg-[#070812] text-white">Elite</option>
</select>
</div>

<div>
<label className="block text-xs text-white/50 mb-1">
Partner Commission %
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
Create Account
</button>
</form>
</div>
</div>
);
}

