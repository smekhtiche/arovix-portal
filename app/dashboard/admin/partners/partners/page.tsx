"use client";

import { useParams } from "next/navigation";

export default function PartnerDetailsPage() {
const { id } = useParams();

const companyInfo = [
{ label: "Company Name", value: "—" },
{ label: "Email", value: "—" },
{ label: "Country", value: "—" },
{ label: "Shop ID", value: "—" },
{ label: "Partner Tier", value: "—" },
{ label: "Status", value: "—" },
];

const creditInfo = [
{ label: "Current Balance", value: "—" },
{ label: "Total Orders", value: "—" },
{ label: "Total Sales", value: "—" },
];

return (
<div className="min-h-screen bg-[#02030a] text-white relative overflow-hidden">
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

<div className="relative max-w-7xl mx-auto p-6 md:p-8">
{/* Header */}
<div className="mb-8 animate-[fadeUp_0.5s_ease-out_forwards] opacity-0">
<div className="flex items-center gap-2 mb-2">
<span className="px-2.5 py-1 rounded-full bg-[#31dfff]/10 text-[#31dfff] border border-[#31dfff]/20 text-[10px] font-mono tracking-wider">
AROVIX ADMIN PANEL
</span>
</div>
<h1
className="text-2xl md:text-3xl font-bold tracking-tight"
style={{ fontFamily: "'Space Grotesk', sans-serif" }}
>
Partner Details
</h1>
<p className="text-sm text-white/50 mt-1.5 font-mono">
Partner ID: <span className="text-[#31dfff]">{id}</span>
</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Company Information */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 animate-[fadeUp_0.5s_ease-out_0.1s_forwards] opacity-0">
<h2 className="text-[#31dfff] font-bold text-sm uppercase tracking-wider mb-4">
Company Information
</h2>
<div className="space-y-3">
{companyInfo.map((item) => (
<div key={item.label} className="flex justify-between items-center text-sm">
<span className="text-white/40">{item.label}</span>
<span className="text-white font-medium">{item.value}</span>
</div>
))}
</div>
</div>

{/* Business Credit */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 animate-[fadeUp_0.5s_ease-out_0.15s_forwards] opacity-0">
<h2 className="text-[#31dfff] font-bold text-sm uppercase tracking-wider mb-4">
Business Credit
</h2>
<div className="space-y-3">
{creditInfo.map((item) => (
<div key={item.label} className="flex justify-between items-center text-sm">
<span className="text-white/40">{item.label}</span>
<span className="text-emerald-400 font-medium">{item.value}</span>
</div>
))}
</div>
</div>

{/* Admin Actions */}
<div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 animate-[fadeUp_0.5s_ease-out_0.2s_forwards] opacity-0">
<h2 className="text-[#31dfff] font-bold text-sm uppercase tracking-wider mb-4">
Admin Actions
</h2>

<div className="space-y-3">
<button className="w-full py-2.5 rounded-xl bg-[#31dfff] text-black font-bold text-sm hover:opacity-90 transition-opacity">
Issue eSIM
</button>

<button className="w-full py-2.5 rounded-xl bg-[#f5b94d] text-black font-bold text-sm hover:opacity-90 transition-opacity">
Top Up Credit
</button>

<button className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-colors">
Freeze Partner
</button>

<button className="w-full py-2.5 rounded-xl bg-[#9d4fe0] text-white font-bold text-sm hover:opacity-90 transition-opacity">
Reset Password
</button>
</div>
</div>
</div>
</div>

<style jsx global>{`
@keyframes fadeUp {
from {
opacity: 0;
transform: translateY(12px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
`}</style>
</div>
);
}


